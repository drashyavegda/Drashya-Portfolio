#!/usr/bin/env node
/**
 * Minimal Supabase-compatible mock (Auth + PostgREST + Storage) used to
 * end-to-end test the portfolio's Supabase mode WITHOUT real credentials.
 *
 * It implements exactly the REST endpoints `supabase-js` calls:
 *   - POST /auth/v1/token?grant_type=password   (signInWithPassword)
 *   - GET  /auth/v1/user                        (getUser)
 *   - GET/POST/PATCH/DELETE/HEAD /rest/v1/<table>  (select/insert/upsert/update/delete/count)
 *   - POST /storage/v1/bucket                   (createBucket — 409 when it already exists)
 *   - POST /storage/v1/object/<bucket>/<key>    (upload)
 *   - DELETE /storage/v1/object/<bucket>        (remove, body {prefixes:[...]})
 *   - GET /storage/v1/object/public/<bucket>/<key>  (public file serving)
 *
 * Dev/test tool only — NOT used by the deployed website.
 * Usage: node scripts/mock-supabase.js [port]   (default 54399)
 * Env:   MOCK_ADMIN_EMAIL / MOCK_ADMIN_PASSWORD (default admin@example.com / mockpass123)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2] || 54399);
const FILES_DIR = process.env.MOCK_FILES_DIR || '/tmp/mock-supabase-files';
const ADMIN_EMAIL = process.env.MOCK_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.MOCK_ADMIN_PASSWORD || 'mockpass123';
const ACCESS_TOKEN = 'mock-access-token-0123456789';

fs.rmSync(FILES_DIR, { recursive: true, force: true });
fs.mkdirSync(FILES_DIR, { recursive: true });

/** In-memory tables (id -> row). Empty at boot: the app self-seeds via ensureSeeded(). */
const tables = new Map();
const buckets = new Set();
let analyticsSeq = 0;

const table = (name) => {
  if (!tables.has(name)) tables.set(name, new Map());
  return tables.get(name);
};

const json = (res, code, data, headers = {}) => {
  const body = data === undefined ? '' : JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers });
  res.end(body);
};

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function sortRows(rows, orderParam) {
  if (!orderParam) return rows;
  const parts = orderParam.split(',').map((p) => {
    const [col, dir] = p.split('.');
    return { col, desc: dir === 'desc' };
  });
  return [...rows].sort((a, b) => {
    for (const { col, desc } of parts) {
      const av = a[col] ?? '';
      const bv = b[col] ?? '';
      if (av === bv) continue;
      return (av > bv ? 1 : -1) * (desc ? -1 : 1);
    }
    return 0;
  });
}

async function handleRest(req, res, url) {
  const name = url.pathname.replace('/rest/v1/', '').split('/')[0];
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    console.log(`[mock] REST ${req.method} ${url.pathname}${url.search || ''}`);
  }
  const params = url.searchParams;
  const t = name === 'rpc' ? null : table(name);
  const prefer = String(req.headers['prefer'] || '');

  if (name === 'rpc') return json(res, 404, { message: `Unknown rpc ${params.get('fn') || url.pathname}` });

  if (req.method === 'GET' || req.method === 'HEAD') {
    if (name === 'site_state') {
      console.log(`[mock] site_state ${req.method} accept="${req.headers['accept']}" search="${url.search}" prefer="${req.headers['prefer'] || ''}"`);
    }
    let rows = Array.from(t.values());
    const idEq = params.get('id');
    if (idEq && idEq.startsWith('eq.')) rows = rows.filter((r) => String(r.id) === idEq.slice(3));
    rows = sortRows(rows, params.get('order'));
    const limit = params.get('limit');
    if (limit) rows = rows.slice(0, Number(limit));

    if (req.method === 'HEAD' || prefer.includes('count=exact')) {
      res.writeHead(200, { 'Content-Range': `*/${rows.length}`, 'Content-Type': 'application/json' });
      return res.end(req.method === 'HEAD' ? undefined : JSON.stringify(rows));
    }
    const wantsObject = String(req.headers['accept'] || '').includes('vnd.pgrst.object');
    if (wantsObject) {
      if (rows.length === 1) return json(res, 200, rows[0]);
      return json(res, 406, {
        code: 'PGRST116',
        message: 'JSON object requested, multiple (or no) rows returned',
        details: `${rows.length} rows`,
        hint: null,
      });
    }
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    const body = JSON.parse((await readBody(req)).toString('utf8') || 'null');
    const incoming = Array.isArray(body) ? body : [body];
    const out = [];
    const isUpsert = prefer.includes('resolution=merge-duplicates');
    for (const row of incoming) {
      const id = String(row.id ?? (name === 'analytics_events' ? ++analyticsSeq : cryptoId()));
      const existing = t.get(id);
      if (existing && !isUpsert) {
        // Real PostgREST rejects plain inserts with duplicate primary keys (23505).
        return json(res, 409, {
          code: '23505',
          message: `duplicate key value violates unique constraint "${name}_pkey"`,
          details: `Key (id)=(${id}) already exists.`,
          hint: null,
        });
      }
      const merged = existing ? { ...existing, ...row, id } : { ...row, id };
      t.set(id, merged);
      out.push(merged);
    }
    return json(res, prefer.includes('return=representation') ? 200 : 201, prefer.includes('return=representation') ? out : []);
  }

  if (req.method === 'PATCH') {
    const body = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    const idEq = params.get('id');
    const out = [];
    for (const [id, row] of t.entries()) {
      if (idEq && idEq.startsWith('eq.') && String(row.id) !== idEq.slice(3)) continue;
      const updated = { ...row, ...body };
      t.set(id, updated);
      out.push(updated);
    }
    return json(res, 200, prefer.includes('return=representation') ? out : []);
  }

  if (req.method === 'DELETE') {
    const idEq = params.get('id');
    const out = [];
    for (const [id, row] of t.entries()) {
      if (idEq && idEq.startsWith('eq.') && String(row.id) !== idEq.slice(3)) continue;
      t.delete(id);
      out.push(row);
    }
    return json(res, 200, prefer.includes('return=representation') ? out : []);
  }

  return json(res, 405, { message: 'Method not allowed' });
}

function cryptoId() {
  return `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleStorage(req, res, url) {
  const seg = url.pathname.replace('/storage/v1/', '').split('/');

  // POST /storage/v1/bucket
  if (req.method === 'POST' && seg[0] === 'bucket') {
    const body = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    const id = String(body.id || body.name || '');
    if (buckets.has(id)) {
      return json(res, 409, { statusCode: '409', error: 'Duplicate', message: `The resource already exists` });
    }
    buckets.add(id);
    fs.mkdirSync(path.join(FILES_DIR, id), { recursive: true });
    console.log(`[mock] storage bucket created: ${id} (public=${Boolean(body.public)})`);
    return json(res, 200, { name: id });
  }

  // GET /storage/v1/bucket/:id
  if (req.method === 'GET' && seg[0] === 'bucket' && seg[1]) {
    if (!buckets.has(seg[1])) return json(res, 404, { statusCode: '404', error: 'Not Found', message: 'Bucket not found' });
    return json(res, 200, { id: seg[1], name: seg[1], public: true });
  }

  // GET /storage/v1/object/public/:bucket/:key...
  if (req.method === 'GET' && seg[0] === 'object' && seg[1] === 'public') {
    const bucket = seg[2];
    const key = decodeURIComponent(seg.slice(3).join('/'));
    const file = path.join(FILES_DIR, bucket, key);
    if (!file.startsWith(FILES_DIR) || !fs.existsSync(file)) {
      return json(res, 404, { statusCode: '404', error: 'Not Found', message: 'Object not found' });
    }
    const ext = path.extname(file).toLowerCase();
    const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Content-Length': fs.statSync(file).size });
    return fs.createReadStream(file).pipe(res);
  }

  // POST /storage/v1/object/:bucket/:key...  (upload — bucket is seg[1], key is the rest)
  if (req.method === 'POST' && seg[0] === 'object' && seg[1]) {
    const bucket = seg[1];
    const key = decodeURIComponent(seg.slice(2).join('/'));
    if (!buckets.has(bucket)) return json(res, 404, { statusCode: '404', error: 'Not Found', message: 'Bucket not found' });
    const data = await readBody(req);
    const file = path.join(FILES_DIR, bucket, key);
    if (!file.startsWith(path.join(FILES_DIR, bucket))) return json(res, 400, { message: 'Invalid key' });
    if (fs.existsSync(file)) return json(res, 409, { statusCode: '409', error: 'Duplicate', message: 'The resource already exists' });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, data);
    console.log(`[mock] storage upload: ${bucket}/${key} (${data.length} bytes, ${req.headers['content-type'] || '?'})`);
    return json(res, 200, { Key: `${bucket}/${key}` });
  }

  // DELETE /storage/v1/object/:bucket  (remove — body {prefixes:[...]})
  if (req.method === 'DELETE' && seg[0] === 'object' && seg[1]) {
    const bucket = seg[1];
    const body = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    const prefixes = Array.isArray(body.prefixes) ? body.prefixes : [];
    const removed = [];
    for (const key of prefixes) {
      const file = path.join(FILES_DIR, bucket, decodeURIComponent(key));
      if (file.startsWith(path.join(FILES_DIR, bucket)) && fs.existsSync(file)) {
        fs.rmSync(file);
        console.log(`[mock] storage deleted: ${bucket}/${key}`);
        removed.push({ name: key });
      }
    }
    return json(res, 200, removed);
  }

  return json(res, 404, { statusCode: '404', error: 'Not Found', message: `Unsupported storage path ${url.pathname}` });
}

async function handleAuth(req, res, url) {
  // POST /auth/v1/token?grant_type=password
  if (req.method === 'POST' && url.pathname === '/auth/v1/token') {
    const body = JSON.parse((await readBody(req)).toString('utf8') || '{}');
    if (body.email === ADMIN_EMAIL && body.password === ADMIN_PASSWORD) {
      return json(res, 200, {
        access_token: ACCESS_TOKEN,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: { id: 'mock-admin-user', email: ADMIN_EMAIL, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
      });
    }
    return json(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials' });
  }

  // GET /auth/v1/user
  if (req.method === 'GET' && url.pathname === '/auth/v1/user') {
    const auth = String(req.headers['authorization'] || '');
    if (auth === `Bearer ${ACCESS_TOKEN}`) {
      return json(res, 200, {
        id: 'mock-admin-user',
        email: ADMIN_EMAIL,
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      });
    }
    return json(res, 401, { msg: 'invalid token', error: 'invalid_token', error_description: 'invalid token' });
  }

  return json(res, 404, { error: 'not_found', error_description: `Unsupported auth path ${url.pathname}` });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  console.log(`[mock] REQ ${new Date().toISOString().slice(11, 23)} ${req.method} ${url.pathname}${url.search || ''} accept="${req.headers['accept'] || ''}"`);
  try {
    if (url.pathname.startsWith('/rest/v1/')) return await handleRest(req, res, url);
    if (url.pathname.startsWith('/storage/v1/')) return await handleStorage(req, res, url);
    if (url.pathname.startsWith('/auth/v1/')) return await handleAuth(req, res, url);
    if (url.pathname === '/health') return json(res, 200, { ok: true, mock: 'supabase' });
    return json(res, 404, { message: `Mock does not implement ${req.method} ${url.pathname}` });
  } catch (err) {
    console.error('[mock] error:', err);
    return json(res, 500, { message: String(err && err.message) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[mock] Supabase-compatible mock listening on http://127.0.0.1:${PORT}`);
  console.log(`[mock] admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}; files: ${FILES_DIR}`);
});

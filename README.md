# Drashya Vegda — Premium Interactive Developer Portfolio

A complete, production-ready personal portfolio platform for **Drashya Vegda** (IT Engineering Student · Aspiring AI & Software Developer), built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**, featuring a **secure Admin Dashboard (CMS)**, interactive developer workspace, terminal, AI portfolio assistant, multilingual blog, GitHub integration, and privacy-friendly analytics.

> **Design direction:** Futuristic Developer — deep black/charcoal backgrounds, neon blue & purple accents, glassmorphism, subtle glows, smooth motion, dark/light themes, custom cursor, optional interaction sounds.

---

## ✨ Feature Overview

### Public website
| Feature | Details |
|---|---|
| **Hero** | Animated name, typewriter roles, availability badge, social links, copy-email, interactive **CSS-3D developer workspace** (mouse-responsive depth, floating tech tiles, particles) with static fallback for reduced-motion/touch |
| **About** | Story, qualities, career goals, interests, education summary card, **vertical education timeline** |
| **Skills** | Interactive dashboard with category filters and honest "learning" badges — **no fake percentages** |
| **Projects** | Featured/other sections, category filters, **individual case-study pages** (`/projects/[slug]`), Live Demo / GitHub buttons (shown only when real URLs exist), "Explore All Projects on Vercel" |
| **Developer Workspace** | Code-editor UI with C++ / Java / JavaScript examples, syntax highlighting, **safe predefined "Run Example"** outputs (no visitor code is ever executed), copy-code |
| **Interactive Terminal** | `help`, `whoami`, `skills`, `projects`, `education`, `hackathons`, `blog`, `resume`, `contact`, `socials`, `clear` + Tab autocomplete, history, typing animation, Easter eggs (`sudo hire-drashya`, `rm -rf /`, `coffee`, `dv`, …) |
| **GitHub section** | Real public API data via a cached server proxy — repos, languages, stars; honest loading/error/rate-limit states; **never fabricates stats** |
| **Hackathons** | "Hackathons & Innovation Journey" — verified participation only, status badges distinguish participation from winning |
| **Certificates** | Participation certificates (PDF/JPG/PNG, View + Download) and **Learning topics clearly separated from certifications** |
| **Blog** | Multilingual (**English / हिन्दी / ગુજરાતી**), search + category + language filters, article pages, Markdown with code blocks, per-post SEO |
| **AI Portfolio Assistant** | Floating chatbot grounded in verified portfolio data; uses OpenAI/Gemini when a server-side key exists, otherwise an honest built-in knowledge engine that **refuses to invent facts** |
| **Contact** | Validated form, honeypot + rate limiting, real delivery via Resend (optional) **and** guaranteed save to the private admin inbox — success messages are never faked |
| **Testimonials** | Admin-managed; tasteful honest empty state until genuine feedback is added |
| **UX polish** | DV branded loader (capped, session-once), glowing custom cursor (desktop only, reduced-motion aware), optional subtle Web-Audio sounds (**off by default**), dark/light theme with persistence, back-to-top, fully responsive, semantic HTML, visible focus states, skip link |
| **SEO** | Metadata API, Open Graph/Twitter cards, canonical URLs, `sitemap.xml`, `robots.txt`, JSON-LD (Person, BlogPosting), per-project & per-post SEO fields |

### Admin Dashboard (`/admin`) — private CMS
- **Secure auth**: Supabase Auth (recommended) or local env-credential sessions (signed httpOnly HMAC cookies). No hardcoded passwords, no secrets in client code. Every `/api/admin/*` route is server-side authorized; all writes validated.
- **Sections**: Dashboard overview + setup checklist · Profile · Skills · Projects (incl. case studies, screenshots, featured, ordering, SEO) · Certificates · Hackathons · Education (timeline, achievements, coursework) · Blog (rich editor + **local autosave drafts**) · Resume (PDF upload/replace/remove) · Testimonials · Messages inbox · Analytics · Site Settings (socials, availability badge, SEO, integration status).
- **Uploads**: certificates, screenshots, cover images, avatar, resume — type- and size-validated.
- **Persistence**: all changes are stored in the database and appear on the public site **immediately, without redeployment**.
- **Analytics**: privacy-friendly aggregate counts (visits, popular projects/sections/articles, device categories) — no IPs, no cookies, no personal data.

---

## 🧱 Tech Stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript** (strict)
- **Tailwind CSS** (custom design-token system, dark/light via CSS variables)
- **Framer Motion** (scroll reveals) · **Lucide React** (icons)
- **Supabase** (PostgreSQL + Auth + Storage) — recommended production backend
- **Local JSON store** — zero-config fallback for development/demo
- Lightweight by design: no Three.js bundle (pure CSS 3D), no heavyweight syntax highlighter, no markdown library — custom minimal implementations keep First Load JS ≈ 156 kB for the home page.

---

## 🚀 Quick Start (local development)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    → set at minimum: ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET

# 3. Run the dev server
npm run dev
#    → http://localhost:3000        (public site)
#    → http://localhost:3000/admin  (admin dashboard)
```

**First run:** the local store creates `data/content.json` from the built-in seed (Drashya's verified information). All content is editable from `/admin`.

### Admin login (local/demo mode)
Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env.local`.
These values live **server-side only** and are never shipped to the browser.

---

## 🔐 Supabase Setup (recommended for production)

Without Supabase the app uses the local JSON store — perfect for development, but **ephemeral on Vercel**. For real persistence:

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the entire [`supabase/schema.sql`](supabase/schema.sql) file.
   This creates all tables, Row Level Security policies, and the public storage buckets:
   **`certificates`** (certificate PDF/JPG/PNG files) and **`uploads`** (screenshots, resume,
   avatars, blog covers). Both inserts are idempotent — existing buckets are never duplicated.
   If `SUPABASE_SERVICE_ROLE_KEY` is configured, the app also **auto-creates each bucket on
   first upload**, so this step is a safety net rather than a hard requirement.
3. Create the admin user: **Authentication → Users → Add user** (email + password, e.g. Drashya's Gmail).
4. Copy the keys: **Project Settings → API**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret — server-side only)
5. Add them to `.env.local` and restart the dev server. The store switches to Supabase automatically and self-seeds the starter content on first read.
6. (Optional) To seed from the CLI instead:
   ```bash
   set -a; source .env.local; set +a
   npx tsx scripts/seed-supabase.ts
   ```

**Admin login in Supabase mode** uses the Supabase Auth user created in step 3 (session cookie stores the Supabase access token; verified server-side on every request).

---

## 🔌 Optional Integrations (graceful fallbacks included)

| Integration | Env vars | Without it… |
|---|---|---|
| **AI assistant (OpenAI)** | `OPENAI_API_KEY`, `OPENAI_MODEL` | Built-in verified-knowledge engine answers (never invents facts) |
| **AI assistant (Gemini)** | `GEMINI_API_KEY`, `GEMINI_MODEL` | Same fallback |
| **Contact email delivery (Resend)** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Messages are still saved to the admin inbox; the UI says exactly what happened |
| **GitHub higher rate limits** | `GITHUB_PERSONAL_TOKEN` (no scopes needed) | Public API with 10-min server cache + stale-on-rate-limit |

All secrets are read **only in server-side route handlers** — never exposed to the client.

---

## ▲ Deploy to Vercel

1. Push this repository to GitHub (**never commit `.env.local`** — it is gitignored).
2. In [Vercel](https://vercel.com), **Add New → Project → Import** the repository (framework auto-detected: Next.js).
3. Add environment variables (**Project → Settings → Environment Variables**, then redeploy):
   - `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://drashya-portfolio-v2.vercel.app`)
   - ⚠ **Required for persistence + certificate uploads on Vercel** (Project Settings → API):
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://<project-ref>.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the `anon` `public` key
     - `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` key (secret — server-side only; enables writes, uploads and automatic bucket creation)
   - Optional: `OPENAI_API_KEY` / `GEMINI_API_KEY`, `RESEND_API_KEY` + `RESEND_FROM_EMAIL`, `GITHUB_PERSONAL_TOKEN`
4. Deploy. Then sign in at `https://your-domain/admin` using the Supabase admin user.
5. Upload the resume, certificate files, project screenshots, and set the availability badge from the dashboard.

> **Note on local mode + Vercel:** the app still *works* (great for demos), but edits/uploads/messages are lost when the serverless filesystem resets. The admin dashboard shows a visible warning banner in this situation.

---

## 📁 Project Structure

```
app/
  (site)/                  # Public site (navbar + footer shell)
    page.tsx               # Home: hero → about → skills → projects → workspace
                           #       → github → experience → certificates
                           #       → terminal → blog → testimonials → contact
    blog/page.tsx          # Blog index (search, category & language filters)
    blog/[slug]/page.tsx   # Article page (Markdown, JSON-LD, SEO)
    projects/[slug]/page.tsx # Project case-study page
  admin/
    page.tsx               # Dashboard (auth-gated, 13 management panels)
    login/page.tsx
  api/
    ai/                    # Chatbot (OpenAI/Gemini or honest fallback engine)
    auth/login, logout/    # Admin sessions (signed httpOnly cookies)
    admin/…                # Auth-protected CRUD, uploads, messages, analytics
    contact/               # Validated, rate-limited, honeypot-protected
    github/                # Cached GitHub proxy with rate-limit resilience
    track/                 # Privacy-friendly analytics ingestion
  sitemap.ts · robots.ts · not-found.tsx · globals.css (design system)
components/
  sections/                # Hero, About, Skills, Projects, Workspace, Terminal,
                           # GitHub, Experience, Certificates, Blog, Testimonials, Contact
  ui/                      # Navbar, Footer, Chatbot, Loader, Cursor, Theme/Sound
                           # toggles, Reveal, AvailabilityBadge, trackers
  admin/                   # Dashboard shell + 13 panels + shared form primitives
lib/
  db/                      # Store interface · local JSON store · Supabase store
  ai/knowledge.ts          # LLM system prompt builder + rule-based fallback engine
  auth.ts · ratelimit.ts · validation.ts · markdown.ts · highlight.ts · utils.ts
supabase/schema.sql        # Tables + RLS + storage bucket
scripts/seed-supabase.ts   # CLI seeder
data/                      # Runtime local store (gitignored)
public/uploads/            # Runtime uploads in local mode (gitignored)
```

---

## 🧪 Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checked) |
| `npm start` | Serve production build |
| `npm run typecheck` | TypeScript validation |
| `npm run db:seed` | Seed Supabase from the CLI |

---

## 🤝 Honesty Policy (built into the product)

Per the project brief, the platform is designed to **never fabricate**:

- No invented awards, rankings, CGPA/SPI, work experience or testimonials.
- No fake skill percentages — skills carry honest descriptions and "learning" badges.
- Learning topics are displayed separately from completed certifications.
- Participation vs. winning is explicitly distinguished for every hackathon.
- Missing project links/screenshots/technologies show honest "pending" states instead of broken buttons; the Download Resume button only appears once a real PDF is uploaded.
- The AI assistant answers only from verified portfolio data and says so when information is unavailable.
- GitHub stats come exclusively from the real public API (empty state on failure).
- Contact-form success messages reflect what actually happened (emailed vs. saved to inbox).
- Analytics show real recorded numbers only.

---

## 🩺 Troubleshooting

### “Application error: a server-side exception has occurred” on Vercel
This happened with the **first zip**: the local JSON store tried to create its `data/` folder on Vercel’s **read-only filesystem**, which crashed every server-rendered page.

**Fixed in this version.** The local store now probes storage in three tiers and never crashes:
1. `data/` on disk — normal local development (durable);
2. `/tmp/dv-portfolio-data` — read-only hosts like Vercel (edits persist per warm server instance);
3. in-memory — last resort if nothing is writable.

Verify any deployment instantly at **`https://<your-app>/api/health`** — it reports the active storage tier.
Notes for Vercel without Supabase:
- Content edits from `/admin` work, but live in the instance’s temp storage and reset on redeploy/scale-out (the dashboard shows a warning banner).
- **File uploads** (resume, certificates, screenshots) require Supabase Storage on serverless; the API returns a clear message instead of failing silently.
- **For permanent production storage, connect Supabase** (steps above) — then everything, including uploads, persists in PostgreSQL/Storage.
- **Certificate uploads** go to the dedicated public **`certificates`** bucket (auto-created on first upload with `SUPABASE_SERVICE_ROLE_KEY`, or create it manually: Storage → New bucket → name `certificates` → Public). Allowed types: PDF, JPG, JPEG, PNG (WebP accepted too); max 10 MB. Deleting a certificate in `/admin` also removes its storage file.

### Admin login says “not configured”
Local/demo mode needs `ADMIN_EMAIL`, `ADMIN_PASSWORD` (and ideally `AUTH_SECRET`) in your environment — on Vercel add them under **Project → Settings → Environment Variables**, then redeploy. With Supabase configured, log in with the Supabase Auth user instead.

### GitHub section shows “unavailable”
The public GitHub API rate-limits unauthenticated requests (60/h per IP). The proxy caches for 10 minutes and serves stale data on rate-limit; add `GITHUB_PERSONAL_TOKEN` for a much higher quota.

---

## 📄 Environment Variables Reference

See [`.env.example`](.env.example) for the full annotated list:
`NEXT_PUBLIC_SITE_URL` · `ADMIN_EMAIL` · `ADMIN_PASSWORD` · `AUTH_SECRET` · `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` · `OPENAI_API_KEY` / `OPENAI_MODEL` · `GEMINI_API_KEY` / `GEMINI_MODEL` · `RESEND_API_KEY` / `RESEND_FROM_EMAIL` · `GITHUB_PERSONAL_TOKEN` / `GITHUB_USERNAME`.

---

Built with care for Drashya Vegda · `“Building the future, one line of code at a time.”`

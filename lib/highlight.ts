/**
 * Lightweight regex-based syntax highlighter for the predefined workspace
 * examples and blog code blocks. No external dependency; input is escaped.
 */

const COMMON_KEYWORDS = [
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'function', 'const', 'let', 'var', 'new', 'class', 'extends',
  'import', 'from', 'export', 'default', 'try', 'catch', 'finally', 'throw',
  'typeof', 'instanceof', 'in', 'of', 'async', 'await', 'yield', 'this',
  'super', 'static', 'public', 'private', 'protected', 'void', 'null',
  'nullptr', 'true', 'false', 'using', 'namespace', 'template', 'typename',
  'struct', 'enum', 'interface', 'package', 'implements', 'final', 'throws',
  'include', 'define', 'println',
];

const TYPE_WORDS = [
  'int', 'float', 'double', 'char', 'bool', 'boolean', 'long', 'short',
  'unsigned', 'signed', 'string', 'String', 'vector', 'map', 'set', 'array',
  'Array', 'Object', 'Number', 'console', 'System', 'out', 'Integer', 'Math',
  'JSON', 'Promise', 'List', 'ArrayList', 'HashMap', 'auto', 'size_t',
];

const KEYWORDS = new Set(COMMON_KEYWORDS);
const TYPES = new Set(TYPE_WORDS);

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlight(code: string, _lang?: string): string {
  // Order matters: comments → strings → preprocessor → numbers → words → punctuation
  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[a-z_]+[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([{}()[\];,.:+\-*/%=<>!&|?~^@]+)/g;

  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(code)) !== null) {
    out += escapeHtml(code.slice(last, m.index));
    const [full, comment, str, num, word, punct] = m;
    if (comment) {
      out += `<span class="tok-comment">${escapeHtml(full)}</span>`;
    } else if (str) {
      out += `<span class="tok-string">${escapeHtml(full)}</span>`;
    } else if (num) {
      out += `<span class="tok-number">${escapeHtml(full)}</span>`;
    } else if (word) {
      const nextChar = code[pattern.lastIndex] || '';
      if (KEYWORDS.has(word)) {
        out += `<span class="tok-keyword">${escapeHtml(word)}</span>`;
      } else if (TYPES.has(word)) {
        out += `<span class="tok-type">${escapeHtml(word)}</span>`;
      } else if (nextChar === '(') {
        out += `<span class="tok-fn">${escapeHtml(word)}</span>`;
      } else {
        out += escapeHtml(word);
      }
    } else if (punct) {
      out += `<span class="tok-punct">${escapeHtml(punct)}</span>`;
    } else {
      out += escapeHtml(full);
    }
    last = m.index + full.length;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

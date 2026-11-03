/**
 * Minimal, safe Markdown → HTML renderer for blog posts.
 * All input is HTML-escaped first, so author content can never inject scripts.
 * Supports: headings, fenced code blocks, inline code, bold, italic,
 * blockquotes, ordered/unordered lists, links, images, paragraphs, hr.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy" class="rounded-xl my-4 max-w-full" />',
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

export function renderMarkdown(src: string): string {
  const lines = escapeHtml(src.replace(/\r\n/g, '\n')).split('\n');
  const out: string[] = [];
  let i = 0;
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      flushParagraph();
      flushList();
      const lang = fence[1] || '';
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      out.push(
        `<pre class="code-block" data-lang="${lang}"><code>${code.join('\n')}</code></pre>`,
      );
      continue;
    }

    if (/^\s*$/.test(line)) {
      flushParagraph();
      flushList();
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      flushParagraph();
      flushList();
      out.push('<hr />');
      i++;
      continue;
    }

    const quote = line.match(/^&gt;\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      const quoteLines: string[] = [quote[1]];
      i++;
      while (i < lines.length) {
        const q = lines[i].match(/^&gt;\s?(.*)$/);
        if (!q) break;
        quoteLines.push(q[1]);
        i++;
      }
      out.push(`<blockquote>${inline(quoteLines.join(' '))}</blockquote>`);
      continue;
    }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      flushParagraph();
      const wanted = ul ? 'ul' : 'ol';
      if (listType !== wanted) {
        flushList();
        out.push(`<${wanted}>`);
        listType = wanted;
      }
      out.push(`<li>${inline((ul ? ul[1] : ol![1]) as string)}</li>`);
      i++;
      continue;
    }

    flushList();
    paragraph.push(line.trim());
    i++;
  }
  flushParagraph();
  flushList();
  return out.join('\n');
}

export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

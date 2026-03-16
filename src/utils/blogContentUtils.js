/**
 * Blog content: blocks ↔ HTML conversion for admin editor and Supabase storage.
 */

export const blockId = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const escapeHtml = (s) => {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
};

// Simple inline formatter for blog content: **bold**, *italic*, ==accent==
const formatInline = (text) => {
  // First escape HTML, then apply lightweight markdown-style replacements
  let html = escapeHtml(text || '').replace(/\n/g, '<br />');
  // Bold: **tekst**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *tekst*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Accent: ==tekst== (green accent span)
  html = html.replace(/==(.+?)==/g, '<span class="blog-accent-inline">$1</span>');
  return html;
};

/** Build HTML from blocks for Supabase content column */
export const blocksToHtml = (blocks) => {
  return (blocks || [])
    .map((block) => {
      if (block.type === 'header') {
        const level = Math.min(6, Math.max(1, Number(block.level) || 2));
        return `<h${level}>${escapeHtml(block.text || '')}</h${level}>`;
      }
      if (block.type === 'image') {
        const raw = (block.path || '').trim();
        const src = raw.startsWith('/') ? raw : raw ? `/img/${raw.replace(/^\/?/, '')}` : '';
        if (!src) return '';
        return `<img src="${escapeHtml(src)}" alt="" />`;
      }
      if (block.type === 'text') {
        const variant = block.variant || 'normal';
        const className =
          variant === 'lead'
            ? 'blog-lead'
            : variant === 'small'
            ? 'blog-small'
            : variant === 'accent'
            ? 'blog-accent'
            : '';
        const open = className ? `<p class="${className}">` : '<p>';
        return `${open}${formatInline(block.text)}</p>`;
      }
      if (block.type === 'raw') {
        return block.rawContent || '';
      }
      return '';
    })
    .filter(Boolean)
    .join('\n') || '';
};

/**
 * Parse HTML string into blocks (for loading article into block editor).
 * Top-level h1–h6 → header, p → text, img → image; other elements → raw block.
 */
export const htmlToBlocks = (html) => {
  if (!html || typeof html !== 'string') return [];
  const doc = document.createElement('div');
  doc.innerHTML = html.trim();
  const blocks = [];
  const tag = (el) => (el && el.tagName ? el.tagName.toLowerCase() : '');
  for (const el of doc.children) {
    const t = tag(el);
    if (/^h[1-6]$/.test(t)) {
      const level = parseInt(t[1], 10);
      blocks.push({
        id: blockId(),
        type: 'header',
        level,
        text: el.textContent || '',
      });
    } else if (t === 'p') {
      const cls = (el.getAttribute('class') || '').split(/\s+/);
      let variant = 'normal';
      if (cls.includes('blog-lead')) variant = 'lead';
      else if (cls.includes('blog-small')) variant = 'small';
      else if (cls.includes('blog-accent')) variant = 'accent';
      blocks.push({
        id: blockId(),
        type: 'text',
        text: el.textContent || '',
        variant,
      });
    } else if (t === 'img') {
      let path = el.getAttribute('src') || '';
      path = path.replace(/^\/img\/?/, '');
      blocks.push({
        id: blockId(),
        type: 'image',
        path: path || 'Blog/',
      });
    } else {
      blocks.push({
        id: blockId(),
        type: 'raw',
        rawContent: el.outerHTML || '',
      });
    }
  }
  return blocks;
};

export const defaultBlock = (type) => {
  const id = blockId();
  if (type === 'header') return { id, type: 'header', level: 2, text: '' };
  if (type === 'image') return { id, type: 'image', path: 'Blog/' };
  if (type === 'text') return { id, type: 'text', text: '', variant: 'normal' };
  if (type === 'raw') return { id, type: 'raw', rawContent: '' };
  return { id, type: 'text', text: '' };
};

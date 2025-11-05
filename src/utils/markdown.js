import { marked } from 'marked';

// Configure marked for Reddit-style markdown
marked.setOptions({
  breaks: true, // Reddit converts line breaks to <br>
  gfm: true, // GitHub Flavored Markdown (supports tables, strikethrough, etc.)
  headerIds: false,
  mangle: false,
});

// Custom renderer to handle Reddit-specific markdown quirks
const renderer = new marked.Renderer();

// Override link rendering to add target="_blank" and rel attributes
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
};

// Override code blocks for better styling
renderer.code = function(code, language) {
  const lang = language ? ` class="language-${language}"` : '';
  return `<pre${lang}><code>${code}</code></pre>`;
};

// Override blockquote for Reddit-style quotes
renderer.blockquote = function(quote) {
  return `<blockquote class="reddit-quote">${quote}</blockquote>`;
};

marked.use({ renderer });

/**
 * Convert Reddit markdown to HTML
 * @param {string} text - The markdown text to convert
 * @returns {string} - The HTML output
 */
export function parseMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Reddit-specific preprocessing
  let processed = text;

  // Handle Reddit's spoiler tags: >!spoiler text!<
  processed = processed.replace(/&gt;!(.+?)!&lt;/g, '<span class="spoiler">$1</span>');
  processed = processed.replace(/>!(.+?)!</g, '<span class="spoiler">$1</span>');

  // Handle Reddit's superscript: ^text or ^(text with spaces)
  processed = processed.replace(/\^(\w+)/g, '<sup>$1</sup>');
  processed = processed.replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');

  // Parse markdown
  const html = marked.parse(processed);

  return html;
}

/**
 * Convert Reddit markdown to safe HTML (strips potentially unsafe content)
 * @param {string} text - The markdown text to convert
 * @returns {string} - The sanitized HTML output
 */
export function parseMarkdownSafe(text) {
  const html = parseMarkdown(text);
  
  // Basic XSS protection - remove script tags and on* attributes
  // For production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

/**
 * Decode HTML entities that Reddit API returns
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded text
 */
export function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}


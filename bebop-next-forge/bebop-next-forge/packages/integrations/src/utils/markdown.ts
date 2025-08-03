/**
 * Markdown processing utilities for content adaptation
 */

export interface MarkdownToHtmlOptions {
  allowedTags?: string[];
  removeImages?: boolean;
  baseUrl?: string;
}

/**
 * Convert markdown to HTML (basic implementation)
 * For production, consider using a library like markdown-it or remark
 */
export function markdownToHtml(
  markdown: string,
  options: MarkdownToHtmlOptions = {}
): string {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert images (unless disabled)
  if (options.removeImages) {
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
  } else {
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img alt="$1" src="$2" />'
    );
  }

  // Convert code blocks
  html = html.replace(/```(.*?)```/gms, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert line breaks
  html = html.replace(/\n/g, '<br>');

  return html.trim();
}

/**
 * Strip all markdown formatting and return plain text
 */
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove bold/italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Clean up whitespace
      .replace(/\n\s*\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Extract table of contents from markdown headers
 */
export function extractTableOfContents(
  markdown: string
): Array<{ level: number; text: string; slug: string }> {
  const headers: Array<{ level: number; text: string; slug: string }> = [];
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headerRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = createSlug(text);

    headers.push({ level, text, slug });
  }

  return headers;
}

/**
 * Create URL-friendly slug from text
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract first paragraph from markdown content
 */
export function extractFirstParagraph(markdown: string): string {
  // Remove headers first
  const withoutHeaders = markdown.replace(/^#{1,6}\s+.+$/gm, '');

  // Split by double newlines
  const paragraphs = withoutHeaders.split(/\n\s*\n/).filter((p) => p.trim());

  if (paragraphs.length === 0) {
    return '';
  }

  // Find first meaningful paragraph
  for (const paragraph of paragraphs) {
    const cleaned = stripMarkdown(paragraph.trim());
    if (cleaned.length > 50) {
      return cleaned;
    }
  }

  return stripMarkdown(paragraphs[0].trim());
}

/**
 * Extract all images from markdown content
 */
export function extractImages(
  markdown: string
): Array<{ alt: string; url: string }> {
  const images: Array<{ alt: string; url: string }> = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1] || 'Image',
      url: match[2],
    });
  }

  return images;
}

/**
 * Extract all links from markdown content
 */
export function extractLinks(
  markdown: string
): Array<{ text: string; url: string }> {
  const links: Array<{ text: string; url: string }> = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
    });
  }

  return links;
}

/**
 * Count words in markdown content (excluding code blocks)
 */
export function countWords(markdown: string): number {
  const text = stripMarkdown(markdown);
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(
  markdown: string,
  wordsPerMinute = 200
): number {
  const wordCount = countWords(markdown);
  return Math.ceil(wordCount / wordsPerMinute);
}

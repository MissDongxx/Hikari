import fs from 'fs';
import path from 'path';

/**
 * Parse frontmatter from MDX content
 */
export function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content: content.trim() };
  }

  const frontmatterStr = match[1];
  const bodyContent = match[2];

  // Parse YAML-style frontmatter
  const data: Record<string, any> = {};
  const lines = frontmatterStr.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      data[key] = value;
    }
  }

  return { data, content: bodyContent.trim() };
}

/**
 * Get MDX file path with fallback
 * Priority: {locale}.mdx > en.mdx > index.mdx
 */
export function getMdxPath(baseDir: string, slug: string, locale: string): string {
  const mdxPath = path.join(process.cwd(), baseDir, slug, `${locale}.mdx`);
  const fallbackPath = path.join(process.cwd(), baseDir, slug, `en.mdx`);
  const indexPath = path.join(process.cwd(), baseDir, slug, `index.mdx`);

  if (fs.existsSync(mdxPath)) {
    return mdxPath;
  } else if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  } else if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  return '';
}

/**
 * Resolve MDX file path within a directory with fallback
 * Priority: {locale}.mdx > en.mdx > index.mdx
 * Returns the resolved file path or null if none found
 */
export function resolveMdxFile(dirPath: string, locale: string): string | null {
  const localeFile = path.join(dirPath, `${locale}.mdx`);
  const enFile = path.join(dirPath, `en.mdx`);
  const indexFile = path.join(dirPath, `index.mdx`);

  if (fs.existsSync(localeFile)) {
    return localeFile;
  } else if (fs.existsSync(enFile)) {
    return enFile;
  } else if (fs.existsSync(indexFile)) {
    return indexFile;
  }

  return null;
}

/**
 * Get post metadata and content from file
 */
export function getPostData(slug: string, locale: string, contentType: 'blog' | 'docs' = 'blog') {
  const baseDir = `content/${contentType}`;
  const contentPath = getMdxPath(baseDir, slug, locale);

  if (!contentPath) {
    return { data: {}, content: '' };
  }

  const content = fs.readFileSync(contentPath, 'utf-8');
  return parseFrontmatter(content);
}

import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
import fs from 'fs';
import path from 'path';

/**
 * Parse frontmatter from MDX content
 */
function parseFrontmatter(content: string): { data: Record<string, any>; content: string } {
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
 * Helper function to scan content directory and build map for specific locale
 * Supports structure: content/{type}/{post-name}/{locale}.mdx
 */
function buildLocaleMap(contentDir: string, locale: string): Array<{ type: 'page' | 'meta'; path: string; data: () => Promise<string> }> {
  const files: Array<{ type: 'page' | 'meta'; path: string; data: () => Promise<string> }> = [];
  const baseDir = path.join(process.cwd(), 'content', contentDir);

  if (!fs.existsSync(baseDir)) {
    console.warn(`Content directory not found: ${baseDir}`);
    return files;
  }

  function scanDir(dir: string, relativePath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        // Check if this is a post/doc directory with locale files
        const localeFile = path.join(fullPath, `${locale}.mdx`);
        const enFile = path.join(fullPath, `en.mdx`);
        const indexFile = path.join(fullPath, `index.mdx`);

        // Priority: locale file > en.mdx > index.mdx
        if (fs.existsSync(localeFile)) {
          files.push({
            type: 'page',
            path: path.join(relPath).replace(/\\/g, '/'),
            data: async () => fs.readFileSync(localeFile, 'utf-8')
          });
        } else if (fs.existsSync(enFile)) {
          files.push({
            type: 'page',
            path: path.join(relPath).replace(/\\/g, '/'),
            data: async () => fs.readFileSync(enFile, 'utf-8')
          });
        } else if (fs.existsSync(indexFile)) {
          files.push({
            type: 'page',
            path: path.join(relPath).replace(/\\/g, '/'),
            data: async () => fs.readFileSync(indexFile, 'utf-8')
          });
        }

        // Continue scanning for nested content
        scanDir(fullPath, relPath);
      } else if (entry.name.endsWith('.mdx') && !entry.name.match(/^(en|zh|ja)\.mdx$/)) {
        // Direct .mdx files (non-locale specific)
        files.push({
          type: 'page',
          path: relPath.replace(/\\/g, '/').replace(/\.mdx$/, ''),
          data: async () => fs.readFileSync(fullPath, 'utf-8')
        });
      }
    }
  }

  scanDir(baseDir);
  return files;
}

/**
 * Create docs loader for specific locale
 */
export function createDocsLoader(locale: string) {
  const localeFiles = buildLocaleMap('docs', locale);

  return loader({
    baseUrl: '/docs',
    source: {
      files: localeFiles as any
    },
    icon(icon: string | undefined) {
      if (!icon) return;
      if (icon in icons) {
        return createElement(
          'div',
          { key: icon, className: 'flex justify-center items-center p-2' },
          createElement(
            'div',
            { className: 'flex justify-center items-center w-7 h-7 rounded-md border' },
            createElement(icons[icon as keyof typeof icons], { className: 'w-7 h-7' })
          )
        );
      }
    }
  });
}

/**
 * Create blog loader for specific locale
 * Note: This is now deprecated in favor of fumadocs-mdx blog collection
 */
export function createBlogLoader(locale: string) {
  const localeFiles = buildLocaleMap('blog', locale);

  return loader({
    baseUrl: '/blog',
    source: {
      files: localeFiles as any
    }
  });
}

export type Page = InferPageType<ReturnType<typeof createBlogLoader>>;
export type Meta = InferMetaType<ReturnType<typeof createBlogLoader>>;

/**
 * Get docs source for specific locale
 */
export function getDocsSource(locale: string) {
  return createDocsLoader(locale);
}

/**
 * Get blog source for specific locale
 * Note: Consider using the fumadocs-mdx blog collection from source.config instead
 */
export function getBlogSource(locale: string) {
  return createBlogLoader(locale);
}

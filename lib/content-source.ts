import { createMDXSource, defaultSchemas } from 'fumadocs-mdx/config';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/**
 * Helper function to scan content directory and build map for specific locale
 * Supports structure: content/{type}/{post-name}/{locale}.mdx
 */
function buildLocaleMap(contentDir: string, locale: string): Record<string, any> {
  const map: Record<string, any> = {};
  const baseDir = path.join(process.cwd(), 'content', contentDir);

  if (!fs.existsSync(baseDir)) {
    console.warn(`Content directory not found: ${baseDir}`);
    return map;
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
          map[path.join(relPath, `${locale}.mdx`).replace(/\\/g, '/')] = localeFile;
        } else if (fs.existsSync(enFile)) {
          map[path.join(relPath, `en.mdx`).replace(/\\/g, '/')] = enFile;
        } else if (fs.existsSync(indexFile)) {
          map[path.join(relPath, `index.mdx`).replace(/\\/g, '/')] = indexFile;
        }

        // Continue scanning for nested content
        scanDir(fullPath, relPath);
      } else if (entry.name.endsWith('.mdx') && !entry.name.match(/^(en|zh|ja)\.mdx$/)) {
        // Direct .mdx files (non-locale specific)
        map[relPath.replace(/\\/g, '/')] = fullPath;
      }
    }
  }

  scanDir(baseDir);
  return map;
}

/**
 * Create docs loader for specific locale
 */
export function createDocsLoader(locale: string) {
  const localeMap = buildLocaleMap('docs', locale);

  return loader({
    baseUrl: '/docs',
    rootDir: 'docs',
    source: createMDXSource(localeMap),
    icon(icon: string) {
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
 */
export function createBlogLoader(locale: string) {
  const localeMap = buildLocaleMap('blog', locale);

  return loader({
    baseUrl: '/blog',
    rootDir: 'blog',
    source: createMDXSource(localeMap, {
      schema: {
        frontmatter: defaultSchemas.frontmatter.extend({
          author: z.string(),
          date: z.string().date().or(z.date()).optional()
        })
      }
    })
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
 */
export function getBlogSource(locale: string) {
  return createBlogLoader(locale);
}

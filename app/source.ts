import { docs } from '../.source/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';

// Patch for fumadocs-mdx v14 vs fumadocs-core v16 mismatch
// fumadocs-mdx v14 puts path in `info.path`, but fumadocs-core v16 loader expects `path` at root.
// @ts-ignore
const patchedDocs = Array.isArray(docs)
  ? docs.map((d: any) => ({
    ...d,
    path: d.path || d.info?.path,
  }))
  : docs;

export const source = loader({

  baseUrl: '/docs',
  source: { files: patchedDocs as any },
  icon(icon) {

    if (!icon) {
      return;
    }
    if (icon in icons) {
      return createElement(
        'div',
        { key: icon, className: 'flex justify-center items-center p-2' },
        createElement(
          'div',
          {
            className:
              'flex justify-center items-center w-7 h-7 rounded-md border'
          },
          createElement(icons[icon as keyof typeof icons], {
            className: 'w-7 h-7'
          })
        )
      );
    }
  }
});

// Export convenience functions
export const getPage = source.getPage;
export const getPages = source.getPages;
export const pageTree = source.pageTree;

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;

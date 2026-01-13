import { type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { pageTree } from './source';

// docs layout configuration
export const docsOptions: DocsLayoutProps = {
  links: [
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url'
    }
  ],
  tree: pageTree
};

import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const { docs, meta: docsMeta } = defineDocs({
    dir: 'content/docs',
    docs: {
        async: true,
    },
});

// Blog is configured separately - we'll access it via the generated .source files
// The blog collection will be available as 'blog' from .source/server

export default defineConfig({
});

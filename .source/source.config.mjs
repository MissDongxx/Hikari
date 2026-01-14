// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var { docs, meta: docsMeta } = defineDocs({
  dir: "content/docs",
  docs: {
    async: true
  }
});
var source_config_default = defineConfig({});
export {
  source_config_default as default,
  docs,
  docsMeta
};

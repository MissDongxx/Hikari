// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"quick-start/en.mdx": () => import("../content/docs/quick-start/en.mdx?collection=docs"), "index/en.mdx": () => import("../content/docs/index/en.mdx?collection=docs"), "index/ja.mdx": () => import("../content/docs/index/ja.mdx?collection=docs"), "index/zh.mdx": () => import("../content/docs/index/zh.mdx?collection=docs"), "test/en.mdx": () => import("../content/docs/test/en.mdx?collection=docs"), "configure/index/en.mdx": () => import("../content/docs/configure/index/en.mdx?collection=docs"), "configure/vercel/en.mdx": () => import("../content/docs/configure/vercel/en.mdx?collection=docs"), "storage/example/en.mdx": () => import("../content/docs/storage/example/en.mdx?collection=docs"), "storage/setting-up/en.mdx": () => import("../content/docs/storage/setting-up/en.mdx?collection=docs"), "trpc/example/en.mdx": () => import("../content/docs/trpc/example/en.mdx?collection=docs"), "trpc/setup/en.mdx": () => import("../content/docs/trpc/setup/en.mdx?collection=docs"), "configure/stripe/local/en.mdx": () => import("../content/docs/configure/stripe/local/en.mdx?collection=docs"), "configure/supabase/index/en.mdx": () => import("../content/docs/configure/supabase/index/en.mdx?collection=docs"), "configure/stripe/production/en.mdx": () => import("../content/docs/configure/stripe/production/en.mdx?collection=docs"), "configure/supabase/local/en.mdx": () => import("../content/docs/configure/supabase/local/en.mdx?collection=docs"), "configure/supabase/supabase/en.mdx": () => import("../content/docs/configure/supabase/supabase/en.mdx?collection=docs"), "configure/stripe/index/en.mdx": () => import("../content/docs/configure/stripe/index/en.mdx?collection=docs"), }),
};
export default browserCollections;
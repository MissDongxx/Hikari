// @ts-nocheck
import { default as __fd_glob_20 } from "../content/docs/configure/stripe/meta.json?collection=meta"
import { default as __fd_glob_19 } from "../content/docs/configure/supabase/meta.json?collection=meta"
import { default as __fd_glob_18 } from "../content/docs/configure/meta.json?collection=meta"
import { default as __fd_glob_17 } from "../content/docs/meta.json?collection=meta"
import { frontmatter as __fd_glob_16 } from "../content/docs/configure/stripe/index/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_15 } from "../content/docs/configure/supabase/supabase/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_14 } from "../content/docs/configure/supabase/local/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_13 } from "../content/docs/configure/stripe/production/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_12 } from "../content/docs/configure/supabase/index/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_11 } from "../content/docs/configure/stripe/local/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_10 } from "../content/docs/trpc/setup/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_9 } from "../content/docs/trpc/example/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_8 } from "../content/docs/storage/setting-up/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_7 } from "../content/docs/storage/example/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_6 } from "../content/docs/configure/vercel/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_5 } from "../content/docs/configure/index/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_4 } from "../content/docs/test/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_3 } from "../content/docs/index/zh.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_2 } from "../content/docs/index/ja.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_1 } from "../content/docs/index/en.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_0 } from "../content/docs/quick-start/en.mdx?collection=docs&only=frontmatter"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docLazy("docs", "content/docs", {"quick-start/en.mdx": __fd_glob_0, "index/en.mdx": __fd_glob_1, "index/ja.mdx": __fd_glob_2, "index/zh.mdx": __fd_glob_3, "test/en.mdx": __fd_glob_4, "configure/index/en.mdx": __fd_glob_5, "configure/vercel/en.mdx": __fd_glob_6, "storage/example/en.mdx": __fd_glob_7, "storage/setting-up/en.mdx": __fd_glob_8, "trpc/example/en.mdx": __fd_glob_9, "trpc/setup/en.mdx": __fd_glob_10, "configure/stripe/local/en.mdx": __fd_glob_11, "configure/supabase/index/en.mdx": __fd_glob_12, "configure/stripe/production/en.mdx": __fd_glob_13, "configure/supabase/local/en.mdx": __fd_glob_14, "configure/supabase/supabase/en.mdx": __fd_glob_15, "configure/stripe/index/en.mdx": __fd_glob_16, }, {"quick-start/en.mdx": () => import("../content/docs/quick-start/en.mdx?collection=docs"), "index/en.mdx": () => import("../content/docs/index/en.mdx?collection=docs"), "index/ja.mdx": () => import("../content/docs/index/ja.mdx?collection=docs"), "index/zh.mdx": () => import("../content/docs/index/zh.mdx?collection=docs"), "test/en.mdx": () => import("../content/docs/test/en.mdx?collection=docs"), "configure/index/en.mdx": () => import("../content/docs/configure/index/en.mdx?collection=docs"), "configure/vercel/en.mdx": () => import("../content/docs/configure/vercel/en.mdx?collection=docs"), "storage/example/en.mdx": () => import("../content/docs/storage/example/en.mdx?collection=docs"), "storage/setting-up/en.mdx": () => import("../content/docs/storage/setting-up/en.mdx?collection=docs"), "trpc/example/en.mdx": () => import("../content/docs/trpc/example/en.mdx?collection=docs"), "trpc/setup/en.mdx": () => import("../content/docs/trpc/setup/en.mdx?collection=docs"), "configure/stripe/local/en.mdx": () => import("../content/docs/configure/stripe/local/en.mdx?collection=docs"), "configure/supabase/index/en.mdx": () => import("../content/docs/configure/supabase/index/en.mdx?collection=docs"), "configure/stripe/production/en.mdx": () => import("../content/docs/configure/stripe/production/en.mdx?collection=docs"), "configure/supabase/local/en.mdx": () => import("../content/docs/configure/supabase/local/en.mdx?collection=docs"), "configure/supabase/supabase/en.mdx": () => import("../content/docs/configure/supabase/supabase/en.mdx?collection=docs"), "configure/stripe/index/en.mdx": () => import("../content/docs/configure/stripe/index/en.mdx?collection=docs"), });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_17, "configure/meta.json": __fd_glob_18, "configure/supabase/meta.json": __fd_glob_19, "configure/stripe/meta.json": __fd_glob_20, });
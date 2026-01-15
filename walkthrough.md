# Cloudflare Pages 部署配置完成

## 已完成的配置

### ✅ 适配器选择

已切换到 **OpenNext Cloudflare 适配器** (`@opennextjs/cloudflare`)，替代已废弃的 `@cloudflare/next-on-pages`。

**关键优势**：
- ✅ **支持 Node.js Runtime** - 无需删除 [lib/content-source.ts](file:///Users/xumingyue/Downloads/MyProjects/Hikari/lib/content-source.ts) 和 [lib/mdx-parser.ts](file:///Users/xumingyue/Downloads/MyProjects/Hikari/lib/mdx-parser.ts)
- ✅ **完整 Next.js 功能支持** - 包括图片优化、ISR、SSR 等
- ✅ **更接近标准 Next.js 开发体验**

### ✅ 配置文件

#### 1. [wrangler.jsonc](file:///Users/xumingyue/Downloads/MyProjects/Hikari/wrangler.jsonc)

```jsonc
{
  "name": "hikari",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "main": ".open-next/worker.js",
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

**关键配置**：
- `nodejs_compat`: 启用 Node.js 兼容性
- `compatibility_date`: 2024-09-23+ 是必需的
- 构建输出指向 `.open-next/` 目录

#### 2. [open-next.config.ts](file:///Users/xumingyue/Downloads/MyProjects/Hikari/open-next.config.ts)

OpenNext 配置文件（可选，但推荐显式定义）

#### 3. [.dev.vars](file:///Users/xumingyue/Downloads/MyProjects/Hikari/.dev.vars)

本地开发环境变量：
```
NEXTJS_ENV=development
```

#### 4. [public/_headers](file:///Users/xumingyue/Downloads/MyProjects/Hikari/public/_headers)

静态资源缓存策略：
```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

#### 5. [next.config.mjs](file:///Users/xumingyue/Downloads/MyProjects/Hikari/next.config.mjs)

添加了 OpenNext 本地开发支持：
```javascript
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
```

#### 6. [package.json](file:///Users/xumingyue/Downloads/MyProjects/Hikari/package.json)

新增脚本：
```json
{
  "pages:build": "opennextjs-cloudflare build",
  "pages:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "pages:deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "pages:upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

---

## ✅ 构建验证

### 本地构建测试成功

```bash
pnpm pages:build
```

**构建结果**：
- ✅ Next.js 16.1.1 (Turbopack) 构建成功
- ✅ OpenNext 生成 Worker 成功
- ✅ 输出目录：[.open-next/worker.js](file:///Users/xumingyue/Downloads/MyProjects/Hikari/.open-next/worker.js)
- ⚠️ Next.js 16 部分功能可能不完全支持（OpenNext 提示）

**生成的路由**：
- 静态页面 (SSG): `/[locale]/blog`, `/[locale]/blog/[slug]` 等
- 动态页面 (SSR): `/[locale]/dashboard`, `/[locale]/auth/*`
- API Routes: `/api/trpc/*`, `/api/webhooks/stripe`
- Middleware: 国际化路由处理

---

## 📋 部署步骤

### 方式一：GitHub 原生集成（推荐）

#### 1. 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → **Create application** → **Pages** → **Connect to Git**
3. 授权 Cloudflare 访问您的 GitHub 账号
4. 选择 `MissDongxx/Hikari` 仓库

#### 2. 配置构建设置

```
Framework preset: Next.js
Build command: pnpm install && pnpm pages:build
Build output directory: .open-next
Root directory: / (默认)
```

> [!IMPORTANT]
> 构建输出目录必须设置为 `.open-next`，不是 `.vercel/output/static`

#### 3. 配置环境变量

在 Pages 项目 → **Settings** → **Environment variables** 中添加：

```bash
# 公开变量（会内联到客户端代码）
NEXT_PUBLIC_SUPABASE_URL=https://llmgwifgtszjgjlzlwjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
NEXT_PUBLIC_SITE_URL=https://hikari.pages.dev

# 私有变量（仅服务端可用）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### 4. 保存并部署

- 点击 **Save and Deploy**
- 每次 push 到 `main` 分支会自动部署
- PR 会自动创建 Preview 部署

---

### 方式二：GitHub Actions（仅特殊需求）

如需自定义构建流程，可参考实施计划中的 GitHub Actions 配置。

---

## 🧪 测试清单

### 本地测试

- [x] 构建成功（`pnpm pages:build`）
- [ ] 本地预览（`pnpm pages:preview`）
- [ ] 验证路由正常
- [ ] 验证 MDX 内容加载

### 线上测试（部署后）

- [ ] 首页加载
- [ ] 多语言切换（/en, /zh, /ja）
- [ ] 博客列表和详情页
- [ ] 图片显示
- [ ] Supabase 认证
- [ ] Stripe 支付
- [ ] API Routes
- [ ] 性能测试（PageSpeed Insights）

---

## 🎉 关键优势

### 1. 无需删除 fs 代码

OpenNext 使用 Node.js Runtime，支持 Cloudflare Workers 的 Node.js API。您的现有代码（[lib/content-source.ts](file:///Users/xumingyue/Downloads/MyProjects/Hikari/lib/content-source.ts)、[lib/mdx-parser.ts](file:///Users/xumingyue/Downloads/MyProjects/Hikari/lib/mdx-parser.ts)）可以继续使用。

### 2. 完整 Next.js 功能

- ✅ App Router
- ✅ Image Optimization
- ✅ ISR / SSR / SSG
- ✅ Middleware
- ✅ API Routes
- ✅ Static Assets

### 3. 简化的部署流程

- GitHub push → 自动构建部署
- PR → 自动 Preview 环境
- 无需手动配置 CI/CD

---

## 📝 后续步骤

1. **提交更改到 Git**
   ```bash
   git add .
   git commit -m "feat: 配置 OpenNext Cloudflare Pages 部署"
   git push origin main
   ```

2. **在 Cloudflare Pages 控制台创建项目**
   - 按照上述步骤配置

3. **配置环境变量**
   - 添加 Supabase、Stripe 等必要变量

4. **触发首次部署**
   - Push 代码或在控制台手动触发

5. **验证部署**
   - 访问 `*.pages.dev` 域名
   - 运行完整测试清单

6. **绑定自定义域名**（可选）
   - Pages 项目 → Custom domains
   - 添加您的域名并更新 DNS

---

## ⚠️ 注意事项

### Next.js 16 支持

OpenNext 显示警告：
> "Next.js 16 is not fully supported yet! Some features may not work as expected."

建议密切关注线上行为，遇到问题及时反馈到 [OpenNext 社区](https://github.com/opennextjs/opennextjs-cloudflare)。

### 环境变量编译期限制

虽然 OpenNext 支持 Node.js Runtime，环境变量的编译期/运行期限制仍然存在：

- **编译期**（`next build`）：只能读取 `NEXT_PUBLIC_*`
- **运行期**（Pages Worker）：可读取所有环境变量

确保在 metadata、config 等编译期代码中只使用 `NEXT_PUBLIC_*` 变量。

### 构建输出目录

- OpenNext: `.open-next/`
- next-on-pages: `.vercel/output/static`

如果从 next-on-pages 迁移，记得更新 Cloudflare Pages 构建设置。

---

## 🔗 相关资源

- [OpenNext Cloudflare 文档](https://opennext.js.org/cloudflare)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 文档](https://nextjs.org/docs)
- [项目 GitHub 仓库](https://github.com/MissDongxx/Hikari)

---

**配置完成时间**: 2026-01-14
**配置版本**: OpenNext Cloudflare v1.14.8

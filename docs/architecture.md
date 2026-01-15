# 动作对比 AI 分析平台 - 架构设计文档

> **Architect Agent 输出**  
> 日期：2026-01-14  
> 版本：MVP 1.0

---

## 1. 核心目标定义

### 1.1 产品核心目标

**为健身新手和居家训练者提供一个低成本、易使用的AI动作分析工具，帮助他们在无私教指导的情况下，客观了解自己的动作问题，避免错误训练和受伤风险。**

### 1.2 MVP 阶段核心验证目标

本 MVP 的唯一目标是验证：

> **用户是否愿意为"AI 指出我哪里做错了"这一价值而持续使用或付费。**

具体验证三个假设：

1. **上传意愿**：用户是否愿意拍摄并上传自己的动作视频
2. **价值认可**：AI 给出的差异反馈是否被用户认为有价值
3. **复用场景**：单一动作（深蹲）是否能形成足够的复用场景

---

## 2. 用户画像定义

### 2.1 目标用户（Primary Users）

#### Persona 1: 健身新手小李

- **标签**：25岁，互联网从业者，健身经验 < 6 个月
- **痛点**：
  - 无法判断自己动作是否标准
  - 担心错误动作导致受伤
  - 看视频教程时不知道"我和教练差在哪"
- **期望**：
  - 获得客观的动作反馈
  - 简单易懂的改进建议
  - 不需要花大价钱请私教

#### Persona 2: 居家训练者张姐

- **标签**：32岁，宝妈，居家健身
- **痛点**：
  - 没时间去健身房
  - 跟着视频练，但无人指导
  - 不确定自己做的对不对
- **期望**：
  - 在家也能得到专业反馈
  - 操作简单，不需要复杂设备
  - 快速知道问题在哪

#### Persona 3: 运动学习者王同学

- **标签**：大学生，运动爱好者
- **痛点**：
  - 想提升动作质量
  - 朋友说做得不标准，但说不清哪里不对
  - 需要量化对比数据
- **期望**：
  - 看到具体的差异数据
  - 可视化的骨架对比
  - 明确的改进方向

### 2.2 非目标用户（Out of Scope）

- **专业运动员**：需要更精准的3D姿态分析、实时反馈
- **医疗康复用户**：需要医疗级认证、康复方案定制
- **健身教练**：需要批量管理学员、课程系统

---

## 3. 站点结构定义（Page-Level）

### 3.1 站点地图（Sitemap）

```
/
├── 首页 (Homepage)
├── 动作分析 (Analysis)
│   ├── 选择动作 (Select Exercise) [MVP: 仅深蹲]
│   ├── 上传视频 (Upload)
│   ├── 分析中 (Processing)
│   └── 结果展示 (Results)
├── 使用指南 (Guide)
│   ├── 如何拍摄 (How to Record)
│   └── 常见问题 (FAQ)
├── 关于我们 (About)
└── 隐私政策 (Privacy Policy)
```

### 3.2 核心页面定义

#### 3.2.1 首页 (Homepage - `/`)

**目标**：快速传达产品价值，引导用户进入核心流程

**关键内容**：

- Hero 区域：一句话说明产品价值（"AI 告诉你动作哪里不对"）
- 核心价值展示：3个核心卖点（无需私教、客观分析、快速反馈）
- CTA（Call to Action）：「开始分析我的深蹲」
- 使用流程简图：3步流程说明
- 真实案例展示（可选）：一个示例对比图

**成功指标**：

- 用户进入分析流程的转化率 ≥ 30%

---

#### 3.2.2 动作分析流程（Analysis Flow）

这是核心主线流程，包含 4 个子页面状态：

##### 页面 A: 选择动作 (`/analysis/select`)

**目标**：帮助用户选择要分析的动作

**关键内容**：

- 动作卡片：深蹲（Squat）[MVP 仅此一个]
- 动作说明：简短描述 + 示例GIF/视频
- CTA：「选择深蹲」

**约束**：

- MVP 版本仅展示深蹲，但架构上预留多动作扩展能力

---

##### 页面 B: 上传视频 (`/analysis/upload`)

**目标**：引导用户正确上传参考视频和自己的视频

**关键内容**：

- **上传区域 1**：参考动作视频
  - 提供系统默认参考视频（推荐）
  - 或用户自定义上传
- **上传区域 2**：用户动作视频
  - 明确上传要求提示框：
    - 视频格式：MP4 / MOV
    - 最大时长：15 秒
    - 拍摄要求：
      - 相机固定
      - 侧面或 45° 角度
      - 全身入画（脚到头）
      - 单人全身入镜
- **辅助说明**：
  - 示例图片展示正确拍摄角度
  - 错误示例对比
- CTA：「开始分析」

**校验逻辑**：

- 视频时长 ≤ 15秒
- 文件大小合理限制（如 ≤ 50MB）
- 格式检测

**成功指标**：

- 上传完成率 ≥ 40%

---

##### 页面 C: 分析中 (`/analysis/processing`)

**目标**：告知用户分析进度，避免焦虑等待

**关键内容**：

- 进度指示器（Loading Animation）
- 预估时间提示：「分析中，预计 10-30 秒」
- 分析步骤说明（可选）：
  - ✓ 视频上传完成
  - ⏳ 姿态识别中（当前步骤）
  - ⏸ 动作对比待开始
- 背景知识/Tips（可选）：「你知道吗？深蹲时膝盖不应超过脚尖太多」

**技术要求**：

- 实际进度不可见时，使用模拟进度条
- 超过 30 秒未完成，提示用户稍后查看或重试

---

##### 页面 D: 结果展示 (`/analysis/results/:id`)

**目标**：清晰展示动作对比结果，给出可执行建议

**关键内容区域**：

1. **总体评分区域**（可选）
   - 简单的等级评价（如：需要改进 / 良好 / 优秀）
   - 或总分（如 65/100）

2. **对比可视化区域**（核心）
   - 左侧：参考动作骨架动画
   - 右侧：用户动作骨架动画
   - 问题关节点用红色高亮
   - 可切换播放/暂停/逐帧查看

3. **问题诊断区域**（核心）
   - 以卡片形式列出 4 个对比维度的结果：
     - ❌ 下蹲深度：不足（髋部未低于膝盖）
     - ⚠️ 膝盖轨迹：轻微内扣
     - ❌ 上身前倾：前倾过大，核心不稳定
     - ✅ 左右平衡：良好
   - 每个问题点配：
     - 问题说明（通俗易懂）
     - 对比数据（可选）
     - 改进建议（1-2 条）

4. **历史记录/再次分析 CTA**
   - 「删除此次分析」
   - 「再次分析」
   - 「查看使用指南」

**成功指标**：

- 分析完成后的查看率 ≥ 70%
- 用户停留时间 ≥ 30 秒
- 二次使用率 ≥ 20%

---

#### 3.2.3 使用指南 (`/guide`)

**目标**：帮助用户正确使用产品，降低操作门槛

**关键内容**：

- **如何拍摄**：
  - 推荐设备：手机即可
  - 拍摄角度图示
  - 光线要求
  - 背景要求（简洁，无遮挡）
- **常见问题 FAQ**：
  - 视频上传失败怎么办？
  - 分析结果不准确？
  - 我可以删除视频吗？
  - 支持哪些动作？（MVP：仅深蹲）

---

#### 3.2.4 关于我们 (`/about`)

**目标**：建立信任，说明产品定位

**关键内容**：

- 产品愿景：让每个人都能享受科学的运动指导
- 技术说明：基于计算机视觉与姿态识别（非黑盒）
- 免责声明：
  - **重要**：分析结果为参考建议，非医疗建议
  - 如有运动损伤或健康问题，请咨询医生
- 团队介绍（可选）

---

#### 3.2.5 隐私政策 (`/privacy`)

**目标**：明确数据使用政策，保障用户隐私

**关键内容**：

- 视频存储说明：
  - 视频默认私有
  - 仅用于用户本人查看和 AI 分析
  - 用户可随时删除
- 数据使用：
  - 不做人脸识别
  - 不与第三方共享
  - 仅保留骨架关键点数据（非原视频）
- 合规声明（GDPR / 本地法规）

---

### 3.3 页面优先级（MVP 阶段）

| 优先级 | 页面           | 原因               |
| --- | ------------ | ---------------- |
| P0  | 上传视频         | 核心流程，必须完成        |
| P0  | 结果展示         | 核心价值体现，必须完成      |
| P0  | 分析中          | 用户体验关键，必须完成      |
| P1  | 首页           | 流量入口，但可简化        |
| P1  | 选择动作         | MVP 仅一个动作，可简化    |
| P2  | 使用指南         | 辅助内容，可后补         |
| P2  | 关于我们 / 隐私政策 | 信任建设，但不阻塞核心流程    |

---

## 4. Non-Goals（明确不做什么）

以下功能在 MVP 阶段**明确排除**，避免范围蔓延：

### 4.1 功能层面

- ❌ **实时分析**：仅支持视频上传后分析，不做摄像头实时反馈
- ❌ **多动作同时支持**：MVP 仅支持深蹲，其他动作（如俯卧撑、硬拉）不做
- ❌ **3D 姿态重建**：仅做 2D 关键点分析，不做 3D 建模
- ❌ **课程系统**：不做训练计划、课程编排、长期跟踪
- ❌ **社交功能**：不做排行榜、好友、分享到社交媒体
- ❌ **个性化训练建议**：不做基于用户历史的个性化方案
- ❌ **付费 / 会员体系**：MVP 阶段不做商业化，聚焦产品验证

### 4.2 技术层面

- ❌ **移动端原生 App**：仅做 Web 应用（响应式设计）
- ❌ **高并发高可用**：MVP 不保证高并发，单机部署即可
- ❌ **多语言支持**：MVP 仅中文（或英文）
- ❌ **医疗级认证**：不做医疗器械认证，明确免责

### 4.3 内容层面

- ❌ **详细教学内容**：不做完整的深蹲教程、解剖学知识库
- ❌ **专业运动员数据库**：不提供职业运动员标准动作库

---

## 5. 整体技术方向

### 5.1 架构选型建议

#### 5.1.1 前端架构

**推荐方案**：基于 **Next.js (React)** 的单体应用

**理由**：

- MVP 需要快速迭代，React 生态成熟
- Next.js 提供 SEO 友好的 SSR/SSG 能力（首页、指南页）
- 支持 API Routes，可快速实现简单后端逻辑
- 组件化开发，便于后期扩展

**核心技术栈**：

- **框架**：Next.js 15+ (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS（或 CSS Modules）
- **状态管理**：React Context / Zustand（轻量级）
- **视频处理**：HTML5 Video API + Canvas（骨架绘制）
- **HTTP 客户端**：fetch / axios

---

#### 5.1.2 是否需要后端？

**答案：需要，但可以轻量化**

**原因**：

1. **视频上传**：需要服务端接收和存储视频文件
2. **AI 分析调用**：需要调用姿态识别模型（Python 后端或云服务）
3. **结果存储**：需要数据库保存分析结果
4. **异步任务处理**：分析耗时 10-30 秒，需要异步队列

**推荐方案**：

- **后端框架**：
  - 方案 A：Node.js + Express（与前端共用语言）
  - 方案 B：Python + FastAPI（AI 模型集成更方便）
  
  **推荐：FastAPI**（原因：姿态识别模型通常基于 Python，集成更简单）

- **数据库**：
  - **PostgreSQL**（结构化数据存储，支持 JSON 字段）
  - 或 **SQLite**（MVP 阶段简化部署）

- **对象存储**：
  - **本地文件系统**（MVP 阶段可接受）
  - 或 **云存储**（AWS S3 / Cloudflare R2 / 阿里云 OSS）

- **异步任务队列**：
  - **Celery + Redis**（Python 生态标准方案）
  - 或简化方案：直接用数据库轮询 + 后台线程

---

#### 5.1.3 AI 模型集成方案

**姿态识别模型选型**：

- **方案 A**：使用开源模型自部署
  - **MediaPipe Pose**（Google，轻量级，支持 2D 关键点）
  - **OpenPose**（CMU，更精准但重量级）
  - 推荐：**MediaPipe**（MVP 阶段足够，部署简单）

- **方案 B**：使用云服务 API
  - 如 Google Vision API、Azure Computer Vision
  - 优点：无需自己训练模型
  - 缺点：成本较高，数据隐私问题

**推荐：自部署 MediaPipe Pose**

**集成方式**：

1. Python 后端接收视频
2. 调用 MediaPipe 提取关键点序列
3. 自定义算法计算动作对比维度（深蹲深度、膝盖轨迹等）
4. 返回结构化结果给前端

---

### 5.2 技术架构图（High-Level）

```
┌─────────────────────────────────────────────────────────┐
│                       用户（浏览器)                         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │       Next.js 前端应用                              │  │
│  │  - 页面渲染（SSR/CSR）                               │  │
│  │  - 视频上传组件                                       │  │
│  │  - 骨架可视化（Canvas）                               │  │
│  │  - 结果展示                                          │  │
│  └───────────────┬───────────────────────────────────┘  │
│                  │ HTTP/WebSocket                       │
└──────────────────┼──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Python 后端服务（FastAPI）                   │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ 视频上传 API  │  │ 分析任务 API │  │ 结果查询 API │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │            │
│         ▼                ▼                ▼            │
│  ┌─────────────────────────────────────────────────┐   │
│  │           异步任务队列（Celery）                   │   │
│  │  - 姿态识别任务                                    │   │
│  │  - 动作对比分析                                    │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                   │
│                    ▼                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │       AI 模型引擎（MediaPipe Pose）               │   │
│  │  - 关键点提取                                      │   │
│  │  - 动作阶段切分                                    │   │
│  │  - 对比维度计算                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└────────────┬────────────────────┬───────────────────────┘
             │                    │
             ▼                    ▼
   ┌─────────────────┐   ┌─────────────────┐
   │ 数据库（PostgreSQL│   │ 对象存储（本地/云）│
   │  - 用户记录      │   │  - 视频文件      │
   │  - 分析结果      │   │  - 骨架数据      │
   │  - 任务状态      │   │                 │
   └─────────────────┘   └─────────────────┘
```

---

### 5.3 部署架构建议（MVP）

**推荐方案：单服务器部署**

- **前端**：Next.js 应用（SSR/SSG）
- **后端**：FastAPI + Celery
- **数据库**：PostgreSQL（同机部署）
- **存储**：本地文件系统
- **服务器**：
  - 云主机（如 AWS EC2、阿里云 ECS、Vercel + Cloudflare Workers）
  - 配置：4 核 8G 内存（支持 AI 模型推理）

**简化部署流程**：

1. Docker Compose 一键部署
2. Nginx 反向代理（前后端统一域名）
3. HTTPS 证书（Let's Encrypt）

---

### 5.4 关键技术决策总结

| 技术领域   | 选型                | 理由                      |
| ------ | ----------------- | ----------------------- |
| 前端框架   | Next.js (React)   | 快速开发，SEO 友好，生态成熟       |
| 后端框架   | FastAPI (Python)  | AI 模型集成方便，异步支持好        |
| 数据库    | PostgreSQL        | 结构化数据，支持 JSON 字段       |
| 对象存储   | 本地文件系统 / 云存储      | MVP 简化，后期可迁移            |
| AI 模型  | MediaPipe Pose    | 开源，轻量级，2D 关键点足够        |
| 任务队列   | Celery + Redis    | Python 生态标准，成熟稳定        |
| 部署方式   | Docker Compose    | 一键部署，环境一致性              |
| 域名/CDN | Cloudflare        | 免费 CDN，DDoS 防护，SSL 证书 |

---

## 6. 下一步行动建议

### 6.1 立即行动项（Architecture Approved 后）

1. **技术选型确认**：确认前端（Next.js）和后端（FastAPI）方案
2. **环境搭建**：初始化 Next.js 项目 + FastAPI 项目
3. **数据库设计**：定义核心表结构（用户、视频、分析结果）
4. **核心流程原型**：实现"上传视频 → 分析 → 展示结果"最小闭环

### 6.2 待 Designer Agent 完成的任务

- UI/UX 设计稿（首页、上传页、结果页）
- 视觉风格定义（配色、字体、图标）
- 骨架可视化设计

### 6.3 待 Implementer Agent 完成的任务

- 前端页面开发
- 后端 API 开发
- AI 模型集成与调优
- 测试与部署

---

## 7. 风险与假设

### 7.1 关键假设

1. **用户愿意拍摄自己的视频**：需要快速验证
2. **2D 关键点分析足够准确**：深蹲动作相对简单，2D 可接受
3. **10-30 秒分析时间用户可接受**：需通过测试验证

### 7.2 潜在风险

| 风险                | 应对策略                 |
| ----------------- | -------------------- |
| 用户上传率低            | 优化引导文案，增加示例视频        |
| AI 分析不准           | 收集 Bad Case，迭代算法优化   |
| 视频隐私顾虑            | 强化隐私政策说明，支持即时删除      |
| 服务器成本过高           | MVP 阶段限制并发，后期优化       |
| 用户期望过高（要求实时分析等）   | 明确产品定位，设置合理预期        |

---

## 8. 总结

本架构设计文档基于 MVP 需求，定义了：

✅ **核心目标**：验证用户对 AI 动作分析的价值认可  
✅ **用户画像**：健身新手、居家训练者、运动学习者  
✅ **站点结构**：7 个核心页面，4 个核心流程页面优先级 P0  
✅ **Non-Goals**：明确排除实时分析、多动作、社交、付费等功能  
✅ **技术方向**：Next.js + FastAPI + MediaPipe Pose，单服务器部署

**下一步**：提交本文档供 Product Owner 审阅，通过后进入 Design 和 Implementation 阶段。

---

**文档状态**：✅ 完成  
**待审核人**：Product Owner  
**预计下次更新**：MVP 1.0 验证完成后（根据用户反馈迭代）

---

---

## 9. 当前项目架构分析

### 9.1 项目现状概览

通过分析 [/Users/xumingyue/Downloads/MyProjects/movechecker](file:///Users/xumingyue/Downloads/MyProjects/movechecker) 项目，发现该项目目前是一个 **Next.js SaaS 订阅服务模板**，而非 AI 动作对比平台。

**项目原名称**：Hikari（已在历史会话中重命名为 Saas-Starter）  
**项目描述**：Complete Next.js Subscription Starter Template（来自 README.md）  
**技术栈定位**：通用 SaaS 应用框架

### 9.2 当前技术栈清单

#### 前端技术栈

| 技术类别 | 具体技术 | 版本 | 用途 |
|---------|---------|------|------|
| **核心框架** | Next.js | 16.1.1 | React 全栈框架 |
| **UI 库** | React | 19.2.3 | UI 渲染 |
| **语言** | TypeScript | 5.4.5 | 类型安全 |
| **样式** | TailwindCSS | 3.4.4 | CSS 框架 |
| **UI 组件** | Shadcn/ui + Radix UI | - | 组件库 |
| **状态管理** | @tanstack/react-query | 5.51.24 | 服务端状态管理 |
| **国际化** | next-intl | 4.7.0 | i18n 支持（en/zh/ja） |
| **动画** | framer-motion | 11.2.13 | 动画效果 |
| **表单** | react-hook-form + zod | - | 表单验证 |
| **MDX** | fumadocs-mdx | - | 文档/博客内容 |

#### 后端技术栈

| 技术类别 | 具体技术 | 版本 | 用途 |
|---------|---------|------|------|
| **API 层** | tRPC | 11.0.0-rc | 类型安全的 API |
| **数据库** | Supabase (PostgreSQL) | - | 用户/订阅数据 |
| **认证** | Supabase Auth | - | 用户登录注册 |
| **支付** | Stripe | 14.25.0 | 订阅支付系统 |
| **存储** | Supabase Storage | - | 文件存储 |

#### 部署架构

| 项目 | 方案 | 说明 |
|------|------|------|
| **部署平台** | Cloudflare Pages | 已配置 OpenNext Cloudflare 适配器 |
| **构建工具** | @opennextjs/cloudflare | 1.14.8 |
| **CDN** | Cloudflare | 自动集成 |
| **包管理器** | pnpm | 10.15.1 |

#### 现有数据库表结构（schema.sql）

```
- users (用户表)
- customers (Stripe 客户映射)
- products (Stripe 产品)
- prices (定价)
- subscriptions (订阅状态)
```

### 9.3 项目目录结构分析

```
movechecker/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   ├── api/               # API Routes
│   └── source.ts          # Fumadocs 配置
├── components/            # React 组件（85 个文件）
├── config/                # 配置文件
├── content/               # MDX 内容（博客/文档）
├── docs/                  # 文档目录（仅 mvp.md）
├── lib/                   # 工具库
├── messages/              # i18n 翻译文件（en/zh/ja）
├── public/                # 静态资源
├── server/api/            # tRPC 服务端
├── styles/                # 全局样式
├── supabase/              # Supabase 配置
├── trpc/                  # tRPC 客户端配置
├── types/                 # TypeScript 类型
└── utils/                 # 工具函数
```

### 9.4 关键发现

#### ✅ 与 AI 动作对比平台契合的部分

1. **前端框架**：
   - Next.js 16 + TypeScript + TailwindCSS ✅ 完全吻合推荐技术栈
   - 已配置国际化（next-intl）✅ 可保留
   - 响应式设计，支持移动端 ✅

2. **部署方案**：
   - Cloudflare Pages + OpenNext ✅ 适合静态资源 + 轻量后端
   - 已配置构建脚本 ✅

3. **基础设施**：
   - Supabase 认证系统 ✅ 可用于用户管理
   - PostgreSQL 数据库 ✅ 可存储分析结果
   - 文件存储 ✅ 可用于视频上传

#### ❌ 不适用于 MVP 的部分

1. **Stripe 支付系统**：
   - MVP 阶段不做付费 ❌ 可移除
   - 相关数据表（products, prices, subscriptions）可删除

2. **复杂内容管理**：
   - Fumadocs（文档系统）过于重量级 ❌
   - 博客系统（content/blog）非核心需求 ❌

3. **缺失的核心功能**：
   - **无 AI 模型集成** ❌ 需添加 Python 后端
   - **无视频处理能力** ❌ 需添加视频上传/解析逻辑
   - **无姿态识别模块** ❌ 需集成 MediaPipe 或类似库

---

## 10. 技术选型调整建议

### 10.1 核心判断：架构可复用性评估

**结论**：当前项目架构 **70% 可复用**，需要进行针对性调整。

| 层级 | 复用度 | 调整建议 |
|------|--------|----------|
| 前端框架 | ✅ 95% | 保持不变 |
| 后端 API | ⚠️ 50% | 移除 Stripe，保留 tRPC 框架 |
| 数据库 | ⚠️ 60% | 保留 Supabase，重新设计表结构 |
| AI 后端 | ❌ 0% | **新增 Python 服务** |
| 部署架构 | ✅ 90% | 保持 Cloudflare Pages，新增 Python API 部署 |

---

### 10.2 调整方案：混合架构

#### 架构方案 A：扩展现有架构（推荐）

```
┌─────────────────────────────────────────────────────────┐
│                    用户（浏览器）                          │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│         Next.js 前端 (Cloudflare Pages)                  │
│  - 页面渲染、视频上传 UI、结果展示                          │
│  - 复用现有组件库（Shadcn/ui + Radix）                    │
│  - 复用国际化（next-intl）                                │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
            ▼                      ▼
  ┌──────────────────┐   ┌──────────────────────────┐
  │ tRPC API (Next.js)│   │ Python AI 后端 (新增)     │
  │ - 用户管理         │   │ - FastAPI                │
  │ - 历史记录查询      │   │ - MediaPipe Pose        │
  │ - 元数据存储        │   │ - 动作对比算法            │
  └────────┬─────────┘   └──────────┬───────────────┘
           │                        │
           ▼                        ▼
  ┌──────────────────┐   ┌──────────────────────────┐
  │ Supabase          │   │ 视频处理队列              │
  │ - 用户表          │   │ - 任务状态管理            │
  │ - 分析结果表       │   │ - 骨架数据缓存            │
  │ - 视频元数据       │   │                          │
  └──────────────────┘   └──────────────────────────┘
           │                        │
           ▼                        ▼
  ┌──────────────────┐   ┌──────────────────────────┐
  │ Supabase Storage  │   │ Python Runtime (Fly.io/  │
  │ - 视频文件存储     │   │ Railway/Cloudflare Workers)│
  └──────────────────┘   └──────────────────────────┘
```

**优势**：
- ✅ 充分利用现有代码（前端、组件、认证）
- ✅ 前端部署零成本（Cloudflare Pages 免费）
- ✅ Python 后端独立部署，易于扩展
- ✅ 数据库保持集中管理

---

### 10.3 调整策略：保留 + 叠加（最终方案）

> **用户决策**：保留目前的完整架构不动，方便后期扩展

#### ✅ 完全保留的部分（Keep All）

| 组件 | 理由 | 动作 |
|------|------|------|
| **Next.js 16 + TypeScript** | 前端核心，已验证稳定 | ✅ 保持不变 |
| **TailwindCSS + Shadcn/ui** | 组件库完整，设计美观 | ✅ 保持不变 |
| **Supabase Auth** | 用户登录注册已实现 | ✅ 保持不变 |
| **Supabase Storage** | 可直接用于视频存储 | ✅ 保持不变 |
| **Cloudflare Pages 部署** | 已配置完成 | ✅ 保持不变 |
| **next-intl（国际化）** | 已配置，支持 en/zh/ja | ✅ 保持不变 |
| **tRPC 框架** | 类型安全的 API 调用 | ✅ 保持不变 |
| **Stripe 集成** | 为未来付费功能预留 | ✅ **保留**（暂不使用） |
| **Fumadocs + 博客** | SEO 和内容营销能力 | ✅ **保留**（可用于产品宣传） |
| **Stripe 数据表** | 订阅系统基础设施 | ✅ **保留**（不删除） |

**策略优势**：
- ✅ 零重构成本，降低技术风险
- ✅ 保留未来商业化能力（Stripe 随时可启用）
- ✅ 保留内容营销能力（博客用于 SEO 获客）
- ✅ 现有 SaaS 功能与 AI 功能完全独立，互不干扰

---

#### ➕ 新增的部分（Add）

| 组件 | 技术选型 | 部署位置 | 与现有系统关系 |
|------|---------|----------|---------------|
| **Python AI 后端** | FastAPI | Fly.io / Railway | 独立服务，通过 API 调用 |
| **姿态识别** | MediaPipe Pose | 集成在 AI 后端 | 独立模块 |
| **视频解析库** | OpenCV / moviepy | Python 后端依赖 | 独立依赖 |
| **AI 数据表** | PostgreSQL (Supabase) | 复用现有数据库 | 与 Stripe 表共存 |
| **Canvas 骨架绘制** | 原生 Canvas API | 前端新增组件 | 独立组件 |

---

### 10.4 数据库表设计（共存方案）

#### 新增表结构（基于 Supabase PostgreSQL）

```sql
-- ========================================
-- 保留原有表（完全不动）
-- ========================================
-- users (用户表)
-- customers (Stripe 客户映射)
-- products (Stripe 产品)
-- prices (定价)
-- subscriptions (订阅状态)

-- ========================================
-- 新增 AI 动作分析表（与现有表共存）
-- ========================================

-- 新增：动作类型表
create table exercise_types (
  id serial primary key,
  name text not null,           -- 'squat'
  display_name jsonb,            -- {"en": "Squat", "zh": "深蹲"}
  enabled boolean default true
);

-- 新增：视频上传记录
create table video_uploads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,  -- 复用现有 users 表
  exercise_type_id int references exercise_types,
  video_type text not null,      -- 'reference' | 'user'
  file_path text not null,       -- Supabase Storage 路径
  duration_seconds float,
  created_at timestamptz default now()
);

-- 新增：分析任务
create table analysis_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,  -- 复用现有 users 表
  reference_video_id uuid references video_uploads,
  user_video_id uuid references video_uploads,
  status text default 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 新增：分析结果
create table analysis_results (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references analysis_tasks,
  result_data jsonb,             -- 存储对比维度结果
  skeleton_data jsonb,           -- 骨架关键点数据
  created_at timestamptz default now()
);
```

**数据库共存策略**：
- ✅ 所有 Stripe 表保持原样
- ✅ AI 相关表独立命名空间（`exercise_*`, `video_*`, `analysis_*`）
- ✅ 复用现有 `users` 表（通过 `auth.users` 外键关联）
- ✅ 未来如需整合，可通过 `user_id` 关联订阅状态和分析记录

---

### 10.5 推荐的技术栈最终版

#### 前端（保持现有 + 小幅调整）

```json
{
  "core": "Next.js 16.1.1 + React 19 + TypeScript",
  "styling": "TailwindCSS + Shadcn/ui",
  "state": "@tanstack/react-query (保留)",
  "forms": "react-hook-form + zod (保留)",
  "i18n": "next-intl (MVP 可选)",
  "video": "HTML5 Video API",
  "canvas": "原生 Canvas API (骨架绘制)"
}
```

#### 后端（混合架构）

```json
{
  "Next.js API": {
    "framework": "tRPC (保留)",
    "用途": "用户管理、历史记录查询"
  },
  "Python AI 后端": {
    "framework": "FastAPI",
    "AI 模型": "MediaPipe Pose",
    "视频处理": "OpenCV",
    "部署": "Fly.io / Railway"
  }
}
```

#### 数据库与存储（保持）

```json
{
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth",
  "storage": "Supabase Storage (视频文件)"
}
```

#### 部署架构（双平台）

```json
{
  "前端": "Cloudflare Pages (已配置)",
  "Python 后端": "Fly.io (推荐) / Railway / Render",
  "数据库": "Supabase Cloud (托管)"
}
```

---

### 10.6 实施路径（纯新增，零重构）

> **核心原则**：现有代码完全不动，仅叠加新功能

#### 阶段 1：数据库扩展（1天）

**纯新增操作，无删除**：

1. **在 Supabase 中执行 SQL 脚本**：
   ```bash
   # 连接 Supabase
   # 执行新增表的 CREATE 语句（见 10.4 节）
   ```

2. **验证表创建成功**：
   - 检查 `exercise_types`, `video_uploads`, `analysis_tasks`, `analysis_results` 表
   - 确认与现有表无冲突

3. **插入初始数据**：
   ```sql
   INSERT INTO exercise_types (name, display_name, enabled) 
   VALUES ('squat', '{"en": "Squat", "zh": "深蹲", "ja": "スクワット"}', true);
   ```

#### 阶段 2：开发 Python AI 后端（3-5 天）

**完全独立开发，不影响现有项目**：

1. **创建独立的 AI 后端项目**：
   ```bash
   # 在项目根目录外创建
   mkdir movechecker-ai-backend
   cd movechecker-ai-backend
   python -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn mediapipe opencv-python supabase
   ```

2. **实现核心 API**：
   ```
   movechecker-ai-backend/
   ├── main.py              # FastAPI 主应用
   ├── routers/
   │   ├── analyze.py       # POST /api/analyze
   │   ├── tasks.py         # GET /api/tasks/{id}
   │   └── results.py       # GET /api/results/{id}
   ├── services/
   │   ├── mediapipe.py     # 姿态识别
   │   ├── squat_analyzer.py # 深蹲对比算法
   │   └── supabase.py      # 数据库操作
   └── requirements.txt
   ```

3. **集成 MediaPipe**：
   - 视频关键点提取
   - 深蹲动作阶段切分
   - 对比维度计算（深度、膝盖、躯干、平衡）

#### 阶段 3：前端集成（2-3 天）

**在现有前端项目中新增页面**：

1. **创建新路由（不影响现有路由）**：
   ```
   app/[locale]/
   ├── (existing routes...)    # 保持不动
   └── analysis/              # 新增
       ├── page.tsx           # 动作选择页
       ├── upload/
       │   └── page.tsx       # 视频上传页
       ├── processing/
       │   └── [id]/page.tsx  # 分析中页面
       └── results/
           └── [id]/page.tsx  # 结果展示页
   ```

2. **复用现有组件**：
   - 使用 Shadcn/ui 按钮、卡片、表单组件
   - 使用 Supabase Storage 上传视频
   - 使用 Supabase Auth 获取当前用户

3. **新增 AI 功能组件**：
   ```typescript
   components/
   ├── (existing 85 files...)  # 完全保留
   └── analysis/               # 新增目录
       ├── VideoUploader.tsx   # 视频上传组件
       ├── SkeletonCanvas.tsx  # 骨架绘制
       ├── ComparisonView.tsx  # 对比可视化
       └── ResultCard.tsx      # 结果卡片
   ```

4. **新增 API 调用逻辑**：
   ```typescript
   // lib/ai-api.ts (新文件)
   const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL
   
   export async function submitAnalysis(data: AnalysisRequest) {
     const res = await fetch(`${AI_BACKEND_URL}/api/analyze`, {
       method: 'POST',
       body: JSON.stringify(data)
     })
     return res.json()
   }
   ```

#### 阶段 4：部署与测试（1-2 天）

1. **Python 后端部署到 Fly.io**：
   ```bash
   fly launch --name movechecker-ai
   fly deploy
   ```

2. **配置前端环境变量**（Cloudflare Pages）：
   ```bash
   NEXT_PUBLIC_AI_BACKEND_URL=https://movechecker-ai.fly.dev
   ```

3. **端到端测试**：
   - 用户注册/登录（复用现有 Supabase Auth）
   - 视频上传（复用现有 Supabase Storage）
   - AI 分析流程
   - 结果展示

---

### 10.7 共存架构示意图

```
现有 SaaS 架构（保持不动）          新增 AI 功能（叠加）
┌────────────────────┐            ┌────────────────────┐
│ /[locale]/         │            │ /[locale]/analysis/│
│ - dashboard        │            │ - upload           │
│ - auth/*           │            │ - results/[id]     │
│ - pricing          │◀─共享认证──▶│                    │
│ - blog/*           │            │                    │
└────────┬───────────┘            └─────────┬──────────┘
         │                                  │
         ▼                                  ▼
┌────────────────────┐            ┌────────────────────┐
│ tRPC API           │            │ Python AI API      │
│ - 用户管理          │            │ - 姿态识别          │
│ - Stripe 订阅      │            │ - 动作对比          │
└────────┬───────────┘            └─────────┬──────────┘
         │                                  │
         └─────────┬──────────┬─────────────┘
                   ▼          ▼
         ┌─────────────────────────┐
         │ Supabase PostgreSQL     │
         │ ┌─────────┐ ┌─────────┐│
         │ │Stripe表 │ │AI 分析表││
         │ │(保留)   │ │(新增)   ││
         │ └─────────┘ └─────────┘│
         └─────────────────────────┘
```

**关键点**：
- ✅ 两套功能使用同一个用户认证系统（Supabase Auth）
- ✅ 数据库表分别管理，通过 `user_id` 关联
- ✅ 前端路由完全分离（`/dashboard` vs `/analysis`）
- ✅ 未来可在 Dashboard 中展示分析历史（跨功能整合）

---

### 10.8 最终建议总结（保留架构版本）

| 决策点 | 建议 | 理由 |
|--------|------|------|
| **是否保留现有项目？** | ✅ **完全保留** | 零重构成本，降低风险 |
| **是否保留 Supabase？** | ✅ **是** | 认证、数据库、存储复用 |
| **是否保留 Stripe？** | ✅ **保留暂不用** | 未来商业化随时启用 |
| **是否保留 Fumadocs？** | ✅ **保留** | SEO 和内容营销能力 |
| **是否需要 Python 后端？** | ✅ **是（独立部署）** | AI 模型必须使用 Python |
| **Python 后端部署平台？** | Fly.io（推荐） | 免费额度足够 MVP，支持 Docker |
| **是否保留国际化？** | ✅ **保留** | 已配置完成，可直接使用 |
| **是否保留 tRPC？** | ✅ **保留** | 现有 API 保持不动 |

**总开发时间估算**：7-11 天（纯新增功能）
**技术风险**：极低（不动现有代码）
**扩展能力**：优秀（AI 功能与 SaaS 功能可灵活组合）

---

## 11. 风险评估与应对

### 11.1 技术风险

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| Next.js 16 + OpenNext 兼容性 | 中 | 密切监控构建日志，关注 OpenNext 更新 |
| Python 后端性能瓶颈 | 高 | 初期限制并发，使用任务队列 |
| Supabase 免费额度限制 | 中 | 监控使用量，必要时升级 |
| 视频文件存储成本 | 低 | 分析完成后自动删除原视频 |

### 11.2 架构调整风险

| 风险 | 缓解措施 |
|------|----------|
| 删除 Stripe 可能影响现有页面 | 先全局搜索 `stripe` 关键词，确认依赖关系 |
| 数据库迁移可能导致数据丢失 | 使用 Supabase Migration，先在本地测试 |
| 双后端架构增加复杂度 | 明确职责边界：tRPC 管元数据，Python 管 AI |

---

**文档状态**：✅ 完成（包含架构分析）  
**待审核人**：Product Owner  
**预计下次更新**：技术选型确认后）

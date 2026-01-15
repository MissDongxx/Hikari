# 环境变量配置指南

## 需要添加的环境变量

### 前端项目 (.env.local)

请在 `/Users/xumingyue/Downloads/MyProjects/movechecker/.env.local` 文件末尾添加：

```bash
# AI 后端服务 URL
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000
```

**完整示例：**
```bash
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe 配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# AI 后端服务 URL（新增）
NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000
```

---

### AI 后端项目 (.env)

请在 `/Users/xumingyue/Downloads/MyProjects/movechecker/ai-backend/.env` 文件中配置：

```bash
# Supabase 配置（从前端 .env.local 复制）
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# 视频处理配置
MAX_VIDEO_SIZE_MB=50
MAX_VIDEO_DURATION_SEC=15

# 模型配置
MEDIAPIPE_MODEL_COMPLEXITY=1
MEDIAPIPE_MIN_DETECTION_CONFIDENCE=0.5
MEDIAPIPE_MIN_TRACKING_CONFIDENCE=0.5
```

---

## 快速配置步骤

### 1. 配置前端环境变量

```bash
# 编辑前端 .env.local
echo "\n# AI 后端服务 URL" >> .env.local
echo "NEXT_PUBLIC_AI_BACKEND_URL=http://localhost:8000" >> .env.local
```

### 2. 配置 AI 后端环境变量

```bash
cd ai-backend

# 从你的前端 .env.local 复制 Supabase 配置
# 替换下面的值为你的实际值
cat > .env << 'EOF'
SUPABASE_URL=your-actual-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

HOST=0.0.0.0
PORT=8000
DEBUG=true

MAX_VIDEO_SIZE_MB=50
MAX_VIDEO_DURATION_SEC=15

MEDIAPIPE_MODEL_COMPLEXITY=1
MEDIAPIPE_MIN_DETECTION_CONFIDENCE=0.5
MEDIAPIPE_MIN_TRACKING_CONFIDENCE=0.5
EOF
```

---

## 验证配置

### 1. 启动 AI 后端

```bash
cd ai-backend
source venv/bin/activate
python main.py
```

应该看到：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. 测试 AI 后端

```bash
curl http://localhost:8000/
# 应返回: {"status":"healthy","service":"MoveChecker AI Backend","version":"1.0.0"}
```

### 3. 启动前端

```bash
cd ..
npm run dev
```

访问: http://localhost:3000/analysis/upload

---

## 生产环境配置

### Cloudflare Pages (前端)

在 Cloudflare Pages Dashboard → Settings → Environment variables 中添加：

```
NEXT_PUBLIC_AI_BACKEND_URL=https://your-ai-backend.fly.dev
```

### Fly.io (AI 后端)

```bash
cd ai-backend
fly secrets set SUPABASE_URL=your-url
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## 常见问题

### Q: AI 后端无法连接 Supabase？
**A:** 检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 是否正确。

### Q: 前端无法调用 AI 后端？
**A:** 确保：
1. AI 后端正在运行 (http://localhost:8000)
2. 前端 `.env.local` 中配置了 `NEXT_PUBLIC_AI_BACKEND_URL`
3. 重启前端开发服务器（环境变量更改后需重启）

### Q: CORS 错误？
**A:** AI 后端 `main.py` 已配置 CORS，允许所有来源。生产环境需要修改为具体域名。

---

**配置完成后，记得重启两个服务！**

# MoveChecker AI Backend

AI 动作分析后端服务，基于 FastAPI + MediaPipe。

## 快速开始

### 1. 创建虚拟环境

```bash
cd ai-backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入 Supabase 凭证
```

### 4. 启动服务

```bash
python main.py
```

服务将运行在: http://localhost:8000

### 5. 查看 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
ai-backend/
├── main.py              # FastAPI 主应用
├── routers/             # API 路由
│   ├── analyze.py       # 分析任务 API
│   ├── tasks.py         # 任务查询 API
│   └── results.py       # 结果查询 API
├── services/            # 业务逻辑
│   ├── mediapipe_service.py      # MediaPipe 姿态识别
│   ├── squat_segmentation.py    # 深蹲动作切分
│   ├── squat_analyzer.py        # 深蹲对比分析
│   └── supabase_service.py      # Supabase 数据库操作
├── models/              # 数据模型
└── tests/               # 单元测试
```

## API 端点

### 健康检查
- `GET /` - 基础健康检查
- `GET /health` - 详细健康检查

### 分析任务（T2.6 实现）
- `POST /api/analyze` - 提交分析任务
- `GET /api/tasks/{task_id}` - 查询任务状态
- `GET /api/results/{task_id}` - 获取分析结果

## 开发进度

- [x] T2.1 - 项目初始化
- [ ] T2.2 - 安装依赖
- [ ] T2.3 - MediaPipe 姿态识别
- [ ] T2.4 - 深蹲动作切分
- [ ] T2.5 - 深蹲对比分析
- [ ] T2.6 - FastAPI 路由
- [ ] T2.7 - 异步任务队列
- [ ] T2.8 - Supabase 集成

## 测试

```bash
pytest tests/
```

## 部署

参见 `Dockerfile` 和 `fly.toml`（T4.1 创建）

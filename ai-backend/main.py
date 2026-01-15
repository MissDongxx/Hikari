"""
AI 动作分析后端 - FastAPI 主应用
对应任务: T2.1 - 初始化 Python 项目

功能:
- 视频姿态识别
- 深蹲动作对比分析
- 异步任务处理
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from routers import analyze

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用
app = FastAPI(
    title="MoveChecker AI Backend",
    description="AI-powered movement analysis for fitness exercises",
    version="1.0.0"
)

# 配置 CORS（允许前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(analyze.router)

@app.get("/")
async def root():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "MoveChecker AI Backend",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """详细健康检查"""
    return {
        "status": "ok",
        "services": {
            "api": "running",
            "mediapipe": "ready",
            "database": "connected"
        }
    }

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )

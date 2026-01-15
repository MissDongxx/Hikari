"""
数据模型定义
对应任务: T2.6, T2.8 - 定义 API 和数据库模型
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

# ================================
# 枚举类型
# ================================

class VideoType(str, Enum):
    """视频类型"""
    REFERENCE = "reference"
    USER = "user"

class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ComparisonStatus(str, Enum):
    """对比维度的状态"""
    PASS = "pass"
    WARN = "warn"
    FAIL = "fail"

# ================================
# 请求模型
# ================================

class AnalysisRequest(BaseModel):
    """分析任务创建请求"""
    user_id: str = Field(..., description="用户 ID (UUID)")
    reference_video_id: str = Field(..., description="参考视频 ID")
    user_video_id: str = Field(..., description="用户视频 ID")
    exercise_type_id: int = Field(..., description="动作类型 ID (1=深蹲)")

class AnalysisTaskQuery(BaseModel):
    """任务查询"""
    task_id: str = Field(..., description="任务 ID")

# ================================
# 响应模型
# ================================

class LandmarkPoint(BaseModel):
    """单个关键点"""
    x: float
    y: float
    z: float
    visibility: float

class FrameLandmarks(BaseModel):
    """单帧关键点数据"""
    frame_index: int
    timestamp: float
    landmarks: Optional[List[LandmarkPoint]]
    detection_confidence: float

class ComparisonDimension(BaseModel):
    """对比维度结果"""
    status: ComparisonStatus
    reference_value: Optional[float] = None
    user_value: Optional[float] = None
    message: str
    suggestion: str

class AnalysisResult(BaseModel):
    """完整分析结果"""
    depth: ComparisonDimension
    knee_tracking: ComparisonDimension
    torso_lean: ComparisonDimension
    balance: ComparisonDimension

class TaskStatusResponse(BaseModel):
    """任务状态响应"""
    task_id: str
    status: TaskStatus
    user_id: str
    reference_video_id: str
    user_video_id: str
    created_at: datetime
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class AnalysisResultResponse(BaseModel):
    """分析结果响应"""
    task_id: str
    comparison_result: AnalysisResult
    skeleton_data: Optional[Dict[str, List[FrameLandmarks]]] = None
    overall_score: Optional[int] = None
    overall_grade: Optional[str] = None
    created_at: datetime

class AnalysisTaskResponse(BaseModel):
    """创建任务响应"""
    task_id: str
    status: TaskStatus
    message: str

# ================================
# 数据库模型
# ================================

class VideoUploadDB(BaseModel):
    """视频上传记录（数据库）"""
    id: str
    user_id: str
    exercise_type_id: int
    video_type: VideoType
    file_path: str
    file_size_bytes: Optional[int] = None
    duration_seconds: Optional[float] = None
    width: Optional[int] = None
    height: Optional[int] = None
    uploaded_at: datetime
    created_at: datetime

class AnalysisTaskDB(BaseModel):
    """分析任务（数据库）"""
    id: str
    user_id: str
    reference_video_id: str
    user_video_id: str
    exercise_type_id: int
    status: TaskStatus
    error_message: Optional[str] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class AnalysisResultDB(BaseModel):
    """分析结果（数据库）"""
    id: str
    task_id: str
    comparison_result: Dict[str, Any]  # JSONB
    skeleton_data: Optional[Dict[str, Any]] = None  # JSONB
    overall_score: Optional[int] = None
    overall_grade: Optional[str] = None
    created_at: datetime

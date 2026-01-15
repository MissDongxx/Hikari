"""
Supabase 数据库服务
对应任务: T2.8 - Supabase 数据库集成

功能:
- 创建、查询、更新分析任务
- 保存分析结果到数据库
- 查询视频元数据
"""

from supabase import create_client, Client
from typing import Optional, Dict, List, Any
import logging
import os
from datetime import datetime

from models.schemas import (
    TaskStatus,
    AnalysisTaskDB,
    AnalysisResultDB,
    VideoUploadDB
)

logger = logging.getLogger(__name__)

class SupabaseService:
    """Supabase 数据库服务类"""
    
    def __init__(self, url: str, service_role_key: str):
        """
        初始化 Supabase 客户端
        
        Args:
            url: Supabase 项目 URL
            service_role_key: Service Role Key（服务端密钥）
        """
        self.client: Client = create_client(url, service_role_key)
        logger.info(f"Supabase 客户端已初始化: {url}")
    
    # ================================
    # 分析任务 (analysis_tasks)
    # ================================
    
    async def create_analysis_task(
        self,
        user_id: str,
        reference_video_id: str,
        user_video_id: str,
        exercise_type_id: int
    ) -> Optional[str]:
        """
        创建分析任务
        
        Returns:
            任务 ID (UUID) 或 None
        """
        try:
            data = {
                "user_id": user_id,
                "reference_video_id": reference_video_id,
                "user_video_id": user_video_id,
                "exercise_type_id": exercise_type_id,
                "status": TaskStatus.PENDING.value
            }
            
            result = self.client.table("analysis_tasks").insert(data).execute()
            
            if result.data and len(result.data) > 0:
                task_id = result.data[0]["id"]
                logger.info(f"创建分析任务成功: {task_id}")
                return task_id
            
            return None
        except Exception as e:
            logger.error(f"创建分析任务失败: {e}")
            return None
    
    async def get_analysis_task(self, task_id: str) -> Optional[Dict]:
        """查询分析任务"""
        try:
            result = self.client.table("analysis_tasks").select("*").eq("id", task_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
        except Exception as e:
            logger.error(f"查询分析任务失败: {e}")
            return None
    
    async def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        error_message: Optional[str] = None
    ) -> bool:
        """
        更新任务状态
        
        Args:
            task_id: 任务 ID
            status: 新状态
            error_message: 错误信息（仅失败时）
        
        Returns:
            是否更新成功
        """
        try:
            data = {"status": status.value}
            
            if status == TaskStatus.PROCESSING:
                data["processing_started_at"] = datetime.utcnow().isoformat()
            elif status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
                data["processing_completed_at"] = datetime.utcnow().isoformat()
            
            if error_message:
                data["error_message"] = error_message
            
            result = self.client.table("analysis_tasks").update(data).eq("id", task_id).execute()
            
            logger.info(f"任务 {task_id} 状态更新为: {status.value}")
            return True
        except Exception as e:
            logger.error(f"更新任务状态失败: {e}")
            return False
    
    # ================================
    # 分析结果 (analysis_results)
    # ================================
    
    async def save_analysis_result(
        self,
        task_id: str,
        comparison_result: Dict[str, Any],
        skeleton_data: Optional[Dict[str, Any]] = None,
        overall_score: Optional[int] = None,
        overall_grade: Optional[str] = None
    ) -> Optional[str]:
        """
        保存分析结果
        
        Returns:
            结果 ID 或 None
        """
        try:
            data = {
                "task_id": task_id,
                "comparison_result": comparison_result,
                "skeleton_data": skeleton_data,
                "overall_score": overall_score,
                "overall_grade": overall_grade
            }
            
            result = self.client.table("analysis_results").insert(data).execute()
            
            if result.data and len(result.data) > 0:
                result_id = result.data[0]["id"]
                logger.info(f"保存分析结果成功: {result_id}")
                return result_id
            
            return None
        except Exception as e:
            logger.error(f"保存分析结果失败: {e}")
            return None
    
    async def get_analysis_result(self, task_id: str) -> Optional[Dict]:
        """查询分析结果"""
        try:
            result = self.client.table("analysis_results").select("*").eq("task_id", task_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
        except Exception as e:
            logger.error(f"查询分析结果失败: {e}")
            return None
    
    # ================================
    # 视频上传记录 (video_uploads)
    # ================================
    
    async def get_video_metadata(self, video_id: str) -> Optional[Dict]:
        """查询视频元数据"""
        try:
            result = self.client.table("video_uploads").select("*").eq("id", video_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            
            return None
        except Exception as e:
            logger.error(f"查询视频元数据失败: {e}")
            return None
    
    async def download_video_from_storage(
        self,
        file_path: str,
        local_path: str
    ) -> bool:
        """
        从 Supabase Storage 下载视频到本地
        
        Args:
            file_path: Storage 中的文件路径 (e.g., "user_id/video.mp4")
            local_path: 本地保存路径
        
        Returns:
            是否下载成功
        """
        try:
            # 从 analysis-videos bucket 下载
            data = self.client.storage.from_("analysis-videos").download(file_path)
            
            # 保存到本地
            with open(local_path, "wb") as f:
                f.write(data)
            
            logger.info(f"视频下载成功: {file_path} -> {local_path}")
            return True
        except Exception as e:
            logger.error(f"视频下载失败: {e}")
            return False


# 单例模式
_supabase_service_instance: Optional[SupabaseService] = None

def get_supabase_service() -> SupabaseService:
    """获取 Supabase 服务单例"""
    global _supabase_service_instance
    
    if _supabase_service_instance is None:
        # 从环境变量读取配置
        url = os.getenv("SUPABASE_URL")
        service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not service_role_key:
            raise ValueError(
                "环境变量未配置: SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY"
            )
        
        _supabase_service_instance = SupabaseService(url, service_role_key)
    
    return _supabase_service_instance

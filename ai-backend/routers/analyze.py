"""
分析任务 API 路由
对应任务: T2.6 - 实现 FastAPI 路由
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import (
    AnalysisRequest,
    AnalysisTaskResponse,
    TaskStatusResponse,
    AnalysisResultResponse,
    TaskStatus
)
from services.supabase_service import get_supabase_service
from services.mediapipe_service import get_mediapipe_service
from services.squat_segmentation import get_segmentation_service
from services.squat_analyzer import get_squat_analyzer
import logging
import tempfile
import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])

# ================================
# 后台任务处理函数 (T2.7 异步任务)
# ================================

async def process_analysis_task(task_id: str):
    """
    后台处理分析任务
    
    流程:
    1. 更新任务状态为 processing
    2. 下载视频文件
    3. 提取姿态关键点 (MediaPipe)
    4. 切分动作周期
    5. 对比分析
    6. 保存结果
    7. 更新任务状态为 completed
    """
    supabase = get_supabase_service()
    mediapipe = get_mediapipe_service()
    segmentation = get_segmentation_service()
    analyzer = get_squat_analyzer()
    
    try:
        # 1. 更新状态为 processing
        await supabase.update_task_status(task_id, TaskStatus.PROCESSING)
        logger.info(f"任务 {task_id} 开始处理")
        
        # 2. 获取任务信息
        task = await supabase.get_analysis_task(task_id)
        if not task:
            raise Exception("任务不存在")
        
        # 3. 获取视频元数据
        ref_video = await supabase.get_video_metadata(task["reference_video_id"])
        user_video = await supabase.get_video_metadata(task["user_video_id"])
        
        if not ref_video or not user_video:
            raise Exception("视频元数据不存在")
        
        # 4. 下载视频到临时目录
        temp_dir = tempfile.mkdtemp()
        ref_video_path = os.path.join(temp_dir, "reference.mp4")
        user_video_path = os.path.join(temp_dir, "user.mp4")
        
        await supabase.download_video_from_storage(ref_video["file_path"], ref_video_path)
        await supabase.download_video_from_storage(user_video["file_path"], user_video_path)
        
        logger.info("视频下载完成")
        
        # 5. 提取姿态关键点
        ref_result = mediapipe.extract_pose_landmarks(ref_video_path)
        user_result = mediapipe.extract_pose_landmarks(user_video_path)
        
        if not ref_result["success"] or not user_result["success"]:
            raise Exception("姿态识别失败")
        
        logger.info("姿态识别完成")
        
        # 6. 切分动作周期 (仅处理第一个周期)
        ref_cycles = segmentation.segment_squat_cycles(ref_result["frames"])
        user_cycles = segmentation.segment_squat_cycles(user_result["frames"])
        
        if not ref_cycles or not user_cycles:
            raise Exception("动作切分失败")
        
        # 取第一个周期
        ref_cycle_frames = ref_result["frames"][
            ref_cycles[0]["start_frame"]:ref_cycles[0]["end_frame"]+1
        ]
        user_cycle_frames = user_result["frames"][
            user_cycles[0]["start_frame"]:user_cycles[0]["end_frame"]+1
        ]
        
        logger.info("动作切分完成")
        
        # 7. 对比分析
        comparison_result = analyzer.analyze_squat_comparison(
            ref_cycle_frames,
            user_cycle_frames
        )
        
        logger.info("对比分析完成")
        
        # 8. 计算总体评分
        status_scores = {"pass": 100, "warn": 60, "fail": 30}
        scores = [
            status_scores[comparison_result["depth"]["status"]],
            status_scores[comparison_result["knee_tracking"]["status"]],
            status_scores[comparison_result["torso_lean"]["status"]],
            status_scores[comparison_result["balance"]["status"]]
        ]
        overall_score = int(sum(scores) / len(scores))
        
        if overall_score >= 85:
            overall_grade = "excellent"
        elif overall_score >= 70:
            overall_grade = "good"
        elif overall_score >= 50:
            overall_grade = "needs_improvement"
        else:
            overall_grade = "poor"
        
        # 9. 保存结果
        skeleton_data = {
            "reference": ref_cycle_frames,
            "user": user_cycle_frames
        }
        
        await supabase.save_analysis_result(
            task_id=task_id,
            comparison_result=comparison_result,
            skeleton_data=skeleton_data,
            overall_score=overall_score,
            overall_grade=overall_grade
        )
        
        # 10. 更新任务状态为 completed
        await supabase.update_task_status(task_id, TaskStatus.COMPLETED)
        logger.info(f"任务 {task_id} 处理完成, 得分: {overall_score}")
        
        # 11. 清理临时文件
        os.remove(ref_video_path)
        os.remove(user_video_path)
        os.rmdir(temp_dir)
        
    except Exception as e:
        logger.error(f"任务 {task_id} 处理失败: {e}")
        await supabase.update_task_status(
            task_id,
            TaskStatus.FAILED,
            error_message=str(e)
        )


# ================================
# API 端点
# ================================

@router.post("/analyze", response_model=AnalysisTaskResponse)
async def create_analysis_task(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    提交分析任务
    
    Args:
        request: 分析请求
        background_tasks: FastAPI 后台任务
    
    Returns:
        任务 ID 和状态
    """
    supabase = get_supabase_service()
    
    try:
        # 创建任务
        task_id = await supabase.create_analysis_task(
            user_id=request.user_id,
            reference_video_id=request.reference_video_id,
            user_video_id=request.user_video_id,
            exercise_type_id=request.exercise_type_id
        )
        
        if not task_id:
            raise HTTPException(status_code=500, detail="创建任务失败")
        
        # 添加到后台任务队列
        background_tasks.add_task(process_analysis_task, task_id)
        
        return AnalysisTaskResponse(
            task_id=task_id,
            status=TaskStatus.PENDING,
            message="任务已创建，正在处理中"
        )
    
    except Exception as e:
        logger.error(f"创建任务失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    查询任务状态
    
    Args:
        task_id: 任务 ID
    
    Returns:
        任务状态详情
    """
    supabase = get_supabase_service()
    
    try:
        task = await supabase.get_analysis_task(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        
        if "id" in task:
            task["task_id"] = task["id"]
            
        return TaskStatusResponse(**task)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询任务失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{task_id}", response_model=AnalysisResultResponse)
async def get_analysis_result(task_id: str):
    """
    获取分析结果
    
    Args:
        task_id: 任务 ID
    
    Returns:
        完整的分析结果
    """
    supabase = get_supabase_service()
    
    try:
        # 检查任务状态
        task = await supabase.get_analysis_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="任务不存在")
        
        if task["status"] != TaskStatus.COMPLETED.value:
            raise HTTPException(
                status_code=400,
                detail=f"任务未完成，当前状态: {task['status']}"
            )
        
        # 获取结果
        result = await supabase.get_analysis_result(task_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="结果不存在")
        
        return AnalysisResultResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询结果失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

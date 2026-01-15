"""
MediaPipe 姿态识别服务
对应任务: T2.3 - 实现 MediaPipe 姿态识别服务

功能:
- 从视频文件中提取人体姿态关键点
- 返回每一帧的 33 个关键点坐标 (x, y, z, visibility)
- 支持配置置信度阈值
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import List, Dict, Optional
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MediaPipe 配置
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

class MediaPipeService:
    """MediaPipe 姿态识别服务类"""
    
    def __init__(
        self,
        model_complexity: int = 1,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5
    ):
        """
        初始化 MediaPipe 姿态识别模型
        
        Args:
            model_complexity: 模型复杂度 (0=Lite, 1=Full, 2=Heavy)
            min_detection_confidence: 最小检测置信度
            min_tracking_confidence: 最小跟踪置信度
        """
        self.model_complexity = model_complexity
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        
        logger.info(
            f"初始化 MediaPipe Pose 模型: "
            f"complexity={model_complexity}, "
            f"detection_conf={min_detection_confidence}, "
            f"tracking_conf={min_tracking_confidence}"
        )
    
    def extract_pose_landmarks(
        self,
        video_path: str,
        max_frames: Optional[int] = None
    ) -> Dict[str, any]:
        """
        从视频中提取姿态关键点
        
        Args:
            video_path: 视频文件路径
            max_frames: 最大处理帧数（None 表示处理全部）
        
        Returns:
            {
                "success": bool,
                "frames": [
                    {
                        "frame_index": int,
                        "timestamp": float,
                        "landmarks": [
                            {"x": float, "y": float, "z": float, "visibility": float},
                            ...  # 33 个关键点
                        ],
                        "detection_confidence": float
                    },
                    ...
                ],
                "total_frames": int,
                "video_fps": float,
                "video_width": int,
                "video_height": int,
                "error": str (if failed)
            }
        """
        result = {
            "success": False,
            "frames": [],
            "total_frames": 0,
            "video_fps": 0.0,
            "video_width": 0,
            "video_height": 0
        }
        
        # 打开视频文件
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            result["error"] = f"无法打开视频文件: {video_path}"
            logger.error(result["error"])
            return result
        
        # 获取视频元数据
        result["video_fps"] = cap.get(cv2.CAP_PROP_FPS)
        result["video_width"] = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        result["video_height"] = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        result["total_frames"] = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(
            f"视频信息: {result['video_width']}x{result['video_height']}, "
            f"{result['video_fps']}fps, {result['total_frames']} 帧"
        )
        
        # 初始化 MediaPipe Pose
        with mp_pose.Pose(
            model_complexity=self.model_complexity,
            min_detection_confidence=self.min_detection_confidence,
            min_tracking_confidence=self.min_tracking_confidence,
            static_image_mode=False  # 视频模式
        ) as pose:
            frame_index = 0
            
            while cap.isOpened():
                # 检查是否达到最大帧数
                if max_frames and frame_index >= max_frames:
                    logger.info(f"达到最大帧数限制: {max_frames}")
                    break
                
                ret, frame = cap.read()
                if not ret:
                    break
                
                # 计算时间戳
                timestamp = frame_index / result["video_fps"] if result["video_fps"] > 0 else 0
                
                # 转换颜色空间 (BGR to RGB)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # 执行姿态检测
                pose_results = pose.process(frame_rgb)
                
                # 提取关键点
                if pose_results.pose_landmarks:
                    landmarks_data = []
                    for landmark in pose_results.pose_landmarks.landmark:
                        landmarks_data.append({
                            "x": landmark.x,
                            "y": landmark.y,
                            "z": landmark.z,
                            "visibility": landmark.visibility
                        })
                    
                    # 计算平均置信度
                    avg_visibility = np.mean([lm["visibility"] for lm in landmarks_data])
                    
                    result["frames"].append({
                        "frame_index": frame_index,
                        "timestamp": round(timestamp, 3),
                        "landmarks": landmarks_data,
                        "detection_confidence": round(avg_visibility, 3)
                    })
                else:
                    # 未检测到姿态
                    logger.warning(f"帧 {frame_index}: 未检测到人体姿态")
                    result["frames"].append({
                        "frame_index": frame_index,
                        "timestamp": round(timestamp, 3),
                        "landmarks": None,
                        "detection_confidence": 0.0
                    })
                
                frame_index += 1
        
        cap.release()
        
        # 检查是否成功提取到关键点
        valid_frames = [f for f in result["frames"] if f["landmarks"] is not None]
        if len(valid_frames) == 0:
            result["error"] = "视频中未检测到任何人体姿态"
            logger.error(result["error"])
            return result
        
        result["success"] = True
        logger.info(
            f"成功提取 {len(valid_frames)}/{len(result['frames'])} 帧的姿态数据"
        )
        
        return result
    
    def visualize_landmarks(
        self,
        frame: np.ndarray,
        landmarks
    ) -> np.ndarray:
        """
        在图像上绘制关键点和骨架
        
        Args:
            frame: 原始图像帧
            landmarks: MediaPipe pose_landmarks
        
        Returns:
            绘制了骨架的图像
        """
        annotated_frame = frame.copy()
        
        if landmarks:
            mp_drawing.draw_landmarks(
                annotated_frame,
                landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing.DrawingSpec(
                    color=(0, 255, 0), thickness=2, circle_radius=3
                ),
                connection_drawing_spec=mp_drawing.DrawingSpec(
                    color=(255, 255, 255), thickness=2
                )
            )
        
        return annotated_frame


# 单例模式
_mediapipe_service_instance = None

def get_mediapipe_service() -> MediaPipeService:
    """获取 MediaPipe 服务单例"""
    global _mediapipe_service_instance
    if _mediapipe_service_instance is None:
        _mediapipe_service_instance = MediaPipeService()
    return _mediapipe_service_instance

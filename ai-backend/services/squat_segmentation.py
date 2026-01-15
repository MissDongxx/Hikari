"""
深蹲动作阶段切分服务
对应任务: T2.4 - 实现深蹲动作阶段切分算法 (高风险任务)

功能:
- 识别深蹲动作的「站立 → 下蹲 → 站立」循环
- 切分出每个完整动作的起止帧
- 基于髋部纵坐标变化检测动作阶段

注意: 这是 MVP 简化版实现
"""

import numpy as np
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SquatSegmentationService:
    """深蹲动作切分服务"""
    
    def __init__(
        self,
        hip_threshold: float = 0.05,  # 髋部移动阈值
        min_squat_duration: int = 15   # 最小深蹲帧数
    ):
        """
        初始化深蹲切分服务
        
        Args:
            hip_threshold: 髋部纵坐标变化阈值
            min_squat_duration: 最小深蹲持续帧数
        """
        self.hip_threshold = hip_threshold
        self.min_squat_duration = min_squat_duration
        logger.info(f"深蹲切分服务初始化: threshold={hip_threshold}")
    
    def segment_squat_cycles(
        self,
        landmarks_sequence: List[Dict]
    ) -> List[Dict[str, int]]:
        """
        切分深蹲周期
        
        Args:
            landmarks_sequence: 关键点序列，格式:
                [
                    {
                        "frame_index": 0,
                        "landmarks": [{"x": ..., "y": ..., ...}, ...]
                    },
                    ...
                ]
        
        Returns:
            [
                {
                    "start_frame": int,
                    "bottom_frame": int,  # 最低点帧
                    "end_frame": int
                },
                ...
            ]
        """
        if not landmarks_sequence:
            logger.warning("输入的关键点序列为空")
            return []
        
        # 提取髋部纵坐标序列
        # MediaPipe 关键点索引: 23=左髋, 24=右髋
        hip_y_positions = []
        valid_frames = []
        
        for frame_data in landmarks_sequence:
            if frame_data.get("landmarks") is None:
                continue
            
            landmarks = frame_data["landmarks"]
            if len(landmarks) < 25:  # 确保有足够的关键点
                continue
            
            # 计算左右髋部的平均纵坐标
            left_hip_y = landmarks[23]["y"]
            right_hip_y = landmarks[24]["y"]
            avg_hip_y = (left_hip_y + right_hip_y) / 2
            
            hip_y_positions.append(avg_hip_y)
            valid_frames.append(frame_data["frame_index"])
        
        if len(hip_y_positions) < self.min_squat_duration:
            logger.warning(f"有效帧数不足: {len(hip_y_positions)} < {self.min_squat_duration}")
            return []
        
        # 简化算法: 检测局部极值点
        # 极小值 = 下蹲最低点
        # 两个极小值之间 = 一个完整周期
        
        cycles = []
        hip_y_array = np.array(hip_y_positions)
        
        # 平滑曲线 (移动平均)
        window_size = 5
        smoothed = np.convolve(
            hip_y_array,
            np.ones(window_size) / window_size,
            mode='valid'
        )
        
        # 检测局部极小值 (下蹲最低点)
        local_minima = []
        for i in range(1, len(smoothed) - 1):
            if smoothed[i] < smoothed[i-1] and smoothed[i] < smoothed[i+1]:
                # 纵坐标越大 = 越低 (图像坐标系)
                if smoothed[i] > np.mean(smoothed):  # 只保留明显下蹲的点
                    local_minima.append(i + window_size // 2)  # 调整索引偏移
        
        logger.info(f"检测到 {len(local_minima)} 个下蹲最低点")
        
        # MVP 简化: 如果检测到多个最低点，每两个最低点之间为一个周期
        if len(local_minima) >= 2:
            for i in range(len(local_minima) - 1):
                start_idx = max(0, local_minima[i] - self.min_squat_duration // 2)
                end_idx = min(len(valid_frames) - 1, local_minima[i+1] + self.min_squat_duration // 2)
                
                cycles.append({
                    "start_frame": valid_frames[start_idx],
                    "bottom_frame": valid_frames[local_minima[i]],
                    "end_frame": valid_frames[end_idx]
                })
        
        # MVP 降级方案: 如果检测失败，返回整个视频作为一个周期
        if len(cycles) == 0:
            logger.warning("未检测到明确周期，使用整个视频作为单个周期")
            cycles.append({
                "start_frame": valid_frames[0],
                "bottom_frame": valid_frames[len(valid_frames) // 2],  # 中间帧作为最低点
                "end_frame": valid_frames[-1]
            })
        
        logger.info(f"切分完成: 检测到 {len(cycles)} 个深蹲周期")
        return cycles


# 单例模式
_segmentation_service_instance = None

def get_segmentation_service() -> SquatSegmentationService:
    """获取深蹲切分服务单例"""
    global _segmentation_service_instance
    if _segmentation_service_instance is None:
        _segmentation_service_instance = SquatSegmentationService()
    return _segmentation_service_instance

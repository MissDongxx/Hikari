"""
深蹲对比分析服务
对应任务: T2.5 - 实现深蹲对比维度计算 (高风险任务)

功能:
- 对比分析 4 个维度:
  1. 下蹲深度 (Depth)
  2. 膝盖轨迹 (Knee Tracking)
  3. 上身前倾 (Torso Lean)
  4. 左右平衡 (Balance)

注意: 这是 MVP 简化版实现，使用基础几何计算
"""

import numpy as np
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class SquatAnalyzer:
    """深蹲对比分析器"""
    
    # MediaPipe 关键点索引
    NOSE = 0
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    
    def __init__(self):
        """初始化分析器"""
        logger.info("深蹲分析器初始化")
    
    def calculate_angle(self, p1: Dict, p2: Dict, p3: Dict) -> float:
        """
        计算三点之间的角度
        
        Args:
            p1, p2, p3: 三个关键点 {"x": float, "y": float}
            p2 是顶点
        
        Returns:
            角度 (度)
        """
        v1 = np.array([p1["x"] - p2["x"], p1["y"] - p2["y"]])
        v2 = np.array([p3["x"] - p2["x"], p3["y"] - p2["y"]])
        
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        
        return np.degrees(angle)
    
    def analyze_squat_depth(
        self,
        reference_landmarks: List[Dict],
        user_landmarks: List[Dict]
    ) -> Dict:
        """
        分析下蹲深度
        
        判断标准:
        - 计算髋部和膝盖的相对位置
        - 标准深蹲: 髋部应低于膝盖
        
        Returns:
            {
                "status": "pass" | "warn" | "fail",
                "reference_value": float,  # 髋膝角度
                "user_value": float,
                "message": str,
                "suggestion": str
            }
        """
        # 找到最低点帧（髋部纵坐标最大的帧）
        ref_bottom_frame = max(reference_landmarks, key=lambda f: 
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        user_bottom_frame = max(user_landmarks, key=lambda f:
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        # 计算髋-膝角度
        ref_hip = ref_bottom_frame["landmarks"][self.LEFT_HIP]
        ref_knee = ref_bottom_frame["landmarks"][self.LEFT_KNEE]
        ref_ankle = ref_bottom_frame["landmarks"][self.LEFT_ANKLE]
        
        user_hip = user_bottom_frame["landmarks"][self.LEFT_HIP]
        user_knee = user_bottom_frame["landmarks"][self.LEFT_KNEE]
        user_ankle = user_bottom_frame["landmarks"][self.LEFT_ANKLE]
        
        ref_angle = self.calculate_angle(ref_hip, ref_knee, ref_ankle)
        user_angle = self.calculate_angle(user_hip, user_knee, user_ankle)
        
        # 判断标准 (简化版)
        # 角度越小 = 蹲得越深
        angle_diff = abs(ref_angle - user_angle)
        
        if angle_diff < 10:
            status = "pass"
            message = "下蹲深度良好"
            suggestion = "保持当前深度"
        elif angle_diff < 20:
            status = "warn"
            message = f"下蹲深度略浅（差异 {angle_diff:.1f}°）"
            suggestion = "尝试增加下蹲深度，想象坐在椅子上"
        else:
            status = "fail"
            message = f"下蹲深度不足（差异 {angle_diff:.1f}°）"
            suggestion = "需要明显增加下蹲深度，髋部应低于膝盖"
        
        return {
            "status": status,
            "reference_value": round(ref_angle, 1),
            "user_value": round(user_angle, 1),
            "message": message,
            "suggestion": suggestion
        }
    
    def analyze_knee_tracking(
        self,
        reference_landmarks: List[Dict],
        user_landmarks: List[Dict]
    ) -> Dict:
        """
        分析膝盖轨迹
        
        判断标准:
        - 膝盖应与脚尖方向一致
        - 不应内扣或外翻
        
        Returns:
            对比结果字典
        """
        # MVP 简化: 检查膝盖和脚踝的横向对齐
        ref_bottom = max(reference_landmarks, key=lambda f: 
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        user_bottom = max(user_landmarks, key=lambda f:
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        # 计算膝盖-脚踝的横向偏移
        ref_knee_x = ref_bottom["landmarks"][self.LEFT_KNEE]["x"]
        ref_ankle_x = ref_bottom["landmarks"][self.LEFT_ANKLE]["x"]
        ref_offset = abs(ref_knee_x - ref_ankle_x)
        
        user_knee_x = user_bottom["landmarks"][self.LEFT_KNEE]["x"]
        user_ankle_x = user_bottom["landmarks"][self.LEFT_ANKLE]["x"]
        user_offset = abs(user_knee_x - user_ankle_x)
        
        offset_diff = abs(ref_offset - user_offset)
        
        if offset_diff < 0.03:
            status = "pass"
            message = "膝盖轨迹良好"
            suggestion = "保持当前轨迹"
        elif offset_diff < 0.06:
            status = "warn"
            message = "膝盖轨迹略有偏移"
            suggestion = "注意膝盖与脚尖方向一致"
        else:
            status = "fail"
            message = "膝盖轨迹偏移明显"
            suggestion = "膝盖运动方向应与脚尖一致，避免内扣"
        
        return {
            "status": status,
            "reference_value": round(ref_offset, 3),
            "user_value": round(user_offset, 3),
            "message": message,
            "suggestion": suggestion
        }
    
    def analyze_torso_lean(
        self,
        reference_landmarks: List[Dict],
        user_landmarks: List[Dict]
    ) -> Dict:
        """
        分析上身前倾
        
        判断标准:
        - 计算肩部-髋部-膝盖的角度
        - 上身不应过度前倾
        
        Returns:
            对比结果字典
        """
        ref_bottom = max(reference_landmarks, key=lambda f: 
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        user_bottom = max(user_landmarks, key=lambda f:
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        # 计算肩-髋-膝角度
        ref_shoulder = ref_bottom["landmarks"][self.LEFT_SHOULDER]
        ref_hip = ref_bottom["landmarks"][self.LEFT_HIP]
        ref_knee = ref_bottom["landmarks"][self.LEFT_KNEE]
        
        user_shoulder = user_bottom["landmarks"][self.LEFT_SHOULDER]
        user_hip = user_bottom["landmarks"][self.LEFT_HIP]
        user_knee = user_bottom["landmarks"][self.LEFT_KNEE]
        
        ref_angle = self.calculate_angle(ref_shoulder, ref_hip, ref_knee)
        user_angle = self.calculate_angle(user_shoulder, user_hip, user_knee)
        
        angle_diff = abs(ref_angle - user_angle)
        
        if angle_diff < 10:
            status = "pass"
            message = "上身姿态良好"
            suggestion = "保持挺胸姿态"
        elif angle_diff < 20:
            status = "warn"
            message = f"上身略有前倾（差异 {angle_diff:.1f}°）"
            suggestion = "保持核心稳定，避免过度前倾"
        else:
            status = "fail"
            message = f"上身前倾过大（差异 {angle_diff:.1f}°）"
            suggestion = "加强核心力量，保持上身直立"
        
        return {
            "status": status,
            "reference_value": round(ref_angle, 1),
            "user_value": round(user_angle, 1),
            "message": message,
            "suggestion": suggestion
        }
    
    def analyze_balance(
        self,
        reference_landmarks: List[Dict],
        user_landmarks: List[Dict]
    ) -> Dict:
        """
        分析左右平衡
        
        判断标准:
        - 比较左右髋部、膝盖的对称性
        
        Returns:
            对比结果字典
        """
        # 计算左右对称性
        user_bottom = max(user_landmarks, key=lambda f:
            (f["landmarks"][self.LEFT_HIP]["y"] + f["landmarks"][self.RIGHT_HIP]["y"]) / 2
            if f.get("landmarks") else -1
        )
        
        left_hip_y = user_bottom["landmarks"][self.LEFT_HIP]["y"]
        right_hip_y = user_bottom["landmarks"][self.RIGHT_HIP]["y"]
        hip_asymmetry = abs(left_hip_y - right_hip_y)
        
        left_knee_y = user_bottom["landmarks"][self.LEFT_KNEE]["y"]
        right_knee_y = user_bottom["landmarks"][self.RIGHT_KNEE]["y"]
        knee_asymmetry = abs(left_knee_y - right_knee_y)
        
        avg_asymmetry = (hip_asymmetry + knee_asymmetry) / 2
        
        if avg_asymmetry < 0.02:
            status = "pass"
            message = "左右平衡良好"
            suggestion = "保持对称性"
        elif avg_asymmetry < 0.05:
            status = "warn"
            message = "左右略有不平衡"
            suggestion = "注意重心均匀分配"
        else:
            status = "fail"
            message = "左右明显不平衡"
            suggestion = "检查双脚是否均匀受力"
        
        return {
            "status": status,
            "reference_value": 0.0,  # 参考值（理想对称）
            "user_value": round(avg_asymmetry, 3),
            "message": message,
            "suggestion": suggestion
        }
    
    def analyze_squat_comparison(
        self,
        reference_landmarks: List[Dict],
        user_landmarks: List[Dict]
    ) -> Dict:
        """
        完整的深蹲对比分析
        
        Args:
            reference_landmarks: 参考动作关键点序列
            user_landmarks: 用户动作关键点序列
        
        Returns:
            {
                "depth": {...},
                "knee_tracking": {...},
                "torso_lean": {...},
                "balance": {...}
            }
        """
        logger.info("开始深蹲对比分析")
        
        result = {
            "depth": self.analyze_squat_depth(reference_landmarks, user_landmarks),
            "knee_tracking": self.analyze_knee_tracking(reference_landmarks, user_landmarks),
            "torso_lean": self.analyze_torso_lean(reference_landmarks, user_landmarks),
            "balance": self.analyze_balance(reference_landmarks, user_landmarks)
        }
        
        logger.info("深蹲对比分析完成")
        return result


# 单例模式
_squat_analyzer_instance = None

def get_squat_analyzer() -> SquatAnalyzer:
    """获取深蹲分析器单例"""
    global _squat_analyzer_instance
    if _squat_analyzer_instance is None:
        _squat_analyzer_instance = SquatAnalyzer()
    return _squat_analyzer_instance

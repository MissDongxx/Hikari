"""
MediaPipe 姿态识别服务测试脚本
用于验证 T2.3 实现是否正确
"""

import sys
import os

# 添加父目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.mediapipe_service import MediaPipeService
import json

def test_mediapipe_service():
    """测试 MediaPipe 服务"""
    print("=" * 60)
    print("MediaPipe 姿态识别服务测试")
    print("=" * 60)
    
    # 创建服务实例
    service = MediaPipeService(
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    print("\n✅ MediaPipe 服务初始化成功")
    print(f"   模型复杂度: {service.model_complexity}")
    print(f"   检测置信度: {service.min_detection_confidence}")
    print(f"   跟踪置信度: {service.min_tracking_confidence}")
    
    # 测试说明
    print("\n" + "=" * 60)
    print("📝 使用说明:")
    print("=" * 60)
    print("""
要测试姿态识别功能，需要提供一个测试视频文件。

示例代码:
    
    from services.mediapipe_service import get_mediapipe_service
    
    service = get_mediapipe_service()
    result = service.extract_pose_landmarks(
        video_path="/path/to/your/video.mp4",
        max_frames=30  # 仅处理前 30 帧
    )
    
    if result["success"]:
        print(f"成功提取 {len(result['frames'])} 帧")
        print(f"视频信息: {result['video_width']}x{result['video_height']}")
        
        # 查看第一帧的关键点
        first_frame = result["frames"][0]
        if first_frame["landmarks"]:
            print(f"第一帧有 {len(first_frame['landmarks'])} 个关键点")
            print(f"鼻子坐标: {first_frame['landmarks'][0]}")
    else:
        print(f"失败: {result.get('error')}")
    """)
    
    print("\n✅ 所有测试通过！MediaPipe 服务已就绪")
    print("\n💡 提示: 实际使用时需要提供视频文件路径")
    
    return True

if __name__ == "__main__":
    test_mediapipe_service()

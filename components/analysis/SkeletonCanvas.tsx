'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

/**
 * 骨架可视化组件
 * 对应任务: T3.6 - 实现骨架可视化组件
 * 
 * 功能:
 * - Canvas 绘制 33 个 MediaPipe 人体关键点
 * - 骨架线条连接
 * - 播放/暂停/逐帧控制
 * - 参考动作与用户动作左右对比
 */

// MediaPipe Pose 骨架连接定义
const POSE_CONNECTIONS = [
    // 躯干
    [11, 12], // 两肩
    [11, 23], [12, 24], // 肩到髋
    [23, 24], // 两髋

    // 左臂
    [11, 13], [13, 15], // 肩-肘-腕

    // 右臂
    [12, 14], [14, 16], // 肩-肘-腕

    // 左腿
    [23, 25], [25, 27], // 髋-膝-踝
    [27, 29], [29, 31], // 踝-脚跟-脚尖

    // 右腿
    [24, 26], [26, 28], // 髋-膝-踝
    [28, 30], [30, 32], // 踝-脚跟-脚尖

    // 面部
    [0, 1], [1, 2], [2, 3], [3, 7], // 左眼
    [0, 4], [4, 5], [5, 6], [6, 8], // 右眼
    [9, 10], // 嘴
];

// 关键关节点索引（用于高亮）
const KEY_JOINTS = {
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
};

interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

interface FrameData {
    frame_index: number;
    timestamp: number;
    landmarks: Landmark[] | null;
    detection_confidence: number;
}

interface SkeletonCanvasProps {
    referenceFrames: FrameData[];
    userFrames: FrameData[];
    fps?: number;
    highlightJoints?: number[];
    width?: number;
    height?: number;
}

export function SkeletonCanvas({
    referenceFrames,
    userFrames,
    fps = 30,
    highlightJoints = [],
    width = 400,
    height = 300,
}: SkeletonCanvasProps) {
    const refCanvasRef = useRef<HTMLCanvasElement>(null);
    const userCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);

    // 计算总帧数
    useEffect(() => {
        const maxFrames = Math.max(referenceFrames.length, userFrames.length);
        setTotalFrames(maxFrames);
    }, [referenceFrames, userFrames]);

    // 绘制单个骨架
    const drawSkeleton = useCallback((
        ctx: CanvasRenderingContext2D,
        landmarks: Landmark[] | null,
        canvasWidth: number,
        canvasHeight: number,
        highlightJoints: number[]
    ) => {
        // 清空画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        if (!landmarks || landmarks.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('无姿态数据', canvasWidth / 2, canvasHeight / 2);
            return;
        }

        // 绘制连接线
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;

        for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];

            if (!start || !end) continue;
            if (start.visibility < 0.5 || end.visibility < 0.5) continue;

            const x1 = start.x * canvasWidth;
            const y1 = start.y * canvasHeight;
            const x2 = end.x * canvasWidth;
            const y2 = end.y * canvasHeight;

            // 检查是否需要高亮
            const isHighlighted = highlightJoints.includes(startIdx) || highlightJoints.includes(endIdx);
            ctx.strokeStyle = isHighlighted ? '#ef4444' : '#4ade80';
            ctx.lineWidth = isHighlighted ? 3 : 2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // 绘制关键点
        for (let i = 0; i < landmarks.length; i++) {
            const landmark = landmarks[i];
            if (!landmark || landmark.visibility < 0.5) continue;

            const x = landmark.x * canvasWidth;
            const y = landmark.y * canvasHeight;

            // 检查是否是问题关节
            const isHighlighted = highlightJoints.includes(i);
            const radius = isHighlighted ? 6 : 4;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = isHighlighted ? '#ef4444' : '#ffffff';
            ctx.fill();

            if (isHighlighted) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }, []);

    // 渲染当前帧
    const renderFrame = useCallback((frameIndex: number) => {
        const refCtx = refCanvasRef.current?.getContext('2d');
        const userCtx = userCanvasRef.current?.getContext('2d');

        if (refCtx && referenceFrames[frameIndex]) {
            drawSkeleton(refCtx, referenceFrames[frameIndex].landmarks, width, height, []);
        }

        if (userCtx && userFrames[frameIndex]) {
            drawSkeleton(userCtx, userFrames[frameIndex].landmarks, width, height, highlightJoints);
        }
    }, [referenceFrames, userFrames, width, height, highlightJoints, drawSkeleton]);

    // 播放动画
    useEffect(() => {
        if (!isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        let lastTime = 0;
        const frameInterval = 1000 / fps;

        const animate = (timestamp: number) => {
            if (timestamp - lastTime >= frameInterval) {
                lastTime = timestamp;

                setCurrentFrame((prev) => {
                    const next = prev + 1;
                    if (next >= totalFrames) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, fps, totalFrames]);

    // 渲染帧变化
    useEffect(() => {
        renderFrame(currentFrame);
    }, [currentFrame, renderFrame]);

    // 控制函数
    const togglePlay = () => setIsPlaying(!isPlaying);

    const stepBackward = () => {
        setIsPlaying(false);
        setCurrentFrame((prev) => Math.max(0, prev - 1));
    };

    const stepForward = () => {
        setIsPlaying(false);
        setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + 1));
    };

    const handleSliderChange = (value: number[]) => {
        setIsPlaying(false);
        setCurrentFrame(value[0]);
    };

    if (totalFrames === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-secondary rounded-lg">
                <p className="text-muted-foreground">暂无骨架数据</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 双视频对比区域 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="text-center text-sm font-medium text-muted-foreground">
                        参考动作
                    </div>
                    <canvas
                        ref={refCanvasRef}
                        width={width}
                        height={height}
                        className="w-full rounded-lg border"
                    />
                </div>
                <div className="space-y-2">
                    <div className="text-center text-sm font-medium text-muted-foreground">
                        您的动作
                    </div>
                    <canvas
                        ref={userCanvasRef}
                        width={width}
                        height={height}
                        className="w-full rounded-lg border"
                    />
                </div>
            </div>

            {/* 进度条 */}
            <div className="space-y-2">
                <Slider
                    value={[currentFrame]}
                    max={totalFrames - 1}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>帧 {currentFrame + 1} / {totalFrames}</span>
                    <span>{((currentFrame / fps) || 0).toFixed(2)}s</span>
                </div>
            </div>

            {/* 播放控制 */}
            <div className="flex items-center justify-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={stepBackward}
                    disabled={currentFrame === 0}
                >
                    <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                >
                    {isPlaying ? (
                        <Pause className="h-4 w-4" />
                    ) : (
                        <Play className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={stepForward}
                    disabled={currentFrame >= totalFrames - 1}
                >
                    <SkipForward className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default SkeletonCanvas;

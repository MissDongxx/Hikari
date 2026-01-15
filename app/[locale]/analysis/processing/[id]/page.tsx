'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

/**
 * 分析处理中页面
 * 对应任务: T3.5 - 实现分析中页面
 */
export default function ProcessingPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // 轮询任务状态
        const pollInterval = setInterval(async () => {
            try {
                // TODO: 调用后端 API 查询任务状态
                // const response = await fetch(`${AI_BACKEND_URL}/api/tasks/${taskId}`);
                // const data = await response.json();
                // setStatus(data.status);

                // 临时: 模拟进度
                setProgress(prev => {
                    if (prev >= 100) {
                        setStatus('completed');
                        return 100;
                    }
                    return prev + 10;
                });
            } catch (error) {
                console.error('Failed to fetch task status:', error);
            }
        }, 2000);

        // 状态为 completed 时跳转到结果页
        if (status === 'completed') {
            clearInterval(pollInterval);
            setTimeout(() => {
                router.push(`/analysis/results/${taskId}`);
            }, 1000);
        }

        return () => clearInterval(pollInterval);
    }, [taskId, status, router]);

    const steps = [
        { label: '视频上传完成', completed: true },
        { label: '姿态识别中', completed: progress > 30 },
        { label: '动作对比分析', completed: progress > 60 },
        { label: '生成分析报告', completed: progress > 90 },
    ];

    return (
        <div className="container max-w-2xl py-20">
            <Card>
                <CardContent className="pt-10 pb-10">
                    <div className="text-center space-y-8">
                        <div className="flex justify-center">
                            {status === 'completed' ? (
                                <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in" />
                            ) : (
                                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {status === 'completed' ? '分析完成！' : 'AI 正在分析您的动作'}
                            </h2>
                            <p className="text-muted-foreground">
                                {status === 'completed'
                                    ? '即将跳转到结果页面...'
                                    : '预计需要 10-30 秒，请稍候'}
                            </p>
                        </div>

                        {/* 进度条 */}
                        <div className="w-full bg-secondary rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* 步骤指示器 */}
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-left"
                                >
                                    <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                    ${step.completed ? 'bg-green-500' : 'bg-secondary'}
                  `}>
                                        {step.completed && (
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 提示信息 */}
                        <div className="pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                💡 小贴士：深蹲时保持背部挺直，膝盖不要超过脚尖太多
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

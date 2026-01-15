'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    TrendingUp,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

/**
 * 分析结果展示页面
 * 对应任务: T3.7 - 实现结果展示页面
 * 
 * 注意: T3.6 骨架可视化组件将单独实现
 */

interface ComparisonDimension {
    status: 'pass' | 'warn' | 'fail';
    reference_value?: number;
    user_value?: number;
    message: string;
    suggestion: string;
}

interface AnalysisResult {
    depth: ComparisonDimension;
    knee_tracking: ComparisonDimension;
    torso_lean: ComparisonDimension;
    balance: ComparisonDimension;
}

export default function ResultsPage() {
    const params = useParams();
    const taskId = params.id as string;

    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [overallScore, setOverallScore] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: 从后端获取分析结果
        // const fetchResults = async () => {
        //   const response = await fetch(`${AI_BACKEND_URL}/api/results/${taskId}`);
        //   const data = await response.json();
        //   setResult(data.comparison_result);
        //   setOverallScore(data.overall_score);
        //   setLoading(false);
        // };

        // 临时: 模拟数据
        setTimeout(() => {
            setResult({
                depth: {
                    status: 'warn',
                    reference_value: 90,
                    user_value: 110,
                    message: '下蹲深度略浅',
                    suggestion: '尝试增加下蹲深度，想象坐在椅子上'
                },
                knee_tracking: {
                    status: 'pass',
                    message: '膝盖轨迹良好',
                    suggestion: '保持当前轨迹'
                },
                torso_lean: {
                    status: 'fail',
                    reference_value: 85,
                    user_value: 65,
                    message: '上身前倾过大',
                    suggestion: '加强核心力量，保持上身直立'
                },
                balance: {
                    status: 'pass',
                    message: '左右平衡良好',
                    suggestion: '保持对称性'
                }
            });
            setOverallScore(68);
            setLoading(false);
        }, 500);
    }, [taskId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">加载结果中...</p>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="container max-w-4xl py-10">
                <Alert variant="destructive">
                    <AlertDescription>无法加载分析结果，请重试</AlertDescription>
                </Alert>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'warn':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'fail':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getGrade = (score: number) => {
        if (score >= 85) return { label: '优秀', color: 'bg-green-500' };
        if (score >= 70) return { label: '良好', color: 'bg-blue-500' };
        if (score >= 50) return { label: '需改进', color: 'bg-yellow-500' };
        return { label: '较差', color: 'bg-red-500' };
    };

    const grade = getGrade(overallScore);
    const dimensions = [
        { key: 'depth', label: '下蹲深度', data: result.depth },
        { key: 'knee_tracking', label: '膝盖轨迹', data: result.knee_tracking },
        { key: 'torso_lean', label: '上身前倾', data: result.torso_lean },
        { key: 'balance', label: '左右平衡', data: result.balance },
    ];

    return (
        <div className="container max-w-6xl py-10">
            {/* 返回按钮 */}
            <Link href="/analysis/upload">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回上传页面
                </Button>
            </Link>

            {/* 总体评分 */}
            <Card className="mb-8">
                <CardContent className="pt-10">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-primary">{overallScore}</div>
                                <div className="text-sm text-muted-foreground">/ 100</div>
                            </div>
                        </div>

                        <div>
                            <Badge className={`${grade.color} text-white text-lg px-4 py-1`}>
                                {grade.label}
                            </Badge>
                        </div>

                        <p className="text-muted-foreground max-w-md mx-auto">
                            您的深蹲动作得分为 {overallScore} 分。
                            {overallScore < 70 && '建议根据以下分析改进您的动作。'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 骨架可视化区域 - T3.6 将实现 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>动作对比可视化</CardTitle>
                    <CardDescription>左侧为参考动作，右侧为您的动作</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">
                            骨架可视化组件 (T3.6 待实现)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 对比分析结果 */}
            <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    详细分析
                </h2>

                {dimensions.map((dim) => (
                    <Card key={dim.key}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    {getStatusIcon(dim.data.status)}
                                    {dim.label}
                                </span>
                                {dim.data.reference_value !== undefined && (
                                    <div className="text-sm font-normal text-muted-foreground">
                                        参考: {dim.data.reference_value}° |
                                        您的: {dim.data.user_value}°
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-medium mb-1">问题诊断:</p>
                                <p className="text-muted-foreground">{dim.data.message}</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border-l-4 border-blue-500">
                                <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                                    💡 改进建议:
                                </p>
                                <p className="text-blue-600 dark:text-blue-400">{dim.data.suggestion}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
                <Link href="/analysis/upload">
                    <Button size="lg" variant="outline">
                        再次分析
                    </Button>
                </Link>
                <Button size="lg" onClick={() => window.print()}>
                    导出报告
                </Button>
            </div>
        </div>
    );
}

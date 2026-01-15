'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * 视频上传页面
 * 对应任务: T3.2, T3.3, T3.4 - 实现视频上传组件和完整流程
 */
export default function UploadPage() {
    const router = useRouter();
    const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
    const [userVideo, setUserVideo] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (type: 'reference' | 'user', file: File | null) => {
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('video/')) {
            setError('请上传视频文件（MP4, MOV等格式）');
            return;
        }

        // 验证文件大小（50MB）
        if (file.size > 50 * 1024 * 1024) {
            setError('视频文件大小不能超过50MB');
            return;
        }

        setError('');
        if (type === 'reference') {
            setReferenceVideo(file);
        } else {
            setUserVideo(file);
        }
    };

    const handleSubmit = async () => {
        if (!referenceVideo || !userVideo) {
            setError('请上传参考视频和您的视频');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // TODO: 实现上传逻辑
            // 1. 上传视频到 Supabase Storage
            // 2. 调用后端 API 创建分析任务
            // 3. 跳转到处理页面

            // 临时: 直接跳转到处理中页面
            const mockTaskId = 'test-task-id';
            router.push(`/analysis/processing/${mockTaskId}`);
        } catch (err) {
            setError('上传失败，请重试');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container max-w-6xl py-10">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2">AI 深蹲动作分析</h1>
                <p className="text-muted-foreground">
                    上传您的深蹲视频，获得专业的AI动作分析和改进建议
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* 参考视频 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            参考动作视频
                        </CardTitle>
                        <CardDescription>
                            选择标准深蹲参考视频（推荐使用系统默认）
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileSelect('reference', e.target.files?.[0] || null)}
                                className="hidden"
                                id="reference-upload"
                            />
                            <label htmlFor="reference-upload" className="cursor-pointer">
                                {referenceVideo ? (
                                    <div className="space-y-2">
                                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium">{referenceVideo.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(referenceVideo.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                                        <p className="font-medium">上传参考视频</p>
                                        <p className="text-sm text-muted-foreground">
                                            或使用系统默认视频
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <Button variant="outline" className="w-full" disabled>
                            使用系统默认参考视频（即将推出）
                        </Button>
                    </CardContent>
                </Card>

                {/* 用户视频 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            您的动作视频
                        </CardTitle>
                        <CardDescription>
                            上传您的深蹲视频进行分析
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileSelect('user', e.target.files?.[0] || null)}
                                className="hidden"
                                id="user-upload"
                            />
                            <label htmlFor="user-upload" className="cursor-pointer">
                                {userVideo ? (
                                    <div className="space-y-2">
                                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                                        <p className="font-medium">{userVideo.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(userVideo.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                                        <p className="font-medium">点击上传视频</p>
                                        <p className="text-sm text-muted-foreground">
                                            支持 MP4, MOV 格式，最大 50MB
                                        </p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 拍摄要求提示 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>拍摄要求</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>✓ 相机固定，避免晃动</li>
                        <li>✓ 侧面或45°角度拍摄</li>
                        <li>✓ 全身入画（从头到脚）</li>
                        <li>✓ 单人入镜，背景简洁</li>
                        <li>✓ 视频时长不超过15秒</li>
                        <li>✓ 光线充足，避免逆光</li>
                    </ul>
                </CardContent>
            </Card>

            {/* 提交按钮 */}
            <div className="flex justify-center">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!referenceVideo || !userVideo || uploading}
                    className="min-w-[200px]"
                >
                    {uploading ? '上传中...' : '开始分析'}
                </Button>
            </div>
        </div>
    );
}

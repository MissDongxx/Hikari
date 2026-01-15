'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * 动作选择页面
 * 对应任务: T3.1 - 创建前端路由结构
 * 
 * MVP阶段仅支持深蹲，直接重定向到上传页面
 */
export default function AnalysisSelectPage() {
    const router = useRouter();

    useEffect(() => {
        // MVP: 仅深蹲，直接跳转到上传页
        router.push('/analysis/upload');
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="mt-4 text-muted-foreground">正在跳转...</p>
            </div>
        </div>
    );
}

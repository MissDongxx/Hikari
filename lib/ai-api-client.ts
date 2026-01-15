/**
 * AI 后端 API 客户端
 * 用于调用 Python FastAPI 后端服务
 */

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000';

export interface AnalysisRequest {
    user_id: string;
    reference_video_id: string;
    user_video_id: string;
    exercise_type_id: number;
}

export interface TaskStatusResponse {
    task_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    user_id: string;
    reference_video_id: string;
    user_video_id: string;
    created_at: string;
    processing_started_at?: string;
    processing_completed_at?: string;
    error_message?: string;
}

export interface ComparisonDimension {
    status: 'pass' | 'warn' | 'fail';
    reference_value?: number;
    user_value?: number;
    message: string;
    suggestion: string;
}

export interface AnalysisResultResponse {
    task_id: string;
    comparison_result: {
        depth: ComparisonDimension;
        knee_tracking: ComparisonDimension;
        torso_lean: ComparisonDimension;
        balance: ComparisonDimension;
    };
    skeleton_data?: any;
    overall_score?: number;
    overall_grade?: string;
    created_at: string;
}

/**
 * 提交分析任务
 */
export async function submitAnalysis(
    request: AnalysisRequest
): Promise<{ task_id: string; status: string } | null> {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Submit analysis failed:', error);
        return null;
    }
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(
    taskId: string
): Promise<TaskStatusResponse | null> {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/tasks/${taskId}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get task status failed:', error);
        return null;
    }
}

/**
 * 获取分析结果
 */
export async function getAnalysisResult(
    taskId: string
): Promise<AnalysisResultResponse | null> {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/api/results/${taskId}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Get analysis result failed:', error);
        return null;
    }
}

/**
 * 健康检查
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${AI_BACKEND_URL}/health`);
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}

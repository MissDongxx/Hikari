/**
 * Supabase 客户端工具
 * 用于前端上传视频文件到 Supabase Storage
 */

import { createClient } from '@/utils/supabase/client';

export const supabase = createClient();

/**
 * 上传视频到 Supabase Storage
 * 
 * @param file 视频文件
 * @param userId 用户ID
 * @param videoType 'reference' | 'user'
 * @returns 上传后的文件路径和视频ID
 */
export async function uploadVideo(
    file: File,
    userId: string,
    videoType: 'reference' | 'user'
): Promise<{ videoId: string; filePath: string } | null> {
    try {
        // 生成唯一文件名
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}_${videoType}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // 上传到 Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('analysis-videos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        // 创建视频上传记录
        const { data: videoRecord, error: dbError } = await supabase
            .from('video_uploads')
            .insert({
                user_id: userId,
                exercise_type_id: 1, // 深蹲
                video_type: videoType,
                file_path: filePath,
                file_size_bytes: file.size,
                duration_seconds: null, // 前端无法获取，后端会更新
                width: null,
                height: null
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // 清理已上传的文件
            await supabase.storage.from('analysis-videos').remove([filePath]);
            return null;
        }

        return {
            videoId: videoRecord.id,
            filePath: filePath
        };
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
}

/**
 * 获取当前用户ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
}

/**
 * 检查用户是否已登录
 */
export async function checkAuth(): Promise<boolean> {
    const userId = await getCurrentUserId();
    return userId !== null;
}

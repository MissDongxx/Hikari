/**
 * Supabase Storage Bucket 配置脚本
 * 用途: 创建视频存储 Bucket 并配置访问策略
 * 对应任务: T1.3 - 配置 Supabase Storage Bucket
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 手动加载 .env.local 文件
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        envVars[key] = value;
    }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ 错误: 环境变量未配置');
    process.exit(1);
}

// 创建 Supabase 管理客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

/**
 * 配置说明
 */
const BUCKET_CONFIG = {
    id: 'analysis-videos',
    name: 'analysis-videos',
    public: false, // 私有 Bucket，用户需要认证才能访问
    fileSizeLimit: 52428800, // 50 MB (50 * 1024 * 1024)
    allowedMimeTypes: [
        'video/mp4',
        'video/quicktime', // .mov
        'video/x-msvideo', // .avi
        'video/webm'
    ]
};

/**
 * 创建 Storage Bucket
 */
async function createBucket() {
    console.log('\n📦 创建 Storage Bucket: analysis-videos');
    console.log('─'.repeat(50));

    try {
        const { data, error } = await supabase.storage.createBucket(BUCKET_CONFIG.id, {
            public: BUCKET_CONFIG.public,
            fileSizeLimit: BUCKET_CONFIG.fileSizeLimit,
            allowedMimeTypes: BUCKET_CONFIG.allowedMimeTypes
        });

        if (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Bucket 已存在，跳过创建');
                return true;
            }
            throw error;
        }

        console.log('✅ Bucket 创建成功');
        console.log(`   ID: ${BUCKET_CONFIG.id}`);
        console.log(`   文件大小限制: ${BUCKET_CONFIG.fileSizeLimit / 1024 / 1024} MB`);
        return true;
    } catch (error) {
        console.error('❌ 创建 Bucket 失败:', error.message);
        return false;
    }
}

/**
 * 配置 RLS 策略（通过 SQL）
 * 注意：Storage 的 RLS 策略需要在数据库层面配置
 */
async function configureStoragePolicies() {
    console.log('\n🔐 配置 Storage RLS 策略');
    console.log('─'.repeat(50));

    const policies = `
-- ========================================
-- Storage Bucket RLS 策略配置
-- ========================================
-- Bucket: analysis-videos
-- 对应任务: T1.3

-- 策略 1: 用户可以上传自己的视频到自己的文件夹
create policy "Users can upload own videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'analysis-videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 2: 用户可以查看自己的视频 + 公共参考视频
create policy "Users can view own videos and reference videos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'analysis-videos' and
  (
    (storage.foldername(name))[1] = auth.uid()::text or
    (storage.foldername(name))[1] = 'reference'
  )
);

-- 策略 3: 用户可以删除自己的视频
create policy "Users can delete own videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'analysis-videos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 4: 管理员可以上传参考视频到 reference 文件夹
create policy "Admins can upload reference videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'analysis-videos' and
  (storage.foldername(name))[1] = 'reference'
  -- 注意：这里应该添加管理员角色检查，MVP 阶段暂时允许所有认证用户
);
  `;

    console.log('⚠️  Storage RLS 策略需要在 Supabase Dashboard SQL Editor 中执行');
    console.log('\n请复制以下 SQL 到 SQL Editor 执行：\n');
    console.log('```sql');
    console.log(policies);
    console.log('```\n');

    return policies;
}

/**
 * 创建文件夹结构说明
 */
function printFolderStructure() {
    console.log('\n📁 推荐的文件夹结构');
    console.log('─'.repeat(50));
    console.log(`
analysis-videos/
├── reference/                    # 系统参考视频（公开可读）
│   └── squat-standard.mp4       # 标准深蹲参考视频
│
└── {user_id}/                   # 用户视频（私有）
    ├── {video_id}_user.mp4      # 用户上传的动作视频
    └── {video_id}_reference.mp4 # 用户自定义参考视频（可选）

示例路径：
- 参考视频: reference/squat-standard.mp4
- 用户视频: 550e8400-e29b-41d4-a716-446655440000/abc123_user.mp4
  `);
}

/**
 * 测试上传（可选）
 */
async function testUpload() {
    console.log('\n🧪 测试 Bucket 可用性');
    console.log('─'.repeat(50));

    try {
        // 尝试列出 Bucket
        const { data, error } = await supabase.storage.getBucket(BUCKET_CONFIG.id);

        if (error) throw error;

        console.log('✅ Bucket 可访问');
        console.log(`   名称: ${data.name}`);
        console.log(`   公开: ${data.public ? '是' : '否'}`);
        console.log(`   创建时间: ${data.created_at}`);

        return true;
    } catch (error) {
        console.error('❌ Bucket 不可访问:', error.message);
        return false;
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('\n🚀 开始配置 Supabase Storage');
    console.log('='.repeat(50));

    // 1. 创建 Bucket
    const bucketCreated = await createBucket();
    if (!bucketCreated) {
        console.error('\n❌ Bucket 创建失败，终止配置');
        process.exit(1);
    }

    // 2. 测试 Bucket
    await testUpload();

    // 3. 输出 RLS 策略配置
    const policies = await configureStoragePolicies();

    // 4. 输出文件夹结构说明
    printFolderStructure();

    // 5. 保存 RLS 策略到文件
    const fs = await import('fs/promises');
    const path = await import('path');
    const policyFilePath = path.join(
        process.cwd(),
        'supabase',
        'migrations',
        '20260115000002_storage_policies.sql'
    );

    await fs.writeFile(policyFilePath, policies.trim());
    console.log(`\n💾 RLS 策略已保存到: ${policyFilePath}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Storage 配置完成！');
    console.log('='.repeat(50));
    console.log('\n📋 下一步操作：');
    console.log('  1. 在 Supabase Dashboard → SQL Editor 中执行 RLS 策略 SQL');
    console.log('  2. 上传标准深蹲参考视频到 reference/squat-standard.mp4');
    console.log('  3. 验证上传功能正常');
    console.log('\n');
}

// 执行主函数
main().catch(error => {
    console.error('\n💥 发生错误:', error);
    process.exit(1);
});

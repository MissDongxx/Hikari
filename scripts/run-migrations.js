/**
 * 数据库迁移执行脚本
 * 用途: 自动执行 supabase/migrations 目录下的 SQL 文件
 * 对应任务: T1.1, T1.2
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 需要执行的迁移文件（按顺序）
const MIGRATIONS = [
    '20260115000000_add_ai_tables.sql',
    '20260115000001_seed_exercise_types.sql'
];

/**
 * 验证环境变量
 */
function validateEnv() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ 错误: 环境变量未配置');
        console.error('请确保 .env.local 中配置了以下变量：');
        console.error('  - NEXT_PUBLIC_SUPABASE_URL');
        console.error('  - SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }
    console.log('✅ 环境变量验证通过');
}

/**
 * 创建 Supabase 客户端（使用 service_role key）
 */
function createSupabaseClient() {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * 读取 SQL 文件内容
 */
async function readMigrationFile(filename) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        throw new Error(`无法读取迁移文件 ${filename}: ${error.message}`);
    }
}

/**
 * 执行 SQL 迁移
 */
async function executeMigration(supabase, filename, sql) {
    console.log(`\n📄 执行迁移: ${filename}`);
    console.log('─'.repeat(50));

    try {
        // 使用 Supabase RPC 执行原始 SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

        if (error) {
            // 如果 exec_sql 函数不存在，尝试直接通过 REST API 执行
            console.log('⚠️  exec_sql 函数不可用，尝试通过 REST API 执行...');

            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ sql_string: sql })
            });

            if (!response.ok) {
                // REST API 也失败，使用 PostgREST 的 query 方法
                console.log('⚠️  REST API 执行失败，尝试直接执行 SQL...');

                // 分割 SQL 语句（按分号分隔）
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));

                console.log(`📝 分割为 ${statements.length} 条 SQL 语句`);

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];
                    console.log(`  执行语句 ${i + 1}/${statements.length}...`);

                    // 通过 from().select() 执行查询类语句，或者使用 rpc
                    // 注意：这个方法可能不适用于所有 DDL 语句
                    try {
                        // 尝试直接执行（需要自定义函数支持）
                        await executeRawSQL(supabase, statement + ';');
                    } catch (err) {
                        console.error(`  ❌ 语句执行失败: ${err.message}`);
                        throw err;
                    }
                }

                console.log('✅ 迁移执行成功');
                return;
            }

            console.log('✅ 迁移执行成功');
            return;
        }

        console.log('✅ 迁移执行成功');
    } catch (error) {
        console.error(`❌ 迁移执行失败: ${error.message}`);
        throw error;
    }
}

/**
 * 直接执行原始 SQL（通过 Supabase 管理 API）
 */
async function executeRawSQL(supabase, sql) {
    // 由于 Supabase JS 客户端不直接支持执行任意 SQL，
    // 我们需要使用替代方案
    throw new Error('需要手动在 Supabase Dashboard 执行，或使用 Database Webhooks');
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始执行数据库迁移');
    console.log('='.repeat(50));

    // 验证环境变量
    validateEnv();

    // 创建 Supabase 客户端
    const supabase = createSupabaseClient();
    console.log('✅ Supabase 客户端已创建');

    // 执行所有迁移
    for (const filename of MIGRATIONS) {
        try {
            const sql = await readMigrationFile(filename);
            await executeMigration(supabase, filename, sql);
        } catch (error) {
            console.error(`\n❌ 迁移失败: ${filename}`);
            console.error(error.message);
            process.exit(1);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 所有迁移执行成功！');
    console.log('\n📋 下一步: 验证数据库表已创建');
    console.log('  1. 登录 Supabase Dashboard');
    console.log('  2. 进入 Table Editor');
    console.log('  3. 确认以下表存在:');
    console.log('     - exercise_types (应有 1 条数据)');
    console.log('     - video_uploads');
    console.log('     - analysis_tasks');
    console.log('     - analysis_results');
}

// 执行主函数
main().catch(error => {
    console.error('\n💥 发生未捕获的错误:', error);
    process.exit(1);
});

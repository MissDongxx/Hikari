#!/usr/bin/env node

/**
 * SQL 迁移文件查看器
 * 用途: 在终端中显示迁移 SQL，方便复制到 Supabase Dashboard
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS = [
    '20260115000000_add_ai_tables.sql',
    '20260115000001_seed_exercise_types.sql'
];

console.log('\n' + '='.repeat(80));
console.log('📋 数据库迁移 SQL 文件内容');
console.log('='.repeat(80));
console.log('\n请依次在 Supabase Dashboard → SQL Editor 中执行以下 SQL：\n');

MIGRATIONS.forEach((filename, index) => {
    const filePath = join(__dirname, '..', 'supabase', 'migrations', filename);
    const content = readFileSync(filePath, 'utf-8');

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📄 迁移 ${index + 1}/${MIGRATIONS.length}: ${filename}`);
    console.log('─'.repeat(80));
    console.log('\n```sql');
    console.log(content);
    console.log('```\n');
});

console.log('='.repeat(80));
console.log('✅ 执行完成后，验证结果:');
console.log('='.repeat(80));
console.log(`
在 SQL Editor 中执行以下查询：

-- 验证表已创建
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('exercise_types', 'video_uploads', 
                    'analysis_tasks', 'analysis_results');

-- 验证深蹲数据
SELECT * FROM exercise_types WHERE name = 'squat';
`);
console.log('='.repeat(80) + '\n');

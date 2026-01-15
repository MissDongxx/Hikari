#!/bin/bash

# ========================================
# 数据库迁移执行脚本
# ========================================
# 用途: 通过 Supabase REST API 执行 SQL 迁移
# 对应任务: T1.1, T1.2

set -e  # 遇到错误立即退出

echo "🚀 开始执行数据库迁移"
echo "=================================================="

# 加载环境变量
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo "❌ 错误: .env.local 文件不存在"
  exit 1
fi

# 验证环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ 错误: 环境变量未配置"
  echo "请确保 .env.local 中配置了:"
  echo "  - NEXT_PUBLIC_SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo "✅ 环境变量验证通过"
echo "   Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

# 提取项目 ref (从 URL 中提取，例如: https://abc123.supabase.co)
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "   Project Ref: $PROJECT_REF"
echo ""

# 定义迁移文件列表
MIGRATIONS=(
  "supabase/migrations/20260115000000_add_ai_tables.sql"
  "supabase/migrations/20260115000001_seed_exercise_types.sql"
)

# 执行每个迁移文件
for migration_file in "${MIGRATIONS[@]}"; do
  echo "📄 执行迁移: $(basename $migration_file)"
  echo "--------------------------------------------------"
  
  if [ ! -f "$migration_file" ]; then
    echo "❌ 错误: 文件不存在 $migration_file"
    exit 1
  fi
  
  # 读取 SQL 文件内容
  SQL_CONTENT=$(cat "$migration_file")
  
  # 通过 Supabase Database API 执行 SQL
  # 注意: Supabase 不提供直接的 SQL 执行端点，需要使用 PostgREST
  # 最佳方案: 使用 psql 连接数据库
  
  echo "⚠️  注意: Supabase Cloud 不支持通过 API 直接执行 DDL 语句"
  echo "   需要手动在 Supabase Dashboard → SQL Editor 中执行"
  echo ""
  echo "   或者使用 psql 命令（需要数据库连接字符串）："
  echo "   psql \"\$DATABASE_URL\" -f \"$migration_file\""
  echo ""
done

echo "=================================================="
echo "🔔 自动执行受限"
echo ""
echo "由于 Supabase Cloud 的安全限制，SQL 迁移需要手动执行。"
echo ""
echo "📋 请按照以下步骤操作："
echo ""
echo "1. 登录 Supabase Dashboard: https://supabase.com/dashboard"
echo "2. 选择你的项目 (Project Ref: $PROJECT_REF)"
echo "3. 进入 SQL Editor → New query"
echo "4. 依次复制并执行以下文件内容:"
echo ""
for migration_file in "${MIGRATIONS[@]}"; do
  echo "   ✓ $migration_file"
done
echo ""
echo "5. 验证表已创建:"
echo "   执行以下查询:"
echo "   SELECT table_name FROM information_schema.tables"
echo "   WHERE table_schema = 'public'"
echo "   AND table_name IN ('exercise_types', 'video_uploads',"
echo "                       'analysis_tasks', 'analysis_results');"
echo ""
echo "=================================================="

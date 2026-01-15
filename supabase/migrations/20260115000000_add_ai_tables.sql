-- ========================================
-- AI 动作分析平台 - 数据表扩展
-- ========================================
-- 创建日期: 2026-01-15
-- 目标: 添加 AI 动作对比分析功能所需的数据表
-- 策略: 与现有 Stripe 表共存，不删除任何现有表
-- 对应任务: T1.1 - 创建 AI 数据表结构

-- ========================================
-- 保留原有表（完全不动）
-- ========================================
-- ✓ users (用户表)
-- ✓ customers (Stripe 客户映射)
-- ✓ products (Stripe 产品)
-- ✓ prices (定价)
-- ✓ subscriptions (订阅状态)

-- ========================================
-- 新增表 1: 动作类型表
-- ========================================
-- 用途: 存储支持的运动动作类型（MVP: 仅深蹲）
create table if not exists exercise_types (
  id serial primary key,
  name text not null unique,           -- 'squat', 'push_up', etc.
  display_name jsonb,                   -- {"en": "Squat", "zh": "深蹲", "ja": "スクワット"}
  description text,                     -- 动作说明
  enabled boolean default true,         -- 是否启用
  created_at timestamptz default now()
);

-- 添加注释
comment on table exercise_types is '运动动作类型表，定义系统支持的分析动作';
comment on column exercise_types.name is '动作标识符（英文小写）';
comment on column exercise_types.display_name is '多语言显示名称（JSON 格式）';

-- 启用 RLS（虽然是公开只读表）
alter table exercise_types enable row level security;

-- 允许所有用户查看动作类型
create policy "Allow public read-only access to exercise types" 
  on exercise_types for select 
  using (true);

-- ========================================
-- 新增表 2: 视频上传记录表
-- ========================================
-- 用途: 记录用户上传的视频和系统提供的参考视频
create table if not exists video_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,  -- 复用现有 auth.users
  exercise_type_id int references exercise_types,
  video_type text not null check (video_type in ('reference', 'user')),  -- 'reference' | 'user'
  file_path text not null,              -- Supabase Storage 路径 (bucket/folder/filename)
  file_size_bytes bigint,               -- 文件大小（字节）
  duration_seconds float,               -- 视频时长（秒）
  width int,                            -- 视频宽度
  height int,                           -- 视频高度
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 添加索引提升查询性能
create index video_uploads_user_id_idx on video_uploads(user_id);
create index video_uploads_exercise_type_id_idx on video_uploads(exercise_type_id);
create index video_uploads_created_at_idx on video_uploads(created_at desc);

-- 添加注释
comment on table video_uploads is '视频上传记录表，存储参考视频和用户上传视频的元数据';
comment on column video_uploads.video_type is '视频类型：reference=参考动作, user=用户动作';
comment on column video_uploads.file_path is 'Supabase Storage 中的文件路径';

-- 启用 RLS
alter table video_uploads enable row level security;

-- 用户只能查看自己上传的视频 + 系统参考视频
create policy "Users can view own videos and reference videos" 
  on video_uploads for select 
  using (
    auth.uid() = user_id 
    or video_type = 'reference'
  );

-- 用户只能插入自己的视频
create policy "Users can insert own videos" 
  on video_uploads for insert 
  with check (auth.uid() = user_id);

-- 用户只能删除自己的视频
create policy "Users can delete own videos" 
  on video_uploads for delete 
  using (auth.uid() = user_id);

-- ========================================
-- 新增表 3: 分析任务表
-- ========================================
-- 用途: 跟踪 AI 分析任务的状态
create table if not exists analysis_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,  -- 复用现有 users 表
  reference_video_id uuid references video_uploads on delete restrict,
  user_video_id uuid references video_uploads on delete restrict,
  exercise_type_id int references exercise_types,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'failed')
  ),
  error_message text,                   -- 失败时的错误信息
  processing_started_at timestamptz,    -- 开始处理时间
  processing_completed_at timestamptz,  -- 完成处理时间
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 添加索引
create index analysis_tasks_user_id_idx on analysis_tasks(user_id);
create index analysis_tasks_status_idx on analysis_tasks(status);
create index analysis_tasks_created_at_idx on analysis_tasks(created_at desc);

-- 添加注释
comment on table analysis_tasks is 'AI 分析任务表，跟踪每个分析请求的状态';
comment on column analysis_tasks.status is '任务状态：pending=待处理, processing=处理中, completed=已完成, failed=失败';

-- 启用 RLS
alter table analysis_tasks enable row level security;

-- 用户只能查看自己的任务
create policy "Users can view own analysis tasks" 
  on analysis_tasks for select 
  using (auth.uid() = user_id);

-- 用户只能创建自己的任务
create policy "Users can create own analysis tasks" 
  on analysis_tasks for insert 
  with check (auth.uid() = user_id);

-- 用户只能删除自己的任务
create policy "Users can delete own analysis tasks" 
  on analysis_tasks for delete 
  using (auth.uid() = user_id);

-- ========================================
-- 新增表 4: 分析结果表
-- ========================================
-- 用途: 存储 AI 分析的详细结果
create table if not exists analysis_results (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references analysis_tasks on delete cascade,
  
  -- 对比维度结果（JSON 格式，见架构文档 T2.5）
  comparison_result jsonb not null,     
  -- 格式示例:
  -- {
  --   "depth": {"status": "fail", "reference_value": 90, "user_value": 120, ...},
  --   "knee_tracking": {...},
  --   "torso_lean": {...},
  --   "balance": {...}
  -- }
  
  -- 骨架关键点数据（MediaPipe 输出）
  skeleton_data jsonb,                  
  -- 格式示例:
  -- {
  --   "reference": [{"frame_index": 0, "landmarks": [...]}, ...],
  --   "user": [{"frame_index": 0, "landmarks": [...]}, ...]
  -- }
  
  -- 总体评分（可选）
  overall_score int check (overall_score between 0 and 100),
  overall_grade text check (overall_grade in ('excellent', 'good', 'needs_improvement', 'poor')),
  
  created_at timestamptz default now()
);

-- 添加索引
create index analysis_results_task_id_idx on analysis_results(task_id);

-- 添加注释
comment on table analysis_results is 'AI 分析结果表，存储详细的对比数据和骨架信息';
comment on column analysis_results.comparison_result is '4 个对比维度的详细结果（JSONB）';
comment on column analysis_results.skeleton_data is 'MediaPipe 提取的骨架关键点序列（JSONB）';

-- 启用 RLS
alter table analysis_results enable row level security;

-- 用户只能查看自己任务的结果
create policy "Users can view own analysis results" 
  on analysis_results for select 
  using (
    exists (
      select 1 from analysis_tasks 
      where analysis_tasks.id = analysis_results.task_id 
      and analysis_tasks.user_id = auth.uid()
    )
  );

-- ========================================
-- 触发器: 自动更新 updated_at
-- ========================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_analysis_tasks_updated_at 
  before update on analysis_tasks
  for each row
  execute procedure update_updated_at_column();

-- ========================================
-- 初始化完成
-- ========================================
-- 至此，已创建 4 张新表：
-- ✓ exercise_types (动作类型)
-- ✓ video_uploads (视频上传记录)
-- ✓ analysis_tasks (分析任务)
-- ✓ analysis_results (分析结果)
--
-- 所有表已启用 RLS，确保数据隔离
-- 用户数据通过 auth.uid() = user_id 关联
-- 与现有 Stripe 表完全独立，无冲突

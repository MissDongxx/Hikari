-- ========================================
-- AI 动作分析平台 - 初始数据
-- ========================================
-- 创建日期: 2026-01-15
-- 目标: 插入 MVP 阶段支持的动作类型（深蹲）
-- 对应任务: T1.2 - 插入初始数据

-- ========================================
-- 插入初始动作类型: 深蹲 (Squat)
-- ========================================
insert into exercise_types (name, display_name, description, enabled) 
values (
  'squat',
  jsonb_build_object(
    'en', 'Squat',
    'zh', '深蹲',
    'ja', 'スクワット'
  ),
  'Basic squat exercise - fundamental lower body movement',
  true
)
on conflict (name) do nothing;

-- 验证数据
-- 执行后应返回 1 条记录：
-- SELECT * FROM exercise_types WHERE name = 'squat';

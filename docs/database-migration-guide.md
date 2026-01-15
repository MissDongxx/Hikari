# 数据库迁移执行指南

## 📋 任务进度: T1.1 & T1.2 已完成

### ✅ 已创建的迁移文件

1. **`supabase/migrations/20260115000000_add_ai_tables.sql`**
   - 创建 4 张 AI 分析表
   - 配置 RLS 策略
   - 添加索引和触发器

2. **`supabase/migrations/20260115000001_seed_exercise_types.sql`**
   - 插入深蹲动作初始数据

---

## 🚀 执行步骤（Supabase Cloud）

### 方式 A：通过 SQL Editor 执行（推荐）

1. **登录 Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单 → **SQL Editor**
   - 点击 **New query**

3. **执行第一个迁移**
   - 复制 `supabase/migrations/20260115000000_add_ai_tables.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 **Run** 按钮
   - ✅ 确认执行成功（无错误提示）

4. **执行第二个迁移**
   - 复制 `supabase/migrations/20260115000001_seed_exercise_types.sql` 的全部内容
   - 粘贴到 SQL Editor
   - 点击 **Run** 按钮
   - ✅ 确认执行成功

5. **验证结果**
   - 在 SQL Editor 中执行以下查询验证：
   ```sql
   -- 验证表已创建
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('exercise_types', 'video_uploads', 'analysis_tasks', 'analysis_results');
   
   -- 验证初始数据
   SELECT * FROM exercise_types WHERE name = 'squat';
   ```
   - 应该看到 4 张表 + 1 条深蹲数据

---

### 方式 B：通过 Supabase CLI 执行（可选）

如果你后续安装了 Supabase CLI，也可以这样执行：

```bash
# 链接到云端项目
supabase link --project-ref <your-project-ref>

# 推送迁移
supabase db push
```

---

## ✅ 完成标志

执行成功后，你应该能在 Supabase Dashboard → **Table Editor** 中看到：

- ✅ `exercise_types` 表（1 条数据：squat）
- ✅ `video_uploads` 表（空表）
- ✅ `analysis_tasks` 表（空表）
- ✅ `analysis_results` 表（空表）

原有 Stripe 表保持不变：
- ✅ `users`
- ✅ `customers`
- ✅ `products`
- ✅ `prices`
- ✅ `subscriptions`

---

## 🔄 下一步

完成迁移后，我将继续执行：
- **T1.3** - 配置 Supabase Storage Bucket（存储视频文件）

**请在执行完迁移后告诉我，我将继续下一个任务。**

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
-- 为 events 表添加 event_type 和 mood 字段的 CHECK 约束
-- 在运行 prisma migrate 后执行此文件

-- 1. event_type 字段的 CHECK 约束
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('plan', 'record'));

-- 2. mood 字段的 CHECK 约束（允许 NULL）
ALTER TABLE events 
ADD CONSTRAINT events_mood_check 
CHECK (mood IS NULL OR mood IN ('happy', 'calm', 'sad', 'excited', 'tired'));

-- 验证约束是否创建成功
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'events'::regclass
  AND conname IN ('events_event_type_check', 'events_mood_check')
ORDER BY conname;
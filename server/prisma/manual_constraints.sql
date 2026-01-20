-- 手动添加的数据库约束（Prisma schema 无法直接创建）
-- 在运行 prisma migrate 后，执行此文件中的 SQL

-- 1. User 表的 color 字段 CHECK 约束
ALTER TABLE users 
ADD CONSTRAINT users_color_check 
CHECK (color ~ '^#[0-9A-Fa-f]{6}$');

-- 2. Friendship 表的约束

-- a) 防止自己加自己为好友
ALTER TABLE friendships 
ADD CONSTRAINT no_self_friendship 
CHECK (user_id != friend_id);

-- b) Friendship status 的 CHECK 约束
ALTER TABLE friendships 
ADD CONSTRAINT friendships_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'));

-- c) 唯一索引（防止重复好友关系）
-- 注意：这个索引确保了 user_id 和 friend_id 的任意组合只能有一条记录
-- 无论哪个是 user_id，哪个是 friend_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_friendship 
ON friendships (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

-- 验证约束是否创建成功
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'friendships'::regclass
ORDER BY conname;
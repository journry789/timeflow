# 数据库迁移说明

## 初始化数据库

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
创建 `.env` 文件，设置 `DATABASE_URL`：
```
DATABASE_URL=postgresql://username:password@localhost:5432/timeflow?schema=public
```

3. 生成 Prisma Client：
```bash
npm run prisma:generate
```

4. 创建初始迁移：
```bash
npm run prisma:migrate
```
这会创建数据库表结构。

## 需要手动添加的约束

由于 Prisma schema 的局限性，以下约束需要在迁移文件中手动添加：

### 1. User 表的 color 字段 CHECK 约束

在生成的迁移文件中，找到 `users` 表的创建语句，添加：

```sql
ALTER TABLE users ADD CONSTRAINT users_color_check 
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
```

### 2. Friendship 表的约束

#### a) 防止自己加自己为好友：
```sql
ALTER TABLE friendships ADD CONSTRAINT no_self_friendship 
  CHECK (user_id != friend_id);
```

#### b) Friendship status 的 CHECK 约束：
```sql
ALTER TABLE friendships ADD CONSTRAINT friendships_status_check 
  CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'));
```

#### c) 唯一索引（防止重复好友关系）：
```sql
CREATE UNIQUE INDEX idx_unique_friendship 
  ON friendships (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));
```

## 完整的迁移 SQL 示例

如果需要手动创建数据库，可以使用以下 SQL：

```sql
-- 创建数据库（如需要）
CREATE DATABASE timeflow;

-- 使用数据库
\c timeflow;

-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Prisma 迁移会自动创建表结构
-- 运行：npm run prisma:migrate

-- 然后手动添加约束（见上面的约束说明）
```

## 验证数据库结构

运行 Prisma Studio 查看数据库：
```bash
npm run prisma:studio
```
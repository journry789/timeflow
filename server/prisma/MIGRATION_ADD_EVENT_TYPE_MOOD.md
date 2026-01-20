# 数据库迁移说明 - 添加事件类型和心情字段

## 新增字段

在 `events` 表中添加了两个新字段：

1. `event_type` (VARCHAR(20)): 事件类型
   - 默认值: `'record'`
   - 可选值: `'plan'` (计划), `'record'` (记录)

2. `mood` (VARCHAR(20), 可选): 心情
   - 可选值: `'happy'`, `'calm'`, `'sad'`, `'excited'`, `'tired'`
   - 可为 NULL

## 执行迁移

### 1. 生成迁移文件

```bash
cd server
npm run prisma:migrate
```

输入迁移名称：`add_event_type_and_mood`

### 2. 手动添加 CHECK 约束（可选）

如果需要在数据库层面验证字段值，可以执行以下 SQL：

```sql
-- 添加 event_type 的 CHECK 约束
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('plan', 'record'));

-- 添加 mood 的 CHECK 约束
ALTER TABLE events 
ADD CONSTRAINT events_mood_check 
CHECK (mood IS NULL OR mood IN ('happy', 'calm', 'sad', 'excited', 'tired'));
```

### 3. 更新 Prisma Client

```bash
npm run prisma:generate
```

## API 变更

### 创建事件 (POST /api/events)

**新增字段（可选）：**
- `event_type`: 'plan' | 'record' (默认: 'record')
- `mood`: 'happy' | 'calm' | 'sad' | 'excited' | 'tired' (可选)

**请求示例：**
```json
{
  "event_date": "2024-01-01T00:00:00Z",
  "title": "事件标题",
  "content": "事件内容",
  "image_url": "https://example.com/image.jpg",
  "event_type": "record",
  "mood": "happy"
}
```

### 更新事件 (PUT /api/events/:id)

**新增字段（可选）：**
- `event_type`: 'plan' | 'record'
- `mood`: 'happy' | 'calm' | 'sad' | 'excited' | 'tired' | null

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "event_type": "record",
    "mood": "happy",
    ...
  }
}
```

## 向后兼容

- 现有事件会自动获得默认的 `event_type: 'record'`
- `mood` 字段为可选，现有事件为 `null`
- 所有 API 调用不包含新字段时仍可正常工作
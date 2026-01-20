# TimeFlow API 测试脚本
# 使用方法: .\test-api.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Email = "test@example.com",
    [string]$Username = "testuser",
    [string]$Password = "password123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TimeFlow API 测试脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 健康检查
Write-Host "=== 1. 健康检查 ===" -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
    Write-Host "✓ 服务器运行正常" -ForegroundColor Yellow
    $health | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ 服务器未响应: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. 注册用户
Write-Host "=== 2. 注册用户 ===" -ForegroundColor Green
$registerBody = @{
    email = $Email
    username = $Username
    password = $Password
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"
    
    if ($registerResponse.success) {
        $script:token = $registerResponse.data.token
        Write-Host "✓ 注册成功!" -ForegroundColor Yellow
        Write-Host "  Token: $token" -ForegroundColor Gray
        $registerResponse.data.user | Format-List
    } else {
        Write-Host "✗ 注册失败: $($registerResponse.message)" -ForegroundColor Red
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message) {
        Write-Host "✗ 注册失败: $($errorResponse.message)" -ForegroundColor Red
    } else {
        Write-Host "✗ 注册失败: $_" -ForegroundColor Red
    }
    # 如果注册失败，尝试登录
    Write-Host "  尝试登录已存在的用户..." -ForegroundColor Gray
    goto Login
}

Write-Host ""

# 3. 登录（如果注册失败会跳转到这里）
:Login
Write-Host "=== 3. 登录 ===" -ForegroundColor Green
$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    if ($loginResponse.success) {
        $script:token = $loginResponse.data.token
        Write-Host "✓ 登录成功!" -ForegroundColor Yellow
        Write-Host "  Token: $token" -ForegroundColor Gray
    } else {
        Write-Host "✗ 登录失败: $($loginResponse.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message) {
        Write-Host "✗ 登录失败: $($errorResponse.message)" -ForegroundColor Red
    } else {
        Write-Host "✗ 登录失败: $_" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# 4. 获取当前用户信息
Write-Host "=== 4. 获取当前用户信息 ===" -ForegroundColor Green
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $userInfo = Invoke-RestMethod -Uri "$BaseUrl/api/users/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ 获取用户信息成功" -ForegroundColor Yellow
    $userInfo.data | Format-List
} catch {
    Write-Host "✗ 获取用户信息失败: $_" -ForegroundColor Red
}

Write-Host ""

# 5. 创建事件
Write-Host "=== 5. 创建事件 ===" -ForegroundColor Green
$eventBody = @{
    event_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    title = "我的第一个事件"
    content = "这是通过 PowerShell 测试脚本创建的事件"
} | ConvertTo-Json

try {
    $eventResponse = Invoke-RestMethod -Uri "$BaseUrl/api/events" `
        -Method Post `
        -Body $eventBody `
        -Headers $headers `
        -ContentType "application/json"
    
    if ($eventResponse.success) {
        Write-Host "✓ 事件创建成功!" -ForegroundColor Yellow
        $eventResponse.data | Format-List
        $script:eventId = $eventResponse.data.id
    } else {
        Write-Host "✗ 创建事件失败: $($eventResponse.message)" -ForegroundColor Red
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message) {
        Write-Host "✗ 创建事件失败: $($errorResponse.message)" -ForegroundColor Red
    } else {
        Write-Host "✗ 创建事件失败: $_" -ForegroundColor Red
    }
}

Write-Host ""

# 6. 获取事件列表
Write-Host "=== 6. 获取事件列表 ===" -ForegroundColor Green
try {
    $events = Invoke-RestMethod -Uri "$BaseUrl/api/events" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ 获取事件列表成功 (共 $($events.data.Count) 个事件)" -ForegroundColor Yellow
    $events.data | Format-Table -Property id, title, event_date
} catch {
    Write-Host "✗ 获取事件列表失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "保存的 Token 可以在后续请求中使用:" -ForegroundColor Gray
Write-Host "  `$headers = @{ 'Authorization' = 'Bearer $token' }" -ForegroundColor Gray
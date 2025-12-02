# 测试 JWT Token 生成和验证

# 1. 先登录获取 token
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "=== 步骤 1: 登录获取 Token ===" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "登录响应: " -NoNewline
$loginResponse | ConvertTo-Json -Depth 5

if ($loginResponse.code -eq 200) {
    $token = $loginResponse.data.token
    Write-Host "`n获取到的 Token: $token" -ForegroundColor Green
    
    # 2. 使用 token 访问需要认证的接口
    Write-Host "`n=== 步骤 2: 使用 Token 访问 /api/menus/user-menus ===" -ForegroundColor Cyan
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $menusResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/menus/user-menus" -Method Get -Headers $headers
        Write-Host "菜单响应: " -ForegroundColor Green
        $menusResponse | ConvertTo-Json -Depth 5
    } catch {
        Write-Host "错误: " -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "响应内容: $responseBody" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "登录失败!" -ForegroundColor Red
}

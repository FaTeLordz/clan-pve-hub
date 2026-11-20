param([switch]$Serve)

# =========================================================
# Clan Hub Native PowerShell Test Suite & Port 3000 Listener
# =========================================================

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🧪 Running PowerShell Environment Validation Tests" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$baseDir = $PSScriptRoot
$errors = 0

# Test 1: Verify Core Files
$requiredFiles = @(
    "package.json",
    "docker-compose.yml",
    "Dockerfile",
    "README.md",
    "update.sh",
    ".gitignore",
    ".env.example",
    "src\index.js",
    "src\db.js",
    "src\server\api.js",
    "src\server\public\index.html",
    "src\server\public\style.css",
    "src\server\public\app.js",
    "src\bot\commands.js",
    "src\bot\handlers.js",
    "tests\run-tests.js",
    "tests\db.test.js",
    "tests\api.test.js",
    "tests\bot.test.js"
)

Write-Host "`n[1/4] Checking Required Files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        Write-Host "  ✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $errors++
    }
}

# Test 2: Validate package.json
Write-Host "`n[2/4] Validating package.json & test script..." -ForegroundColor Yellow
try {
    $pkg = Get-Content (Join-Path $baseDir "package.json") -Raw | ConvertFrom-Json
    if ($pkg.scripts.test -eq "node tests/run-tests.js") {
        Write-Host "  ✅ package.json has 'test' script configured properly" -ForegroundColor Green
    } else {
        Write-Host "  ❌ package.json test script missing or invalid" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "  ❌ Failed to parse package.json: $_" -ForegroundColor Red
    $errors++
}

# Test 3: Validate Game Hub Content
Write-Host "`n[3/4] Validating Game Hub Franchises in HTML & JS..." -ForegroundColor Yellow
$htmlContent = Get-Content (Join-Path $baseDir "src\server\public\index.html") -Raw
$expectedKeywords = @("Call of Duty", "Zombies", "Halo", "Firefight", "Gears of War", "Horde", "Rogue Run")

foreach ($kw in $expectedKeywords) {
    if ($htmlContent -match [regex]::Escape($kw)) {
        Write-Host "  ✅ HTML includes $kw" -ForegroundColor Green
    } else {
        Write-Host "  ❌ HTML missing $kw" -ForegroundColor Red
        $errors++
    }
}

# Summary
Write-Host "`n====================================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "🎉 ALL STATIC TESTS PASSED (100% VALIDATION)" -ForegroundColor Green
} else {
    Write-Host "❌ $errors TESTS FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "====================================================" -ForegroundColor Cyan

# Optional: Run quick local port 3000 test
if ($Serve) {
    Write-Host "`n🌐 Starting Native HTTP Server on http://localhost:3000/ ..." -ForegroundColor Cyan
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:3000/")
    try {
        $listener.Start()
        Write-Host "  ✅ Successfully listening on http://localhost:3000/" -ForegroundColor Green
        Write-Host "  Press Ctrl+C to stop.`n"
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $response = $context.Response
            $response.ContentType = "text/html; charset=utf-8"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($htmlContent)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
        }
    } finally {
        $listener.Stop()
    }
}

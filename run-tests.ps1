Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Running Frontend Tests (Vitest)          " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# The --reporter=verbose flag was added to package.json so this will now print progress
npm run test

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] Frontend tests failed! Stopping." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Running Backend Tests (pytest)           " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location backend
Write-Host "Installing backend test dependencies..." -ForegroundColor Gray
python -m pip install -r requirements.txt -q
python -m pip install -r requirements-dev.txt -q

# -v makes it print each test as it runs
python -m pytest tests/ -v

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] Backend tests failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " All tests passed successfully! ✅         " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

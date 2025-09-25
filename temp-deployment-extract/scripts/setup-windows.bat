@echo off
echo Payslip Generator - Windows Setup
echo ==================================

echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed
    echo Please install Docker Desktop
    pause
    exit /b 1
)

echo Docker is available

if not exist .env.production (
    if exist .env.example (
        copy .env.example .env.production
        echo Created .env.production from example
    )
)

echo Setup completed!
echo Please edit .env.production with your configuration
pause

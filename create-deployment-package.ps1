param(
    [string]$OutputPath = "payslip-generator-ovhcloud-deployment.zip",
    [switch]$IncludeBuild = $false,
    [switch]$Verbose = $false
)

# Ensure OutputPath is absolute
if (-not [System.IO.Path]::IsPathRooted($OutputPath)) {
    $OutputPath = Join-Path (Get-Location) $OutputPath
}

try {
    Write-Host "Payslip Generator - OVHcloud Deployment Packager" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    
    # Create temporary deployment directory
    $TempDir = Join-Path $env:TEMP "payslip-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $DeploymentDir = Join-Path $TempDir "payslip-generator-deployment"
    
    Write-Host "Creating deployment structure..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $DeploymentDir -Force | Out-Null
    
    # Create subdirectories
    $SubDirs = @("config", "scripts", "docs", "app")
    foreach ($dir in $SubDirs) {
        New-Item -ItemType Directory -Path (Join-Path $DeploymentDir $dir) -Force | Out-Null
    }
    
    Write-Host "Copying configuration files..." -ForegroundColor Yellow
    
    # Copy configuration files
    $ConfigFiles = @(
        ".env.production",
        ".env.example", 
        "docker-compose.yml",
        "ovhcloud-deploy.sh"
    )
    
    foreach ($file in $ConfigFiles) {
        if (Test-Path $file) {
            Copy-Item $file (Join-Path $DeploymentDir "config") -Force
            if ($Verbose) { Write-Host "  Copied $file" -ForegroundColor Green }
        }
    }
    
    Write-Host "Copying documentation..." -ForegroundColor Yellow
    
    # Copy documentation
    $DocFiles = @(
        "OVHCLOUD_DEPLOYMENT_GUIDE.md",
        "PRODUCTION_CHECKLIST.md",
        "README.md"
    )
    
    foreach ($file in $DocFiles) {
        if (Test-Path $file) {
            Copy-Item $file (Join-Path $DeploymentDir "docs") -Force
            if ($Verbose) { Write-Host "  Copied $file" -ForegroundColor Green }
        }
    }
    
    Write-Host "Copying application files..." -ForegroundColor Yellow
    
    # Copy application directory
    if (Test-Path "payslip-web") {
        $AppDestination = Join-Path $DeploymentDir "app\payslip-web"
        
        # Create app directory structure
        robocopy "payslip-web" $AppDestination /E /XD node_modules .git /XF "*.log" "npm-debug.log*" /NFL /NDL /NJH /NJS | Out-Null
        
        if ($IncludeBuild -and (Test-Path "payslip-web\build")) {
            Write-Host "  Including production build" -ForegroundColor Green
        } else {
            Write-Host "  Production build not included (use -IncludeBuild to include)" -ForegroundColor Yellow
        }
    }
    
    # Copy Supabase files
    if (Test-Path "supabase") {
        robocopy "supabase" (Join-Path $DeploymentDir "app\supabase") /E /NFL /NDL /NJH /NJS | Out-Null
        if ($Verbose) { Write-Host "  Copied Supabase configuration" -ForegroundColor Green }
    }
    
    Write-Host "Creating setup scripts..." -ForegroundColor Yellow
    
    # Create Linux setup script content
    $LinuxSetupContent = @'
#!/bin/bash
echo "Payslip Generator - Quick Setup"
echo "==============================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root for security reasons"
   exit 1
fi

# Set default values
DOMAIN=${DOMAIN:-localhost}
EMAIL=${EMAIL:-admin@localhost}

echo "Configuration:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"

# Copy environment file if needed
if [ ! -f .env.production ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.production
        echo "Created .env.production from example"
    fi
fi

# Make deployment script executable
chmod +x ovhcloud-deploy.sh

echo ""
echo "Setup completed!"
echo "Next steps:"
echo "1. Edit .env.production with your configuration"
echo "2. Run: ./ovhcloud-deploy.sh"
'@
    
    $LinuxSetupContent | Out-File -FilePath (Join-Path $DeploymentDir "scripts\quick-setup.sh") -Encoding UTF8
    
    # Create Windows setup script content
    $WindowsSetupContent = @'
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
'@
    
    $WindowsSetupContent | Out-File -FilePath (Join-Path $DeploymentDir "scripts\setup-windows.bat") -Encoding UTF8
    
    Write-Host "Creating deployment information..." -ForegroundColor Yellow
    
    # Create README for deployment
    $DeploymentReadme = @"
# Payslip Generator - OVHcloud Deployment Package

This package contains everything needed to deploy the Payslip Generator application on OVHcloud.

## Contents

- **config/**: Configuration files (Docker Compose, environment templates, deployment script)
- **scripts/**: Setup scripts for different platforms
- **docs/**: Complete deployment documentation
- **app/**: Application source code and database migrations

## Quick Start

### Linux/macOS
1. Extract this package to your server
2. Navigate to the config directory: ``cd config``
3. Run the setup script: ``../scripts/quick-setup.sh``
4. Edit .env.production with your configuration
5. Run: ``./ovhcloud-deploy.sh``

### Windows
1. Extract this package
2. Navigate to the config directory
3. Run: ``..\scripts\setup-windows.bat``
4. Edit .env.production with your configuration
5. Run: ``docker-compose up -d``

## Documentation

See the docs/ directory for complete guides:
- OVHCLOUD_DEPLOYMENT_GUIDE.md - Complete deployment instructions
- PRODUCTION_CHECKLIST.md - Pre-deployment checklist
- README.md - Application documentation

## Support

For issues and support, please refer to the documentation or contact your system administrator.

Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Package version: 1.0.0
"@
    
    $DeploymentReadme | Out-File -FilePath (Join-Path $DeploymentDir "README.md") -Encoding UTF8
    
    # Create version info
    $VersionInfo = @{
        version = "1.0.0"
        created = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        platform = "OVHcloud"
        includes_build = $IncludeBuild
    }
    
    $VersionInfo | ConvertTo-Json | Out-File -FilePath (Join-Path $DeploymentDir "version.json") -Encoding UTF8
    
    Write-Host "Creating deployment archive..." -ForegroundColor Yellow
    
    # Remove existing package if it exists
    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
        Write-Host "  Removed existing package" -ForegroundColor Yellow
    }
    
    # Create ZIP archive
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($DeploymentDir, $OutputPath)
    
    # Get file size (check if file exists first)
    $FileSize = 0
    if (Test-Path $OutputPath) {
        $FileSize = [math]::Round((Get-Item $OutputPath).Length / 1MB, 2)
    }
    
    Write-Host ""
    Write-Host "Deployment package created successfully!" -ForegroundColor Green
    Write-Host "Package: $OutputPath" -ForegroundColor Cyan
    Write-Host "Size: $FileSize MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Package Contents:" -ForegroundColor Yellow
    Write-Host "  • Configuration files (Docker Compose, environment templates)" -ForegroundColor White
    Write-Host "  • Deployment scripts (Linux/Windows)" -ForegroundColor White
    Write-Host "  • Complete documentation" -ForegroundColor White
    Write-Host "  • Application source code" -ForegroundColor White
    Write-Host "  • Database migrations" -ForegroundColor White
    if ($IncludeBuild) {
        Write-Host "  • Production build files" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Ready for OVHcloud deployment!" -ForegroundColor Green
    
} catch {
    Write-Host "Error creating deployment package: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup temporary directory
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
    }
}
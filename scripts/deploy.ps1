# scripts/deploy.ps1
# MealMuse API Lambda Deployment Script

Write-Host "🧹 Cleaning previous build artifacts..." -ForegroundColor Cyan
Remove-Item -Recurse -Force lambda_build -ErrorAction SilentlyContinue
Remove-Item -Force lambda_all.zip -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host "✅ Clean complete`n" -ForegroundColor Green

Write-Host "🔨 Building the project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete`n" -ForegroundColor Green

Write-Host "📦 Preparing deployment package..." -ForegroundColor Cyan

# Create build folder
Write-Host "  Creating lambda_build directory..."
New-Item -ItemType Directory -Force -Path lambda_build | Out-Null

# Copy compiled output
Write-Host "  Copying dist folder..."
xcopy dist lambda_build\dist /E /I /Y | Out-Null

# Copy node modules
Write-Host "  Copying node_modules (this may take a moment)..."
xcopy node_modules lambda_build\node_modules /E /I /Y | Out-Null

# Copy package files
Write-Host "  Copying package files..."
copy package.json lambda_build\
copy package-lock.json lambda_build\

# Remove .env if present
Remove-Item -Force lambda_build\.env -ErrorAction SilentlyContinue

Write-Host "✅ Deployment package prepared`n" -ForegroundColor Green

Write-Host "🗜️  Zipping package..." -ForegroundColor Cyan
Compress-Archive -Path lambda_build\* -DestinationPath lambda_all.zip -Force

if ($?) {
    Write-Host "✅ Package complete!`n" -ForegroundColor Green
    Write-Host "📦 Created: lambda_all.zip" -ForegroundColor Yellow
    Write-Host "📤 Ready to upload to AWS Lambda`n" -ForegroundColor Yellow
} else {
    Write-Host "❌ Packaging failed!" -ForegroundColor Red
    exit 1
}

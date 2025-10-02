@echo off
REM Deployment script for Solana Developer Tool (Windows)
REM This script handles the build and deployment process

echo 🚀 Starting deployment process...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: pnpm is not installed. Please install pnpm first.
    echo    npm install -g pnpm
    exit /b 1
)

echo 📦 Installing dependencies...
pnpm install
if errorlevel 1 exit /b 1

echo 🔍 Running linting...
pnpm lint
if errorlevel 1 exit /b 1

echo 🏗️ Building application...
pnpm build
if errorlevel 1 exit /b 1

echo ✅ Build completed successfully!

REM Check if Vercel CLI is available for deployment
npx vercel --version >nul 2>&1
if not errorlevel 1 (
    echo 🚀 Deploying to Vercel...
    npx vercel --prod
    echo ✅ Deployment completed!
) else (
    echo 📋 Build ready for deployment!
    echo    To deploy to Vercel: npx vercel --prod
    echo    To deploy to other platforms, upload the .next folder
)

echo 🎉 Deployment process completed!
pause
#!/bin/bash

# Deployment script for Solana Developer Tool
# This script handles the build and deployment process

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed. Please install pnpm first."
    echo "   npm install -g pnpm"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔍 Running linting..."
pnpm lint

echo "🏗️ Building application..."
pnpm build

echo "✅ Build completed successfully!"

# Check if Vercel CLI is available for deployment
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment completed!"
else
    echo "📋 Build ready for deployment!"
    echo "   To deploy to Vercel: npx vercel --prod"
    echo "   To deploy to other platforms, upload the .next folder"
fi

echo "🎉 Deployment process completed!"
#!/bin/bash
set -e

echo "🧹 1단계: 기존 프로세스 정리..."
# PM2 프로세스 삭제 (있으면)
if command -v pm2 &> /dev/null; then
    pm2 delete websitecheck 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
fi

# 실행 중인 Node 프로세스 종료
pkill -f "node.*websitecheck" || true
sleep 2

echo "🗑️  2단계: 빌드 캐시 완전 삭제..."
rm -rf .next .swc node_modules/.cache

echo "📦 3단계: 프로덕션 빌드..."
npm run build

echo "🚀 4단계: 프로덕션 모드로 실행 (포트 80)..."
sudo PORT=80 NODE_ENV=production npm start

#!/bin/bash
# SSL 인증서 발급 후 실행하는 스크립트

set -e

echo "🔒 SSL 적용 후 애플리케이션 설정 업데이트..."
echo ""

# 1. lib/authUtils.ts secure 플래그를 true로 변경
echo "⚙️  1단계: 쿠키 secure 플래그를 true로 변경..."
cd /home/user/websitecheck

# secure: false -> secure: true 변경
sed -i 's/secure: false, \/\/ HTTP 환경에서 작동하도록 false로 설정 (HTTPS 사용 시 true로 변경)/secure: true, \/\/ HTTPS 환경에서 보안 쿠키 사용/g' lib/authUtils.ts

echo "✅ lib/authUtils.ts 수정 완료"

# 2. 기존 프로세스 종료
echo "🧹 2단계: 기존 프로세스 종료..."
pkill -f "node.*next" || true
sleep 2

# 3. 빌드 캐시 삭제
echo "🗑️  3단계: 빌드 캐시 삭제..."
rm -rf .next .swc node_modules/.cache

# 4. 프로덕션 빌드
echo "📦 4단계: 프로덕션 빌드..."
npm run build

# 5. 프로덕션 서버 시작
echo "🚀 5단계: 프로덕션 서버 시작..."
PORT=3000 NODE_ENV=production nohup npm start > logs/app.log 2>&1 &

echo ""
echo "✅ 모든 작업 완료!"
echo ""
echo "📋 확인 사항:"
echo "1. https://supercost.co.kr 접속 테스트"
echo "2. 로그인/로그아웃 테스트"
echo "3. 브라우저 개발자도구 > Application > Cookies에서 Secure 플래그 확인"
echo ""
echo "📊 로그 확인: tail -f logs/app.log"

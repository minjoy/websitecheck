#!/bin/bash
# HTTPS 설정 스크립트 - supercost.co.kr (Amazon Linux용)

set -e

echo "🚀 HTTPS 설정을 시작합니다..."
echo ""

# 1. nginx 설치
echo "📦 1단계: nginx 설치 중..."
sudo yum install -y nginx

# 2. EPEL 저장소 추가 (Certbot을 위해 필요)
echo "📦 2단계: EPEL 저장소 추가 중..."
sudo yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-$(rpm -E %{rhel}).noarch.rpm || true

# 3. Certbot 설치
echo "📦 3단계: Certbot 설치 중..."
sudo yum install -y certbot python3-certbot-nginx || sudo yum install -y certbot

# 4. nginx 기본 설정
echo "⚙️  4단계: nginx 설정 중..."
sudo tee /etc/nginx/conf.d/supercost.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name supercost.co.kr www.supercost.co.kr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 5. nginx 설정 테스트
echo "✅ 5단계: nginx 설정 테스트..."
sudo nginx -t

# 6. nginx 시작 및 활성화
echo "🔄 6단계: nginx 시작..."
sudo systemctl start nginx
sudo systemctl enable nginx

echo ""
echo "✅ nginx 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. EC2 보안 그룹에서 포트 80, 443 열기 (필수!)"
echo "2. 아래 명령어로 SSL 인증서 발급:"
echo ""
echo "   sudo certbot --nginx -d supercost.co.kr -d www.supercost.co.kr"
echo ""
echo "   또는 certbot이 nginx 플러그인을 지원하지 않는 경우:"
echo ""
echo "   sudo certbot certonly --standalone -d supercost.co.kr -d www.supercost.co.kr"
echo "   그 후 수동으로 nginx SSL 설정 필요"
echo ""
echo "3. 이메일 입력 및 약관 동의"
echo "4. 완료 후 ./after-ssl.sh 실행"
echo "5. https://supercost.co.kr 로 접속 테스트"

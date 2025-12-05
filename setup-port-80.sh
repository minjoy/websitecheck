#!/bin/bash
# 포트 80 → 3000 포워딩 설정

echo "🔧 iptables 포트 포워딩 설정..."

# 기존 규칙 삭제 (있으면)
sudo iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000 2>/dev/null || true

# 새 규칙 추가
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000

echo "✅ 포트 80 → 3000 포워딩 설정 완료!"
echo "이제 http://[EC2_IP] (포트 80)로 접속 가능합니다."

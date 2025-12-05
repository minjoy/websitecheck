# 🔒 HTTPS 설정 완벽 가이드 - supercost.co.kr

## 📋 전체 작업 순서

1. ✅ **가비아 DNS 설정** (완료)
2. ⚙️ **EC2 보안 그룹 설정** (필수)
3. 🔧 **nginx 및 SSL 설치**
4. 🔐 **SSL 인증서 발급**
5. 🚀 **애플리케이션 재배포**
6. ✅ **테스트**

---

## 1️⃣ EC2 보안 그룹 설정 (먼저 해야 함!)

AWS 콘솔에서 EC2 보안 그룹에 다음 포트를 열어주세요:

| 포트 | 프로토콜 | 소스 | 설명 |
|------|----------|------|------|
| 80 | TCP | 0.0.0.0/0 | HTTP (인증서 발급용) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 22 | TCP | 본인 IP | SSH |

**설정 방법:**
1. AWS EC2 콘솔 접속
2. 인스턴스 선택 → 보안 → 보안 그룹 클릭
3. 인바운드 규칙 편집
4. 위 포트 추가

---

## 2️⃣ SSH로 EC2 접속 후 아래 명령어 실행

### Step 1: HTTPS 설정 스크립트 실행

```bash
cd /home/user/websitecheck
./setup-https.sh
```

이 스크립트는 다음을 수행합니다:
- nginx 설치
- Certbot (Let's Encrypt) 설치
- nginx 기본 설정
- nginx 시작

---

### Step 2: SSL 인증서 발급

```bash
sudo certbot --nginx -d supercost.co.kr -d www.supercost.co.kr
```

**진행 과정:**
1. 이메일 주소 입력 (인증서 만료 알림용)
2. 약관 동의 (A 입력)
3. 뉴스레터 구독 여부 (Y/N)
4. 자동으로 nginx 설정에 HTTPS 추가됨

**성공 메시지:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/supercost.co.kr/fullchain.pem
```

---

### Step 3: 애플리케이션 재배포 (SSL 적용 후)

```bash
./after-ssl.sh
```

이 스크립트는 다음을 수행합니다:
- `lib/authUtils.ts`의 쿠키 secure 플래그를 `true`로 변경
- 기존 프로세스 종료
- 빌드 캐시 삭제
- 프로덕션 재빌드
- 서버 재시작

---

## 3️⃣ 테스트

### 1. HTTPS 접속 테스트
```
https://supercost.co.kr
```

### 2. 로그인 테스트
- 로그인 시도
- 쿠키 확인: 브라우저 개발자도구 → Application → Cookies → Secure 플래그 확인

### 3. HTTP → HTTPS 리다이렉트 테스트
```
http://supercost.co.kr  (자동으로 https로 리다이렉트 되어야 함)
```

---

## 🔧 문제 해결

### nginx 상태 확인
```bash
sudo systemctl status nginx
```

### nginx 로그 확인
```bash
sudo tail -f /var/log/nginx/error.log
```

### 애플리케이션 로그 확인
```bash
tail -f /home/user/websitecheck/logs/app.log
```

### SSL 인증서 확인
```bash
sudo certbot certificates
```

### SSL 인증서 갱신 (90일마다 자동 갱신됨)
```bash
sudo certbot renew --dry-run  # 테스트
sudo certbot renew            # 실제 갱신
```

---

## 📌 중요 사항

1. **DNS 전파**: DNS 변경 후 최대 24시간 소요될 수 있습니다 (보통 몇 분~몇 시간)
2. **인증서 갱신**: Let's Encrypt 인증서는 90일마다 갱신 필요 (자동 갱신 설정됨)
3. **보안 그룹**: 포트 80, 443이 열려있어야 합니다
4. **방화벽**: EC2 내부 방화벽(ufw 등)도 확인하세요

---

## 🎯 완료 체크리스트

- [ ] EC2 보안 그룹에서 포트 80, 443 열기
- [ ] `./setup-https.sh` 실행
- [ ] `sudo certbot --nginx -d supercost.co.kr -d www.supercost.co.kr` 실행
- [ ] `./after-ssl.sh` 실행
- [ ] https://supercost.co.kr 접속 테스트
- [ ] 로그인/로그아웃 테스트
- [ ] 브라우저에서 자물쇠 아이콘 확인

---

## 📞 추가 지원

문제가 발생하면 아래 정보를 확인해주세요:
- nginx 에러 로그: `/var/log/nginx/error.log`
- Certbot 로그: `/var/log/letsencrypt/letsencrypt.log`
- 애플리케이션 로그: `/home/user/websitecheck/logs/app.log`

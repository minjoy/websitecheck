# 🛍️ 마켓플레이스 딜 사이트

> AI 기반 자동 카테고리 분류 및 키워드 알림 기능을 갖춘 오픈마켓 특가 상품 추천 웹 서비스

## 🎯 프로젝트 특징

이 프로젝트는 **Next.js 14 풀스택 아키텍처**로 구현되어 있습니다:

- ✅ **통합 프로젝트**: backend/frontend 분리 없이 하나의 프로젝트
- ✅ **한 번에 빌드**: `npm install` → `npm run build` → `npm start`
- ✅ **Next.js API Routes**: 백엔드 API 구현
- ✅ **Prisma ORM**: MySQL 데이터베이스 관리
- ✅ **AWS RDS**: 프로덕션 데이터베이스

---

## 📦 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **데이터베이스**: MySQL 8.0 (AWS RDS)
- **ORM**: Prisma
- **인증**: JWT (HttpOnly 쿠키)
- **스타일링**: TailwindCSS
- **이메일**: Nodemailer

---

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 데이터베이스 (AWS RDS)
DATABASE_URL="mysql://admin:YOUR_PASSWORD@websitecheck-db.cnqkao6y0x4y.ap-northeast-2.rds.amazonaws.com:3306/marketplace_deals"

# JWT 설정
JWT_SECRET="랜덤한_긴_문자열"
JWT_EXPIRES_IN="15m"

# 이메일 설정 (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="마켓플레이스 딜 <no-reply@yourdomain.com>"

# 앱 설정
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**중요**:
- `YOUR_PASSWORD`를 실제 RDS 비밀번호로 변경
- `JWT_SECRET`은 `openssl rand -base64 32` 명령어로 생성 가능
- Gmail SMTP를 사용하려면 [앱 비밀번호](https://support.google.com/accounts/answer/185833)를 생성해야 합니다

### 2. 데이터베이스 초기화

먼저 RDS에 데이터베이스를 생성하세요:

```bash
# MySQL 클라이언트로 RDS 접속
mysql -h websitecheck-db.cnqkao6y0x4y.ap-northeast-2.rds.amazonaws.com -u admin -p

# 데이터베이스 생성
CREATE DATABASE marketplace_deals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. 패키지 설치 및 Prisma 설정

```bash
# 패키지 설치 (Prisma 클라이언트 자동 생성됨)
npm install

# Prisma 마이그레이션 실행 (테이블 생성)
npx prisma migrate dev --name init

# 또는 기존 DB에 Prisma 스키마 푸시
npx prisma db push
```

### 4. 관리자 계정 생성 ⭐

관리자 계정을 생성하려면 다음 명령어를 실행하세요:

```bash
npm run create-admin
```

실행 예시:

```
🔐 관리자 계정 생성

관리자 이메일: admin@example.com
비밀번호: ********

✅ 관리자 계정이 생성되었습니다:
   이메일: admin@example.com
   ID: 1
```

**기존 사용자를 관리자로 만들기**:

동일한 이메일로 `npm run create-admin`을 실행하면 기존 사용자를 관리자로 업데이트할 수 있습니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 6. 프로덕션 빌드 및 실행

```bash
# 빌드
npm run build

# 프로덕션 실행
npm start
```

---

## 📂 프로젝트 구조

```
websitecheck/
├── prisma/
│   ├── schema.prisma          # Prisma 스키마 (13개 테이블)
│   └── create-admin.ts        # 관리자 계정 생성 스크립트
├── src/
│   ├── app/
│   │   ├── api/               # Next.js API Routes (백엔드)
│   │   │   ├── auth/
│   │   │   │   └── login/     # 로그인 API
│   │   │   ├── products/      # 상품 API
│   │   │   └── user/          # 사용자 API
│   │   ├── layout.tsx         # 전역 레이아웃
│   │   ├── page.tsx           # 메인 페이지
│   │   └── globals.css        # 전역 스타일
│   ├── components/            # React 컴포넌트
│   └── lib/
│       ├── prisma.ts          # Prisma 클라이언트
│       └── auth.ts            # 인증 유틸리티
├── .env                       # 환경 변수 (직접 생성)
├── package.json
└── README.md
```

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블 (13개)

1. **users**: 회원 정보 + 프로필 (인구통계/직업)
2. **email_verification_tokens**: 이메일 인증 토큰
3. **password_reset_tokens**: 비밀번호 재설정 토큰
4. **product_categories**: 카테고리 계층 구조
5. **category_keywords**: 카테고리별 키워드 라이브러리
6. **products**: 상품 (공동구매 + 검증 상품)
7. **product_categories_map**: 상품-카테고리 매핑
8. **favorites**: 즐겨찾기
9. **keyword_alerts**: 키워드 알림 설정
10. **keyword_alert_logs**: 알림 발송 로그
11. **user_actions**: 회원 액션 로그
12. **user_category_weights**: 추천 시스템용 가중치

Prisma Studio로 데이터베이스를 시각적으로 확인:

```bash
npm run prisma:studio
```

---

## 🔐 관리자 계정 관리

### 새 관리자 계정 생성

```bash
npm run create-admin
```

### 기존 사용자를 관리자로 승격

1. 동일한 이메일로 `npm run create-admin` 실행
2. 업데이트 확인 메시지에서 `y` 입력

### 수동으로 관리자 권한 부여

```sql
-- MySQL로 직접 접속
mysql -h websitecheck-db.cnqkao6y0x4y.ap-northeast-2.rds.amazonaws.com -u admin -p

USE marketplace_deals;

-- 사용자를 관리자로 변경
UPDATE users
SET is_admin = 1, email_verified = 1
WHERE email = 'admin@example.com';
```

---

## 📖 API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 상품 (Products)

- `GET /api/products` - 상품 목록
  - 쿼리 파라미터:
    - `isGroupBuy=true`: 공동구매 상품만
    - `isAdminVerified=true`: 검증 상품만
    - `limit=20`: 조회 개수
- `GET /api/products/[id]` - 상품 상세
- `POST /api/products` - 상품 등록 (회원 전용)
- `POST /api/products/[id]/favorite` - 즐겨찾기 토글

### 사용자 (User)

- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정
- `GET /api/user/favorites` - 즐겨찾기 목록
- `GET /api/user/keyword-alerts` - 키워드 알림 목록
- `POST /api/user/keyword-alerts` - 키워드 알림 추가

**참고**: 위 API 중 일부는 구현 예정입니다. `src/app/api/` 디렉토리에 필요한 엔드포인트를 추가하세요.

---

## 🚀 AWS EC2 배포

### 1. EC2 인스턴스에 Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 프로젝트 클론 및 설정

```bash
git clone <your-repo>
cd websitecheck

# .env 파일 생성 (프로덕션 값으로)
nano .env

# 패키지 설치
npm install
```

### 3. 빌드 및 실행

```bash
# 빌드
npm run build

# PM2로 프로덕션 실행
npm install -g pm2
pm2 start npm --name "marketplace" -- start
pm2 save
pm2 startup
```

### 4. Nginx 리버스 프록시 (선택)

```bash
sudo apt-get install nginx

# Nginx 설정
sudo nano /etc/nginx/sites-available/marketplace
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🧪 개발 유틸리티

### Prisma 명령어

```bash
# Prisma Studio 실행 (DB GUI)
npm run prisma:studio

# 마이그레이션 생성
npx prisma migrate dev --name your_migration_name

# 스키마를 DB에 푸시 (개발용)
npx prisma db push

# Prisma 클라이언트 재생성
npx prisma generate
```

### 데이터베이스 연결 테스트

```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('✅ DB 연결 성공')).catch(e => console.error('❌ DB 연결 실패:', e));"
```

---

## 🔧 트러블슈팅

### 1. Prisma 클라이언트 오류

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 2. RDS 연결 실패

- RDS 보안 그룹에서 3306 포트 허용 확인
- `DATABASE_URL` 형식 확인
- RDS 엔드포인트 및 비밀번호 확인

### 3. 빌드 오류

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

---

## 📝 다음 단계

### 구현 필요 기능

1. **회원가입 API** (`src/app/api/auth/signup/route.ts`)
2. **이메일 인증** (`src/lib/email.ts`)
3. **상품 등록/수정/삭제 API**
4. **즐겨찾기 API**
5. **키워드 알림 시스템**
6. **프로필 팝업 컴포넌트**
7. **상품 카드 컴포넌트**
8. **실시간 배너 (SSE)**

각 기능은 `src/app/api/` 및 `src/components/`에 추가하세요.

---

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

## 👥 작성자

**마켓플레이스 딜 팀**

---

## 🙏 FAQ

### Q: 관리자 계정을 잊어버렸어요

A: `npm run create-admin`을 다시 실행하거나, MySQL에서 직접 업데이트하세요.

### Q: 이메일이 발송되지 않아요

A: Gmail 앱 비밀번호가 올바른지 확인하세요. [설정 가이드](https://support.google.com/accounts/answer/185833)

### Q: 빌드가 너무 오래 걸려요

A: `npm run build` 전에 `.env`에 `NODE_ENV=production`을 설정하세요.

---

**⭐ 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**

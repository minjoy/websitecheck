# 🛍️ 마켓플레이스 딜 사이트

> AI 기반 자동 카테고리 분류 및 키워드 알림 기능을 갖춘 오픈마켓 특가 상품 추천 웹 서비스

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📑 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [빠른 시작](#-빠른-시작)
- [상세 문서](#-상세-문서)
- [배포 가이드](#-배포-가이드)
- [API 문서](#-api-문서)
- [라이선스](#-라이선스)

---

## 🎯 프로젝트 개요

**마켓플레이스 딜 사이트**는 사용자들이 오픈마켓의 특가 상품 정보를 공유하고, 관리자가 검증한 추천 상품을 제공하는 종합 쇼핑 정보 플랫폼입니다.

### 핵심 가치
- **누구나 열람**: 비회원도 모든 상품 정보 확인 가능
- **회원 전용 기능**: 상품 등록, 즐겨찾기, 키워드 알림 설정
- **자동 분류**: AI 기반 상품명 분석을 통한 자동 카테고리 분류
- **실시간 알림**: 관심 키워드 상품 등록 시 이메일 알림
- **개인화**: 인구통계/직업 기반 맞춤 추천 시스템

---

## ✨ 주요 기능

### 1. 회원 관리
- ✅ 이메일 기반 회원가입 + 이메일 인증
- ✅ JWT 기반 인증 (HttpOnly 쿠키)
- ✅ 비밀번호 찾기/재설정
- ✅ 로그인 후 프로필 팝업 (인구통계/직업 정보 수집)

### 2. 상품 시스템
- ✅ **공동구매 상품**: 사용자가 직접 등록
- ✅ **검증 상품**: 관리자가 큐레이션한 추천 상품
- ✅ 자동 카테고리 분류 (키워드 기반 머신러닝)
- ✅ 즐겨찾기 (하트 버튼)
- ✅ 조회수/클릭수 추적

### 3. 키워드 알림
- ✅ 사용자별 키워드 등록
- ✅ 새 상품 등록 시 키워드 매칭
- ✅ 이메일 알림 자동 발송

### 4. 실시간 배너
- ✅ SSE(Server-Sent Events) 기반
- ✅ 실시간 사용자 액션 로그 (회원가입, 상품 등록, 즐겨찾기)
- ✅ 오늘의 통계 (이용자 수, 클릭 수)

### 5. 추천 시스템 (기본 구조)
- ✅ 사용자 프로필 기반 카테고리 가중치
- ✅ 상품-카테고리 벡터 연산
- ✅ 개인화된 상품 정렬

---

## 🛠 기술 스택

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Node.js | 20+ | 런타임 |
| TypeScript | 5.3 | 타입 안정성 |
| Express | 4.18 | 웹 프레임워크 |
| Prisma | 5.7 | ORM (MySQL) |
| JWT | 9.0 | 인증 |
| bcrypt | 5.1 | 비밀번호 해싱 |
| nodemailer | 6.9 | 이메일 발송 |

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 14 | React 프레임워크 (App Router) |
| React | 18 | UI 라이브러리 |
| TypeScript | 5.3 | 타입 안정성 |
| TailwindCSS | 3.3 | 스타일링 |
| React Query | 5.14 | 서버 상태 관리 |
| Zustand | 4.4 | 클라이언트 상태 관리 |

### 인프라
| 기술 | 용도 |
|------|------|
| AWS EC2 | 백엔드 서버 호스팅 |
| AWS RDS (MySQL 8.0) | 데이터베이스 |
| PM2 | 프로세스 관리 |
| Nginx | 리버스 프록시, SSL |
| Redis | 캐싱 (선택) |

---

## 📂 프로젝트 구조

```
websitecheck/
├── ARCHITECTURE.md          # 아키텍처 설계 문서
├── SETUP_GUIDE.md          # 순차적 세팅 가이드 ⭐
├── README.md               # 이 파일
│
├── database/
│   └── schema.sql          # MySQL DDL (13개 테이블)
│
├── backend/                # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma   # Prisma 스키마
│   ├── src/
│   │   ├── config/         # DB, JWT 설정
│   │   ├── middlewares/    # 인증, 에러 핸들러
│   │   ├── routes/         # API 라우터
│   │   ├── controllers/    # 요청 처리
│   │   ├── services/       # 비즈니스 로직
│   │   ├── utils/          # 유틸리티
│   │   ├── app.ts          # Express 앱
│   │   └── server.ts       # 서버 시작
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── ecosystem.config.js # PM2 설정
│
└── frontend/               # Next.js 14
    ├── src/
    │   ├── app/            # App Router (페이지)
    │   ├── components/     # 재사용 컴포넌트
    │   └── lib/            # API 클라이언트
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 빠른 시작

### 사전 준비
- Node.js 20+
- MySQL 8.0 (또는 AWS RDS)
- npm 또는 yarn

### 1. 리포지토리 클론

```bash
git clone <repository-url>
cd websitecheck
```

### 2. 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 스키마 생성
source database/schema.sql;
```

### 3. 백엔드 설정

```bash
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 DATABASE_URL, JWT_SECRET 등 수정

# Prisma 클라이언트 생성
npm run prisma:generate

# 개발 서버 실행
npm run dev
```

백엔드 서버가 `http://localhost:3001`에서 실행됩니다.

### 4. 프론트엔드 설정

```bash
cd ../frontend

# 패키지 설치
npm install

# 환경 변수 설정
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# 개발 서버 실행
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

---

## 📚 상세 문서

### 필독 문서 (순서대로)
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)**: 전체 아키텍처, 기술 스택 선택 이유
2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**: ⭐ **순차적 세팅 가이드** (처음부터 끝까지)
3. **[database/schema.sql](./database/schema.sql)**: 전체 DB 스키마 (13개 테이블)

### 핵심 기능 구현 위치

#### 인증 시스템
- `backend/src/services/auth.service.ts`: 회원가입, 로그인, 이메일 인증
- `backend/src/utils/jwt.ts`: JWT 토큰 생성/검증
- `backend/src/middlewares/auth.ts`: 인증 미들웨어

#### 자동 카테고리 분류
- `backend/src/services/categorization.service.ts`:
  - `tokenizeTitle()`: 상품명 토큰화
  - `computeCategoryScores()`: 카테고리 점수 계산
  - `applyAutoCategoriesOnProductCreate()`: 자동 분류 적용

#### 이메일 발송
- `backend/src/services/email.service.ts`:
  - `sendVerificationEmail()`: 이메일 인증
  - `sendPasswordResetEmail()`: 비밀번호 재설정
  - `sendKeywordAlertEmail()`: 키워드 알림

#### 프론트엔드 컴포넌트
- `frontend/src/app/page.tsx`: 메인 페이지
- `frontend/src/components/ProductCard.tsx`: 상품 카드 (하트 버튼)
- `frontend/src/components/RealtimeBanner.tsx`: 실시간 배너 (SSE)

---

## 🌐 배포 가이드

### AWS EC2 + RDS 배포

자세한 내용은 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** 참조

#### 요약
1. **RDS 인스턴스 생성** (MySQL 8.0)
2. **EC2 인스턴스 설정** (Ubuntu 20.04)
3. **Node.js 20+ 설치**
4. **프로젝트 클론 및 빌드**
   ```bash
   npm run build  # 백엔드
   ```
5. **PM2로 실행**
   ```bash
   pm2 start ecosystem.config.js
   ```
6. **Nginx 리버스 프록시 설정**
7. **SSL 인증서 설치** (Let's Encrypt)

### 환경 변수 (프로덕션)

```env
NODE_ENV=production
DATABASE_URL="mysql://admin:password@your-rds-endpoint:3306/marketplace_deals"
JWT_SECRET="강력한_랜덤_문자열"
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=앱_비밀번호
```

---

## 📖 API 문서

### 인증 (Auth)
- `POST /api/auth/signup` - 회원가입
- `GET /api/auth/verify-email?token=xxx` - 이메일 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 사용자 (User)
- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정
- `POST /api/user/profile-popup/decision` - 프로필 팝업 결정
- `GET /api/user/favorites` - 즐겨찾기 목록
- `GET /api/user/keyword-alerts` - 키워드 알림 목록
- `POST /api/user/keyword-alerts` - 키워드 알림 추가

### 상품 (Product)
- `GET /api/products` - 상품 목록
- `GET /api/products/:id` - 상품 상세
- `POST /api/products` - 상품 등록 (회원 전용)
- `PUT /api/products/:id` - 상품 수정
- `DELETE /api/products/:id` - 상품 삭제
- `POST /api/products/:id/favorite` - 즐겨찾기 토글

### 실시간 (SSE)
- `GET /api/sse/live-banner` - 실시간 배너 (Server-Sent Events)

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
11. **user_actions**: 회원 액션 로그 (실시간 배너용)
12. **user_category_weights**: 추천 시스템용 가중치

전체 DDL은 [database/schema.sql](./database/schema.sql) 참조

---

## 🧪 테스트

```bash
cd backend
npm test
```

---

## 🤝 기여 가이드

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License - 자유롭게 사용 가능

---

## 👥 작성자

**마켓플레이스 딜 팀**

- 문의: support@example.com

---

## 🙏 감사의 말

이 프로젝트는 AWS, Prisma, Next.js 커뮤니티의 지원을 받아 개발되었습니다.

---

**⭐ 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**

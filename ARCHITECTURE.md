# 🏗️ 마켓플레이스 딜 사이트 아키텍처 설계서

## 📌 기술 스택 선택 및 이유

### 백엔드
- **Node.js 20+ + TypeScript**: 타입 안정성, 생산성, 풍부한 에코시스템
- **Express 4.x**: 검증된 웹 프레임워크, 미들웨어 생태계
- **Prisma ORM**:
  - ✅ 선택 이유: TypeORM 대비 우수한 타입 추론, 마이그레이션 관리, 개발자 경험
  - 자동 타입 생성, SQL 쿼리 최적화, Prisma Studio GUI
- **JWT 인증**:
  - ✅ 선택 이유: Stateless, 수평 확장 용이, 모바일 앱 대응 가능
  - HttpOnly 쿠키에 저장하여 XSS 방지
- **이메일**:
  - 개발: nodemailer + Gmail SMTP
  - 프로덕션: AWS SES (확장성, 신뢰도)
  - EmailService 인터페이스로 추상화

### 프론트엔드
- **Next.js 14 (App Router)**:
  - SSR/CSR 하이브리드: SEO 최적화 + 동적 UX
  - 메인 페이지: SSR (검색엔진 노출)
  - 마이페이지: CSR (개인화 콘텐츠)
  - API Routes: BFF(Backend For Frontend) 패턴
- **TailwindCSS**: 빠른 UI 개발, 일관된 디자인 시스템
- **React Query**: 서버 상태 관리, 캐싱, 낙관적 업데이트
- **Zustand**: 클라이언트 상태 관리 (가벼움)

### 인프라
- **AWS EC2**: 백엔드 서버 (Linux, PM2)
- **AWS RDS MySQL 8.0**: 메인 DB
- **Redis** (선택): 세션 캐시, 실시간 배너 집계 캐시
- **Nginx**: 리버스 프록시, SSL 터미네이션

### 실시간 통신
- **Server-Sent Events (SSE)**:
  - ✅ 선택 이유: 단방향 통신(서버→클라이언트)에 최적화
  - WebSocket 대비 간단한 구현, 자동 재연결
  - HTTP/2 지원, 프록시 친화적

---

## 📂 프로젝트 구조

```
marketplace-deals/
├── backend/                # Node.js 백엔드
│   ├── prisma/
│   │   ├── schema.prisma   # Prisma 스키마
│   │   ├── migrations/     # DB 마이그레이션
│   │   └── seed.ts         # 초기 데이터
│   ├── src/
│   │   ├── app.ts          # Express 앱 초기화
│   │   ├── server.ts       # HTTP 서버 시작
│   │   ├── config/         # 환경 설정
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   └── email.ts
│   │   ├── middlewares/    # 미들웨어
│   │   │   ├── auth.ts     # JWT 인증
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/         # 라우터
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   └── sse.routes.ts
│   │   ├── controllers/    # 컨트롤러 (요청/응답 처리)
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── product.controller.ts
│   │   ├── services/       # 비즈니스 로직
│   │   │   ├── auth.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── categorization.service.ts
│   │   │   └── notification.service.ts
│   │   ├── repositories/   # 데이터 접근 계층
│   │   │   ├── user.repository.ts
│   │   │   ├── product.repository.ts
│   │   │   └── base.repository.ts
│   │   ├── models/         # TypeScript 타입/인터페이스
│   │   │   └── types.ts
│   │   ├── utils/          # 유틸리티
│   │   │   ├── bcrypt.ts
│   │   │   ├── jwt.ts
│   │   │   └── masking.ts
│   │   └── workers/        # 백그라운드 작업
│   │       └── emailQueue.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx    # 메인 페이지
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── products/
│   │   │   │   └── [id]/   # 상품 상세
│   │   │   └── mypage/
│   │   ├── components/     # 재사용 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── RealtimeBanner.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProfilePopup.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/          # 커스텀 훅
│   │   │   ├── useAuth.ts
│   │   │   └── useSSE.ts
│   │   ├── lib/            # API 클라이언트, 유틸
│   │   │   ├── api.ts
│   │   │   └── axios.ts
│   │   ├── store/          # 상태 관리
│   │   │   └── authStore.ts
│   │   └── types/          # TypeScript 타입
│   │       └── index.ts
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                   # 문서
    ├── SETUP.md            # 순차적 세팅 가이드
    └── API.md              # API 명세서
```

---

## 🗄️ 데이터베이스 설계 개요

### 주요 테이블 (13개)
1. **users**: 회원 정보 + 프로필 (인구통계/직업)
2. **email_verification_tokens**: 이메일 인증 토큰
3. **password_reset_tokens**: 비밀번호 재설정 토큰
4. **product_categories**: 카테고리 계층 구조
5. **category_keywords**: 카테고리별 키워드 라이브러리
6. **products**: 상품 (공동구매 + 검증 상품)
7. **product_categories_map**: 상품-카테고리 매핑 (자동 분류 결과)
8. **favorites**: 즐겨찾기
9. **keyword_alerts**: 키워드 알림 설정
10. **keyword_alert_logs**: 알림 발송 로그
11. **user_actions**: 회원 액션 로그 (실시간 배너용)
12. **user_category_weights**: 추천 시스템용 가중치 (선택)
13. **sessions**: Redis 또는 DB 세션 (선택)

---

## 🔑 핵심 기능 플로우

### 1. 회원가입 → 이메일 인증
```
POST /api/auth/signup
  ↓ bcrypt 해싱
  ↓ users 테이블에 email_verified=false로 저장
  ↓ email_verification_tokens 생성 (UUID, 24시간 만료)
  ↓ EmailService.sendVerificationEmail()
  ↓ 사용자 메일함에 "회원가입 인증 링크" 도착

GET /api/auth/verify-email?token=xxx
  ↓ 토큰 검증 (만료 체크)
  ↓ email_verified = true 업데이트
  ↓ 토큰 삭제
  ↓ 리다이렉트 → /login?verified=true
```

### 2. 로그인 → 프로필 팝업
```
POST /api/auth/login
  ↓ 이메일/비밀번호 검증
  ↓ email_verified 체크
  ↓ JWT 생성 (payload: userId, email, isAdmin)
  ↓ HttpOnly 쿠키에 저장
  ↓ last_login_at 업데이트
  ↓ 응답: { user, shouldShowProfilePopup: boolean }

프론트엔드:
  if (shouldShowProfilePopup) {
    <ProfilePopup onSubmit={...} onLater={...} onNeverShow={...} />
  }
```

### 3. 상품 등록 → 자동 카테고리 분류 → 키워드 알림
```
POST /api/products
  ↓ 인증 확인
  ↓ products 테이블에 저장
  ↓ categorizationService.autoClassify(productId, title)
      ↓ tokenizeTitle("에어프라이어 공동구매")
      ↓ computeCategoryScores() // SMALL_APPLIANCE: 2.0
      ↓ selectTopCategories(top 3)
      ↓ product_categories_map 저장
  ↓ notificationService.checkKeywordAlerts(product)
      ↓ SELECT * FROM keyword_alerts WHERE is_active=1
      ↓ title LIKE '%keyword%' 매칭
      ↓ emailQueue.add({ userId, productId, keyword })
  ↓ user_actions 로그 (PRODUCT_CREATED)
  ↓ SSE 브로드캐스트 (실시간 배너 업데이트)
```

### 4. 즐겨찾기 토글
```
POST /api/products/:id/favorite
  ↓ favorites 테이블 조회 (user_id, product_id)
  ↓ 존재하면 DELETE, 없으면 INSERT
  ↓ products.favorite_count 업데이트
  ↓ user_actions 로그 (FAVORITED/UNFAVORITED)
  ↓ 응답: { isFavorite: boolean, favoriteCount: number }

프론트엔드:
  ↓ 낙관적 업데이트 (React Query)
  ↓ 토스트 메시지 표시 (우측 상단)
```

### 5. 실시간 배너 (SSE)
```
클라이언트:
  const eventSource = new EventSource('/api/sse/live-banner')
  eventSource.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data)
    if (type === 'ACTION_LOG') {
      appendToScrollingBanner(data) // "김*수 님이 [상품명]을 즐겨찾기 했어요"
    }
    if (type === 'STATS') {
      updateStats(data) // 오늘 이용자 수, 클릭 수
    }
  }

서버:
  /api/sse/live-banner
    ↓ res.setHeader('Content-Type', 'text/event-stream')
    ↓ 주기적으로 (10초마다):
        ↓ 최근 user_actions 조회 (1분 이내)
        ↓ 오늘 통계 조회 (캐시 사용)
        ↓ res.write(`data: ${JSON.stringify(payload)}\n\n`)
```

---

## 🔐 보안 설계

1. **비밀번호**: bcrypt (saltRounds=10)
2. **JWT**:
   - Access Token: 15분 만료
   - Refresh Token: 7일 만료 (선택 구현)
   - HttpOnly 쿠키 저장 (XSS 방지)
3. **CORS**: 프론트엔드 도메인만 허용
4. **Rate Limiting**: express-rate-limit (로그인 5회/분)
5. **SQL Injection**: Prisma ORM이 자동 방어
6. **XSS**: React가 자동 이스케이프, DOMPurify 추가 사용
7. **CSRF**: SameSite 쿠키 + CSRF 토큰 (선택)

---

## 📊 성능 최적화 전략

1. **DB 인덱스**:
   - users(email), products(status, created_at)
   - favorites(user_id, product_id), user_actions(created_at)
2. **캐싱**:
   - Redis: 실시간 통계 (오늘 이용자 수, 클릭 수) - TTL 1분
   - React Query: 프론트 API 응답 캐싱
3. **페이지네이션**: 상품 리스트 20개씩
4. **이미지 최적화**: Next.js Image 컴포넌트, WebP 포맷
5. **CDN**: 정적 파일 (CloudFront)

---

## 🚀 배포 전략

### PM2 프로세스 관리
```json
{
  "apps": [{
    "name": "marketplace-api",
    "script": "dist/server.js",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

### Nginx 리버스 프록시
```nginx
server {
  listen 80;
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location /api/sse {
    proxy_pass http://localhost:3001;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_cache off;
  }
}
```

---

## 📈 확장성 고려사항

1. **수평 확장**: Stateless 아키텍처 (JWT), 로드 밸런서
2. **DB 샤딩**: user_id 기반 샤딩 (미래)
3. **읽기 복제본**: RDS Read Replica (조회 부하 분산)
4. **큐 시스템**: Bull Queue + Redis (이메일 발송)
5. **마이크로서비스 전환**: 추천 시스템, 이메일 서비스 분리 (미래)

---

**작성일**: 2025-12-06
**버전**: 1.0.0

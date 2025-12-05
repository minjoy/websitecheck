# API 구현 완료 가이드

## 📁 생성된 파일 목록

### 핵심 라이브러리
- `lib/db.ts` - MySQL 데이터베이스 연결 pool
- `lib/authUtils.ts` - JWT 인증 유틸리티 (토큰 생성/검증, 비밀번호 해싱)
- `lib/middleware/auth.ts` - 인증 미들웨어 (requireAuth, requireAdmin)

### Validators (Zod)
- `lib/validators/auth.ts` - 인증 관련 스키마 (signup, login, updateProfile)
- `lib/validators/product.ts` - 상품 관련 스키마 (create, update, query)

### API Routes

#### 인증 (Authentication)
- `app/api/auth/signup/route.ts` - POST: 회원가입
- `app/api/auth/login/route.ts` - POST: 로그인
- `app/api/auth/logout/route.ts` - POST: 로그아웃
- `app/api/auth/me/route.ts` - GET: 사용자 정보 조회, DELETE: 회원 탈퇴

#### 상품 (Products)
- `app/api/products/route.ts` - GET: 목록 조회, POST: 상품 등록
- `app/api/products/[id]/route.ts` - GET: 상세 조회, PUT: 수정, DELETE: 삭제

#### 리뷰 요약 (Reviews)
- `app/api/reviews/[productId]/route.ts` - GET: 리뷰 요약 조회

#### 즐겨찾기 (Favorites)
- `app/api/favorites/route.ts` - GET: 목록 조회, POST: 추가
- `app/api/favorites/[productId]/route.ts` - DELETE: 제거

#### 키워드 알림 (Keywords)
- `app/api/keywords/route.ts` - GET: 목록 조회, POST: 추가
- `app/api/keywords/[keyword]/route.ts` - DELETE: 삭제

#### 관리자 (Admin)
- `app/api/admin/blacklist/route.ts` - GET: 블랙리스트 조회, POST: 추가, DELETE: 해제

### 환경 설정
- `.env.example` - 환경 변수 예시 파일

---

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# Database (개발 환경에서는 로컬 MySQL 사용)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marketplace_deals

# JWT (보안을 위해 강력한 키 사용)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. 데이터베이스 설정

#### 로컬 MySQL 설치 및 실행

**Mac (Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
- MySQL Installer 다운로드: https://dev.mysql.com/downloads/installer/

#### 데이터베이스 및 테이블 생성

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE marketplace_deals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marketplace_deals;

# 테이블 생성 (dbsetting.txt 참조)
# 또는 아래 명령어로 SQL 파일 실행
# source /path/to/schema.sql
```

상세한 테이블 스키마는 `dbsetting.txt` 파일을 참조하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

---

## 🧪 API 테스트

### Postman/Thunder Client 사용

#### 1. 회원가입
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "테스트 사용자"
}
```

#### 2. 로그인
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "테스트 사용자",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

#### 3. 현재 사용자 정보 조회
```http
GET http://localhost:3000/api/auth/me
```

**중요:** 로그인 후 쿠키가 자동으로 설정되므로 별도의 Authorization 헤더가 필요하지 않습니다.

#### 4. 상품 등록
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "title": "삼성 갤럭시 버즈3 프로",
  "originalPrice": 100000,
  "salePrice": 60000,
  "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
  "marketplace": "coupang",
  "productUrl": "https://www.coupang.com/...",
  "dealDate": "2025-01-01",
  "dealEndDate": "2025-01-07",
  "category": "전자기기",
  "partnersText": "파트너스 활동으로 인해 일정액의 수수료를 제공받을 수 있습니다",
  "rating": 4.8,
  "reviewCount": 1234
}
```

#### 5. 상품 목록 조회 (필터링)
```http
GET http://localhost:3000/api/products?page=1&limit=20&type=deal&isVerified=true&sortBy=discount_rate&order=desc
```

---

## 📖 프론트엔드 연동 (향후 작업)

현재 프론트엔드는 LocalStorage를 사용합니다. API로 마이그레이션하려면:

### 1. API 클라이언트 생성

`lib/apiClient.ts` 파일 생성 (api.txt 참조)

### 2. 서비스 레이어 생성

- `lib/services/authService.ts`
- `lib/services/productService.ts`
- `lib/services/favoriteService.ts`
- `lib/services/keywordService.ts`

### 3. 기존 코드 마이그레이션

```typescript
// Before (LocalStorage)
import { authService } from '@/lib/auth';
const user = authService.getCurrentUser();

// After (API)
import { authService } from '@/lib/services/authService';
const user = await authService.getCurrentUser();
```

---

## 🔒 보안 고려사항

### 현재 구현
- ✅ JWT 토큰 기반 인증
- ✅ HTTP-only 쿠키 사용 (XSS 방지)
- ✅ 비밀번호 bcrypt 해싱
- ✅ SQL Injection 방지 (parameterized queries)
- ✅ Zod를 통한 입력값 검증

### 프로덕션 배포 전 추가 필요
- [ ] Rate Limiting (DDoS 방지)
- [ ] CORS 설정
- [ ] HTTPS 강제
- [ ] JWT_SECRET 강력한 키로 변경
- [ ] 환경 변수 보안 관리 (AWS Secrets Manager 등)
- [ ] 에러 로깅 (Sentry 등)

---

## 🐛 트러블슈팅

### 데이터베이스 연결 실패
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**해결:**
1. MySQL 서비스가 실행 중인지 확인
2. `.env.local`의 DB 설정 확인
3. MySQL 사용자 권한 확인

### JWT 토큰 검증 실패
```
Error: jwt malformed
```

**해결:**
1. `.env.local`의 JWT_SECRET이 설정되어 있는지 확인
2. 로그인 후 쿠키가 제대로 설정되는지 확인 (브라우저 개발자 도구 > Application > Cookies)

### Zod 유효성 검증 실패
```
ZodError: [...]
```

**해결:**
1. API 요청 본문이 스키마와 일치하는지 확인
2. 필수 필드가 모두 포함되어 있는지 확인
3. 데이터 타입이 올바른지 확인 (문자열, 숫자 등)

---

## 📚 참고 자료

- **데이터베이스 세팅:** `dbsetting.txt`
- **API 상세 스펙:** `api.txt`
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Zod Documentation: https://zod.dev/
- MySQL2: https://github.com/sidorares/node-mysql2

---

## ✅ 다음 단계

1. **테스트**: Postman/Thunder Client로 모든 API 엔드포인트 테스트
2. **데이터베이스**: AWS RDS MySQL 인스턴스 생성 (프로덕션용)
3. **프론트엔드 마이그레이션**: LocalStorage → API 전환
4. **배포**: Vercel 또는 AWS에 배포

---

**작성일:** 2025-01-01
**버전:** 1.0.0
**작성자:** Claude Code

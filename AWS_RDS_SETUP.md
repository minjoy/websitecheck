# AWS RDS MySQL 연결 가이드

## 🎯 목차
1. [AWS RDS 인스턴스 생성](#1-aws-rds-인스턴스-생성)
2. [보안 그룹 설정](#2-보안-그룹-설정)
3. [데이터베이스 및 테이블 생성](#3-데이터베이스-및-테이블-생성)
4. [애플리케이션 연결](#4-애플리케이션-연결)
5. [연결 테스트](#5-연결-테스트)
6. [문제 해결](#6-문제-해결)

---

## 1. AWS RDS 인스턴스 생성

### Step 1: AWS Console 로그인
1. https://console.aws.amazon.com/ 접속
2. 상단 검색창에서 "RDS" 검색
3. RDS 대시보드로 이동

### Step 2: 데이터베이스 생성
1. **"데이터베이스 생성"** 버튼 클릭

2. **데이터베이스 생성 방식:**
   - 선택: **표준 생성**

3. **엔진 옵션:**
   - 엔진 유형: **MySQL**
   - 버전: **MySQL 8.0.x** (최신 안정 버전)

4. **템플릿:**
   - 개발/테스트: **개발/테스트** (권장)
   - 또는 프리 티어: **프리 티어** (무료 체험 가능)

5. **설정:**
   ```
   DB 인스턴스 식별자: marketplace-deals-db
   마스터 사용자 이름: admin
   마스터 암호: [강력한 비밀번호 입력]
   암호 확인: [동일한 비밀번호 재입력]
   ```

   ⚠️ **중요:** 마스터 암호를 안전한 곳에 저장하세요!

6. **DB 인스턴스 클래스:**
   - 인스턴스 구성: **버스터블 클래스**
   - 크기:
     - 프리 티어: `db.t3.micro` (무료)
     - 개발/테스트: `db.t3.micro` 또는 `db.t3.small`
     - 프로덕션: `db.t3.medium` 이상

7. **스토리지:**
   ```
   스토리지 유형: 범용 SSD (gp3)
   할당된 스토리지: 20 GB
   스토리지 자동 조정: 활성화
   최대 스토리지 임계값: 100 GB
   ```

8. **연결:**
   - 컴퓨팅 리소스: **EC2 컴퓨팅 리소스에 연결 안 함**
   - 네트워크 유형: **IPv4**
   - VPC: **기본 VPC**
   - 퍼블릭 액세스: **예** (개발 환경에서 필요)
     - ⚠️ 프로덕션에서는 "아니오" 권장, VPN/Bastion 사용
   - VPC 보안 그룹: **새로 생성**
   - 보안 그룹 이름: `marketplace-deals-sg`

9. **데이터베이스 인증:**
   - 암호 인증 선택

10. **추가 구성:**
    ```
    초기 데이터베이스 이름: marketplace_deals
    DB 파라미터 그룹: default.mysql8.0
    옵션 그룹: default:mysql-8-0

    백업:
    - 자동 백업 활성화: 체크
    - 백업 보존 기간: 7일
    - 백업 시간대: 선호 시간 설정 (예: 03:00-04:00)

    암호화:
    - 암호화 활성화: 체크

    로그 내보내기:
    - Error log: 체크
    - Slow query log: 체크

    유지 관리:
    - 자동 마이너 버전 업그레이드: 체크
    ```

11. **월별 추정 비용 확인** (하단에 표시됨)
    - 프리 티어: $0/월 (12개월)
    - db.t3.micro: 약 $15-20/월

12. **"데이터베이스 생성"** 클릭

### Step 3: 생성 대기
- 생성 완료까지 **5-10분** 소요
- 상태가 "사용 가능"이 될 때까지 대기

---

## 2. 보안 그룹 설정

### Step 1: 엔드포인트 확인
1. RDS 대시보드에서 생성한 DB 클릭
2. **"연결 & 보안"** 탭에서 엔드포인트 복사
   ```
   예시: marketplace-deals-db.xxxxxxxxx.ap-northeast-2.rds.amazonaws.com
   ```

### Step 2: 보안 그룹 수정
1. **"연결 & 보안"** 탭에서 **VPC 보안 그룹** 클릭
2. 생성된 보안 그룹 선택
3. 하단 **"인바운드 규칙"** 탭 선택
4. **"인바운드 규칙 편집"** 클릭
5. **"규칙 추가"** 클릭:
   ```
   유형: MySQL/Aurora
   프로토콜: TCP
   포트 범위: 3306
   소스: 내 IP (자동 감지) 또는 사용자 지정
   설명: Allow MySQL from my IP
   ```

6. **개발 환경에서 여러 위치에서 접속하는 경우:**
   - 소스: `0.0.0.0/0` (모든 IP 허용)
   - ⚠️ **보안 위험**: 프로덕션에서는 절대 사용하지 마세요!

7. **프로덕션 환경 권장 설정:**
   - EC2 인스턴스의 보안 그룹 ID 지정
   - 또는 회사/집 고정 IP 대역만 허용

8. **"규칙 저장"** 클릭

---

## 3. 데이터베이스 및 테이블 생성

### Step 1: RDS 접속

**방법 1: 로컬 MySQL 클라이언트 사용**

```bash
# MySQL 클라이언트 설치 (Mac)
brew install mysql-client

# RDS 접속
mysql -h marketplace-deals-db.xxxxxxxxx.ap-northeast-2.rds.amazonaws.com \
      -P 3306 \
      -u admin \
      -p

# 암호 입력 프롬프트에서 마스터 암호 입력
```

**방법 2: MySQL Workbench 사용**
1. MySQL Workbench 다운로드: https://dev.mysql.com/downloads/workbench/
2. 새 연결 생성:
   ```
   Connection Name: AWS RDS - Marketplace Deals
   Hostname: [RDS 엔드포인트]
   Port: 3306
   Username: admin
   Password: [저장] → [마스터 암호 입력]
   ```
3. Test Connection → OK → 연결

### Step 2: 데이터베이스 확인

```sql
-- 데이터베이스 확인 (생성 시 지정한 이름)
SHOW DATABASES;

-- marketplace_deals 사용
USE marketplace_deals;
```

### Step 3: 테이블 생성

`dbsetting.txt` 파일의 SQL 스크립트 실행:

```sql
-- Users 테이블
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products 테이블
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  original_price DECIMAL(12, 2) NOT NULL,
  sale_price DECIMAL(12, 2) NOT NULL,
  discount_rate TINYINT UNSIGNED NOT NULL,
  image_url TEXT,
  marketplace ENUM('coupang', 'naver', 'gmarket', '11st', 'instagram', 'blog', 'cafe', 'other') NOT NULL,
  product_url TEXT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT UNSIGNED DEFAULT 0,
  deal_date DATE NOT NULL,
  deal_end_date DATE NOT NULL,
  category VARCHAR(100),
  tags JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  author_id VARCHAR(36) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  type ENUM('deal', 'group-buy') NOT NULL,
  partners_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author (author_id),
  INDEX idx_type (type),
  INDEX idx_marketplace (marketplace),
  INDEX idx_deal_date (deal_date),
  INDEX idx_discount (discount_rate),
  INDEX idx_verified (is_verified),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Review Summaries 테이블
CREATE TABLE review_summaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(36) UNIQUE NOT NULL,
  overall_sentiment ENUM('positive', 'neutral', 'negative') NOT NULL,
  pros JSON,
  cons JSON,
  key_points JSON,
  ai_insight TEXT,
  total_reviews INT UNSIGNED DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_sentiment (overall_sentiment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorites 테이블
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keyword Alerts 테이블
CREATE TABLE keyword_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_keyword_alert (user_id, keyword),
  INDEX idx_user (user_id),
  INDEX idx_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blacklist 테이블
CREATE TABLE blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 확인
SHOW TABLES;

-- 테이블 구조 확인
DESCRIBE users;
DESCRIBE products;
```

### Step 4: 관리자 계정 생성 (선택사항)

```sql
-- bcrypt로 해싱된 비밀번호 필요
-- 예시: 'admin123' → bcrypt 해시

INSERT INTO users (id, email, name, role, password, created_at)
VALUES (
  UUID(),
  'admin@example.com',
  'Admin',
  'admin',
  '$2a$10$YourBcryptHashedPasswordHere',  -- bcrypt로 해싱 필요
  NOW()
);
```

**비밀번호 해싱 방법:**

```javascript
// Node.js에서 bcrypt 해시 생성
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
```

---

## 4. 애플리케이션 연결

### Step 1: 환경 변수 업데이트

`.env.local` 파일 수정:

```env
# AWS RDS MySQL Configuration
DB_HOST=marketplace-deals-db.xxxxxxxxx.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_master_password
DB_NAME=marketplace_deals

# Database Pool Configuration
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0

# SSL Configuration (프로덕션 권장)
DB_SSL=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**프로덕션 배포 시 (Vercel):**

Vercel 대시보드 → Settings → Environment Variables:
```
DB_HOST=marketplace-deals-db.xxxxxxxxx.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_master_password
DB_NAME=marketplace_deals
DB_SSL=true
JWT_SECRET=your-production-secret-key
```

### Step 2: SSL 인증서 설정 (선택사항)

AWS RDS는 SSL 연결을 지원합니다. 보안 강화를 위해 권장:

```bash
# AWS RDS SSL 인증서 다운로드
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# 프로젝트 루트에 저장
mv global-bundle.pem ./rds-ca-bundle.pem
```

`lib/db.ts` 수정:

```typescript
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketplace_deals',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  ssl: process.env.DB_SSL === 'true' ? {
    ca: fs.readFileSync(path.join(process.cwd(), 'rds-ca-bundle.pem')),
    rejectUnauthorized: true,
  } : undefined,
});

export default pool;
```

---

## 5. 연결 테스트

### Step 1: 개발 서버 실행

```bash
npm run dev
```

콘솔에서 확인:
```
✓ Database connected successfully
```

### Step 2: API 테스트

**회원가입 테스트:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "테스트 사용자"
  }'
```

**성공 응답:**
```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "테스트 사용자",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### Step 3: 데이터베이스 확인

```sql
-- MySQL에서 확인
USE marketplace_deals;
SELECT * FROM users;
```

---

## 6. 문제 해결

### ❌ "Error: connect ETIMEDOUT"

**원인:** 보안 그룹에서 IP가 허용되지 않음

**해결:**
1. AWS Console → EC2 → 보안 그룹
2. RDS 보안 그룹 선택
3. 인바운드 규칙에서 내 IP 추가
4. 현재 IP 확인: https://whatismyipaddress.com/

### ❌ "Error: Access denied for user"

**원인:** 사용자 이름 또는 비밀번호 오류

**해결:**
1. `.env.local`의 `DB_USER`와 `DB_PASSWORD` 확인
2. RDS 콘솔에서 마스터 사용자 이름 확인
3. 비밀번호 재설정 (RDS → 수정 → 마스터 암호 변경)

### ❌ "Error: Unknown database"

**원인:** 데이터베이스가 생성되지 않음

**해결:**
```sql
-- MySQL 접속 후
CREATE DATABASE marketplace_deals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### ❌ "ER_NOT_SUPPORTED_AUTH_MODE"

**원인:** MySQL 8.0의 새로운 인증 방식

**해결:**
```sql
ALTER USER 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### ❌ "Too many connections"

**원인:** Connection pool 제한 초과

**해결:**
1. `.env.local`에서 `DB_CONNECTION_LIMIT` 증가
2. RDS 파라미터 그룹에서 `max_connections` 증가

---

## 📊 RDS 모니터링

### CloudWatch 메트릭 확인
1. RDS 콘솔 → 데이터베이스 선택
2. **"모니터링"** 탭
3. 주요 메트릭:
   - CPU 사용률
   - 데이터베이스 연결 수
   - 읽기/쓰기 지연 시간
   - 스토리지 공간

### 알람 설정 (권장)
1. CloudWatch → 알람 → 알람 생성
2. 메트릭 선택: CPU 사용률 > 80%
3. 작업: SNS로 이메일 알림

---

## 💰 비용 최적화

### 프리 티어 활용
- db.t3.micro: 월 750시간 무료 (12개월)
- 스토리지: 20GB 무료
- 백업: 자동 백업 20GB 무료

### 비용 절감 팁
1. **개발 환경**: 사용하지 않을 때 RDS 중지
   - RDS 콘솔 → 작업 → 중지
   - 최대 7일간 중지 가능

2. **예약 인스턴스**: 장기 사용 시 최대 69% 할인

3. **스토리지 최적화**: 자동 조정 활성화로 필요한 만큼만 사용

---

## 🔐 보안 체크리스트

- [x] 강력한 마스터 암호 사용
- [x] 보안 그룹에서 필요한 IP만 허용
- [x] 퍼블릭 액세스 최소화 (프로덕션)
- [x] SSL/TLS 연결 사용
- [x] 자동 백업 활성화
- [x] 데이터 암호화 활성화
- [x] CloudWatch 알람 설정
- [x] IAM 데이터베이스 인증 고려 (고급)

---

## ✅ 최종 확인

```bash
# 1. 환경 변수 확인
cat .env.local

# 2. 개발 서버 실행
npm run dev

# 3. API 테스트
curl http://localhost:3000/api/auth/signup -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# 4. 데이터베이스 확인
mysql -h [RDS_ENDPOINT] -u admin -p
```

---

**작성일:** 2025-01-01
**문서 버전:** 1.0.0

더 자세한 내용은 `dbsetting.txt`와 `API_README.md`를 참조하세요!

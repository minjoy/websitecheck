# 🚀 마켓플레이스 딜 사이트 - 순차적 세팅 가이드

이 문서는 AWS EC2 + RDS 환경에서 전체 프로젝트를 **처음부터 구축**하는 단계별 가이드입니다.

---

## 📋 사전 준비사항

### 1. AWS 리소스
- [ ] AWS EC2 인스턴스 (Ubuntu 20.04 LTS 권장)
- [ ] AWS RDS MySQL 8.0 인스턴스
- [ ] EC2 보안 그룹: 포트 22(SSH), 80(HTTP), 443(HTTPS), 3001(API) 허용
- [ ] RDS 보안 그룹: EC2에서 3306 포트 접근 허용

### 2. 로컬 개발 환경
- [ ] Node.js 20+ 설치
- [ ] npm 또는 yarn 설치
- [ ] MySQL 클라이언트 (선택)
- [ ] Git

---

## 🔧 STEP 1: AWS RDS 데이터베이스 설정

### 1-1. RDS 인스턴스 생성 (AWS 콘솔)

```bash
# RDS 엔드포인트 확인
# 예: your-db.xxxxx.ap-northeast-2.rds.amazonaws.com
```

### 1-2. 데이터베이스 및 스키마 생성

로컬에서 MySQL 클라이언트로 RDS 접속:

```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p
```

그 후 `database/schema.sql` 파일 실행:

```sql
source /path/to/database/schema.sql;
```

또는:

```bash
mysql -h your-rds-endpoint -u admin -p < database/schema.sql
```

### 1-3. 연결 확인

```sql
USE marketplace_deals;
SHOW TABLES;
-- 13개 테이블이 보여야 함
```

---

## 🔧 STEP 2: 백엔드 프로젝트 초기화

### 2-1. 디렉토리 생성

```bash
cd websitecheck
mkdir -p backend/src/{config,middlewares,routes,controllers,services,repositories,models,utils,workers}
mkdir -p backend/prisma
```

### 2-2. 패키지 설치

```bash
cd backend
npm install
```

### 2-3. 환경 변수 설정

`.env.example`을 `.env`로 복사하고 실제 값으로 수정:

```bash
cp .env.example .env
nano .env  # 또는 vim
```

**중요 환경 변수:**
```env
DATABASE_URL="mysql://admin:your_password@your-rds-endpoint:3306/marketplace_deals"
JWT_SECRET="랜덤한_긴_문자열_생성"  # openssl rand -base64 32
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail 앱 비밀번호
```

### 2-4. Prisma 클라이언트 생성

```bash
npm run prisma:generate
```

---

## 🔧 STEP 3: 백엔드 핵심 코드 작성

이미 생성된 파일들:
- ✅ `src/config/database.ts`
- ✅ `src/utils/bcrypt.ts`
- ✅ `src/utils/jwt.ts`
- ✅ `prisma/schema.prisma`

### 3-1. 추가 유틸리티 작성

**src/utils/masking.ts** (사용자 이름 마스킹)

```typescript
export function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  // "김민수" -> "김*수"
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const maskedLocal = local[0] + '*'.repeat(Math.max(local.length - 2, 0)) + (local.length > 1 ? local[local.length - 1] : '');
  return `${maskedLocal}@${domain}`;
}
```

### 3-2. 이메일 서비스 작성

**src/services/email.service.ts**

```typescript
import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.API_BASE_URL}/api/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `
        <h1>회원가입을 환영합니다!</h1>
        <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요:</p>
        <a href="${verificationUrl}">이메일 인증하기</a>
        <p>이 링크는 24시간 동안 유효합니다.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '비밀번호 재설정',
      html: `
        <h1>비밀번호 재설정</h1>
        <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
        <a href="${resetUrl}">비밀번호 재설정하기</a>
        <p>이 링크는 1시간 동안 유효합니다.</p>
      `,
    });
  }

  async sendKeywordAlertEmail(email: string, keyword: string, productTitle: string, productId: string) {
    const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `키워드 알림: "${keyword}" 상품이 등록되었습니다`,
      html: `
        <h1>키워드 알림</h1>
        <p>설정하신 키워드 <strong>"${keyword}"</strong>가 포함된 상품이 등록되었습니다:</p>
        <h2>${productTitle}</h2>
        <a href="${productUrl}">상품 보러 가기</a>
      `,
    });
  }
}

export default new EmailService();
```

### 3-3. 인증 서비스 작성

**src/services/auth.service.ts**

```typescript
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import emailService from './email.service';

export class AuthService {
  async signup(email: string, password: string) {
    // 기존 사용자 확인
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('이미 사용 중인 이메일입니다');
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: false,
      },
    });

    // 이메일 인증 토큰 생성
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 인증 이메일 발송
    await emailService.sendVerificationEmail(email, token);

    // 회원가입 액션 로그
    await prisma.userAction.create({
      data: {
        userId: user.id,
        actionType: 'SIGNUP',
      },
    });

    return { userId: user.id, email: user.email };
  }

  async verifyEmail(token: string) {
    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error('유효하지 않은 토큰입니다');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('만료된 토큰입니다');
    }

    // 이메일 인증 처리
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });

    // 토큰 삭제
    await prisma.emailVerificationToken.delete({
      where: { id: tokenRecord.id },
    });

    return { success: true };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (!user.emailVerified) {
      throw new Error('이메일 인증이 필요합니다');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    // 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 로그인 액션 로그
    await prisma.userAction.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN',
      },
    });

    // JWT 생성
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // 프로필 팝업 표시 여부
    const shouldShowProfilePopup =
      !user.profileCompletedAt && !user.suppressProfilePopup;

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      shouldShowProfilePopup,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // 보안상 사용자가 없어도 성공 응답
      return { success: true };
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(email, token);

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.used) {
      throw new Error('유효하지 않은 토큰입니다');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('만료된 토큰입니다');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    });

    return { success: true };
  }
}

export default new AuthService();
```

### 3-4. 카테고리 자동 분류 서비스

**src/services/categorization.service.ts**

```typescript
import prisma from '../config/database';

// 카테고리 키워드 맵 (DB에서 로드하거나 하드코딩)
const CATEGORY_KEYWORD_MAP: Record<string, { core: string[]; secondary: string[] }> = {
  SMALL_APPLIANCE: {
    core: ['에어프라이어', '커피머신', '에스프레소', '믹서기'],
    secondary: ['전기포트', '토스터', '드립'],
  },
  BABY_MOM: {
    core: ['기저귀', '유모차', '젖병', '분유'],
    secondary: ['이유식', '아기옷', '카시트'],
  },
  FOOD: {
    core: ['쌀', '과일', '채소', '육류'],
    secondary: ['간식', '음료', '냉동식품'],
  },
  // ... 나머지 카테고리
};

export class CategorizationService {
  /**
   * 상품명을 토큰화
   */
  tokenizeTitle(title: string): string[] {
    return title
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /**
   * 각 카테고리의 스코어 계산
   */
  async computeCategoryScores(tokens: string[]): Promise<Map<string, number>> {
    const scores = new Map<string, number>();

    // DB에서 카테고리와 키워드 로드
    const categories = await prisma.productCategory.findMany({
      include: { categoryKeywords: true },
    });

    for (const category of categories) {
      let score = 0;
      for (const keyword of category.categoryKeywords) {
        for (const token of tokens) {
          if (token.includes(keyword.keyword) || keyword.keyword.includes(token)) {
            score += keyword.weight;
          }
        }
      }
      if (score > 0) {
        scores.set(category.code, score);
      }
    }

    return scores;
  }

  /**
   * 상위 N개 카테고리 선택
   */
  selectTopCategories(scores: Map<string, number>, topN: number = 3): string[] {
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([code]) => code);
  }

  /**
   * 상품 등록 시 자동 카테고리 분류 적용
   */
  async applyAutoCategoriesOnProductCreate(productId: bigint, title: string) {
    const tokens = this.tokenizeTitle(title);
    const scores = await this.computeCategoryScores(tokens);
    const topCodes = this.selectTopCategories(scores, 3);

    if (topCodes.length === 0) return;

    // 카테고리 ID 조회
    const categories = await prisma.productCategory.findMany({
      where: { code: { in: topCodes } },
    });

    // product_categories_map에 저장
    const maxScore = Math.max(...Array.from(scores.values()));
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const score = scores.get(category.code) || 0;
      const normalizedScore = score / maxScore;

      await prisma.productCategoryMap.create({
        data: {
          productId,
          categoryId: category.id,
          score: normalizedScore,
          isPrimary: i === 0, // 첫 번째가 대표 카테고리
          isSuggested: true,
        },
      });
    }
  }
}

export default new CategorizationService();
```

---

## 🔧 STEP 4: 미들웨어 작성

**src/middlewares/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 쿠키에서 토큰 추출
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: '인증이 필요합니다' });
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' });
  }
  next();
}

// 선택적 인증 (비회원도 접근 가능하지만, 토큰 있으면 파싱)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;
    if (token) {
      req.user = verifyToken(token);
    }
  } catch (error) {
    // 토큰이 잘못되어도 무시하고 진행
  }
  next();
}
```

**src/middlewares/errorHandler.ts**

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
```

---

## 🔧 STEP 5: 컨트롤러 및 라우터 작성

**src/controllers/auth.controller.ts**

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import authService from '../services/auth.service';

export class AuthController {
  async signup(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.signup(email, password);
      res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req: AuthRequest, res: Response) {
    try {
      const { token } = req.query;
      await authService.verifyEmail(token as string);
      res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // HttpOnly 쿠키에 JWT 저장
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15분
        sameSite: 'strict',
      });

      res.json({
        success: true,
        user: result.user,
        shouldShowProfilePopup: result.shouldShowProfilePopup
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: AuthRequest, res: Response) {
    res.clearCookie('token');
    res.json({ success: true });
  }

  async me(req: AuthRequest, res: Response) {
    // authenticate 미들웨어 통과 후 호출됨
    res.json({ user: req.user });
  }
}

export default new AuthController();
```

**src/routes/auth.routes.ts**

```typescript
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/signup', authController.signup.bind(authController));
router.get('/verify-email', authController.verifyEmail.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
```

---

## 🔧 STEP 6: Express 앱 및 서버 설정

**src/app.ts**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
// import productRoutes from './routes/product.routes';
// import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// 미들웨어
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(compression());

// 라우터
app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 에러 핸들러 (마지막에 배치)
app.use(errorHandler);

export default app;
```

**src/server.ts**

```typescript
import app from './app';
import { testConnection, disconnectDB } from './config/database';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // DB 연결 테스트
    await testConnection();

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
```

---

## 🔧 STEP 7: 로컬 개발 서버 실행

```bash
cd backend
npm run dev
```

서버가 정상 실행되면:
- `http://localhost:3001/health` 접속하여 확인
- Postman으로 API 테스트

---

## 🔧 STEP 8: 프론트엔드 Next.js 설정 (간략)

```bash
cd ..
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install axios react-query zustand
```

**프론트엔드 주요 파일 구조** (별도 상세 작성 필요):
- `src/app/page.tsx`: 메인 페이지
- `src/components/RealtimeBanner.tsx`: SSE 실시간 배너
- `src/components/ProductCard.tsx`: 상품 카드
- `src/components/ProfilePopup.tsx`: 프로필 팝업
- `src/lib/api.ts`: Axios 인스턴스

---

## 🔧 STEP 9: EC2 배포

### 9-1. EC2에 Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### 9-2. PM2 설치

```bash
sudo npm install -g pm2
```

### 9-3. 프로젝트 업로드

```bash
# 로컬에서
git clone <your-repo>
cd backend
npm install
npm run build

# .env 파일 생성 (프로덕션 값으로)
nano .env
```

### 9-4. PM2로 서버 실행

```bash
pm2 start dist/server.js --name marketplace-api -i 2
pm2 save
pm2 startup  # 부팅 시 자동 시작
```

**ecosystem.config.js** (PM2 설정):

```javascript
module.exports = {
  apps: [{
    name: 'marketplace-api',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
```

실행:
```bash
pm2 start ecosystem.config.js
```

---

## 🔧 STEP 10: Nginx 리버스 프록시 설정

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/marketplace
```

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # SSE를 위한 특별 설정
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

활성화:
```bash
sudo ln -s /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 STEP 11: SSL 인증서 설정 (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## ✅ 최종 체크리스트

- [ ] RDS 데이터베이스 스키마 생성 완료
- [ ] 백엔드 .env 파일 설정 완료
- [ ] Prisma 클라이언트 생성 (`npm run prisma:generate`)
- [ ] 로컬에서 백엔드 서버 정상 실행 확인
- [ ] 회원가입/로그인 API 테스트 완료
- [ ] 이메일 발송 테스트 완료 (Gmail SMTP)
- [ ] EC2에 코드 배포 및 PM2로 실행
- [ ] Nginx 설정 완료
- [ ] SSL 인증서 설치 완료
- [ ] 프론트엔드 빌드 및 배포 (Vercel/S3+CloudFront)

---

## 📚 다음 단계

1. **프론트엔드 구현**: Next.js 앱 완성
2. **상품 CRUD API**: 상품 등록, 수정, 삭제, 조회
3. **즐겨찾기 API**: 하트 기능
4. **키워드 알림**: 백그라운드 워커
5. **실시간 배너**: SSE 구현
6. **관리자 페이지**: 검증 상품 관리
7. **테스트 코드 작성**: Jest로 단위 테스트
8. **성능 최적화**: Redis 캐싱, DB 인덱스 튜닝

---

**작성일**: 2025-12-06

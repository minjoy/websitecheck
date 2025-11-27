# AI 특가 - 오늘의 스마트한 쇼핑

AI가 분석한 신뢰도 높은 특가 상품을 매일 업데이트하는 웹사이트입니다.

## 주요 기능

- 📅 **날짜별 특가 상품 표시**: 매일 업데이트되는 최신 특가 상품
- 🤖 **AI 리뷰 요약**: 수많은 리뷰를 AI가 분석하여 핵심만 정리
- 🎨 **몽환적인 디자인**: 신뢰감 있는 그라데이션과 글래스모피즘 효과
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- ⚡ **빠른 성능**: Next.js 15와 React 19로 구축

## 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Deployment**: Vercel (추천)

## 시작하기

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
├── app/
│   ├── layout.tsx          # 전역 레이아웃
│   ├── page.tsx            # 메인 페이지
│   ├── globals.css         # 전역 스타일
│   └── product/[id]/       # 상품 상세 페이지
├── components/
│   ├── Header.tsx          # 헤더 컴포넌트
│   ├── Hero.tsx            # 히어로 섹션
│   └── ProductCard.tsx     # 상품 카드
├── lib/
│   ├── types.ts            # TypeScript 타입 정의
│   └── mockData.ts         # 목 데이터
└── public/                 # 정적 파일
```

## 디자인 컨셉

- **색상**: 보라색/파란색 그라데이션 (AI와 신뢰감)
- **효과**: 글래스모피즘, 블러, 애니메이션
- **UX**: 직관적인 정보 계층, 명확한 액션 버튼

## 향후 계획

- [ ] 실제 오픈마켓 API 연동 (쿠팡, 네이버, G마켓, 11번가)
- [ ] 실시간 AI 리뷰 분석 기능
- [ ] 사용자 맞춤 추천 알고리즘
- [ ] 가격 알림 기능
- [ ] 찜하기 및 장바구니 기능

## 라이선스

MIT

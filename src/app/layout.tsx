import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: '마켓플레이스 딜 사이트',
  description: 'AI 기반 자동 카테고리 분류 및 키워드 알림 기능을 갖춘 특가 상품 추천 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}

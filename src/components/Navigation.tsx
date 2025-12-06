'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              마켓플레이스 딜
            </span>
          </Link>

          {/* 네비게이션 버튼들 */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="glass px-4 py-2 rounded-full glass-hover inline-flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span className="font-semibold">업로드</span>
            </Link>
            <Link
              href="/login"
              className="glass px-6 py-2 rounded-full glass-hover"
            >
              <span className="font-semibold">로그인</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

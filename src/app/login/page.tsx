'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const data = await response.json();
        alert(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {/* 몽환적 배경 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              로그인
            </span>
          </h1>
          <p className="text-gray-400">
            특가 상품을 저장하고 알림을 받아보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl">
          <div className="space-y-6">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold mb-2">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="w-full glass py-4 rounded-xl font-semibold glass-hover mt-4"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                로그인
              </span>
            </button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('로그인 성공!', 'success');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 500);
      } else {
        const data = await response.json();
        // 에러 메시지를 적절한 필드에 할당
        if (data.error.includes('이메일') || data.error.includes('가입')) {
          setErrors({ email: data.error });
        } else if (data.error.includes('비밀번호')) {
          setErrors({ password: data.error });
        } else {
          setErrors({ email: data.error });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: '서버 오류가 발생했습니다' });
    } finally {
      setLoading(false);
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
                className={`w-full px-4 py-3 bg-white/5 border ${
                  errors.email ? 'border-red-400' : 'border-white/10'
                } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
                placeholder="your@email.com"
                disabled={loading}
                required
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-2">⚠️ {errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold">비밀번호</label>
                <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                  비밀번호 찾기
                </Link>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 bg-white/5 border ${
                  errors.password ? 'border-red-400' : 'border-white/10'
                } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
                placeholder="••••••••"
                disabled={loading}
                required
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-2">⚠️ {errors.password}</p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass py-4 rounded-xl font-semibold glass-hover mt-4 disabled:opacity-50"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {loading ? '로그인 중...' : '로그인'}
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

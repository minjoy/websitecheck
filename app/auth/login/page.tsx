'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { authService } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.login(email, password);

    if (result.success) {
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }

    setLoading(false);
  };

  return (
    <SimpleLayout>
      <main className="min-h-screen pt-24 pb-20">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">로그인</h1>
            <p className="text-gray-400">AI 특가에 오신 것을 환영합니다</p>
          </div>

          {/* 관리자 안내 */}
          <div className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="font-semibold text-purple-300 mb-2">테스트 계정</div>
              <div className="text-xs text-gray-400 space-y-1">
                {/* <div>관리자: admin@aideal.com / admin123</div> */}
                <div>일반: 아무 이메일 / 6자 이상</div>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold">비밀번호</label>
                <Link href="/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                  비밀번호 찾기
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="6자 이상"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center text-sm text-gray-400">
            아직 계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              회원가입
            </Link>
          </div>

          {/* 홈으로 */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-400">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
    </SimpleLayout>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { authService } from '@/lib/auth';
import { useToast } from '@/components/Toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) {
      router.push('/auth/forgot-password');
      return;
    }
    setEmail(emailParam);
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    const result = await authService.resetPassword(email, newPassword);

    if (result.success) {
      showToast('비밀번호가 성공적으로 변경되었습니다!', 'success');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } else {
      setError(result.error || '비밀번호 변경에 실패했습니다.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">비밀번호 재설정</h2>
            <p className="text-gray-400 text-sm">새로운 비밀번호를 입력하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* 이메일 표시 */}
          <div className="mb-6 p-4 glass rounded-lg">
            <p className="text-sm text-gray-400 mb-1">계정 이메일</p>
            <p className="text-purple-400 font-semibold">{email}</p>
          </div>

          {/* 비밀번호 재설정 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="6자 이상"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="비밀번호 재입력"
                required
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                <strong>비밀번호 요구사항:</strong>
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• 최소 6자 이상</li>
                <li>• 영문, 숫자 조합 권장</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/50"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                ← 로그인으로 돌아가기
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      </main>
    </SimpleLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <SimpleLayout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="glass rounded-2xl p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-400">로딩 중...</p>
            </div>
          </div>
        </div>
      </SimpleLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password.length < 5) {
      setErrors({ password: '비밀번호는 5자 이상이어야 합니다' });
      return;
    }

    if (password !== passwordConfirm) {
      setErrors({ passwordConfirm: '비밀번호가 일치하지 않습니다' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        showToast('비밀번호가 재설정되었습니다', 'success');
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setErrors({ password: data.error });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ password: '서버 오류가 발생했습니다' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="glass p-8 rounded-3xl text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">유효하지 않은 링크</h3>
        <p className="text-gray-400 text-sm mb-6">비밀번호 재설정 토큰이 없습니다.</p>
        <Link
          href="/forgot-password"
          className="glass px-6 py-3 rounded-xl inline-block glass-hover text-sm"
        >
          비밀번호 찾기로 이동
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass p-8 rounded-3xl text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold mb-2">비밀번호가 재설정되었습니다</h3>
        <p className="text-gray-400 text-sm mb-6">새로운 비밀번호로 로그인해주세요.</p>
        <Link
          href="/login"
          className="glass px-6 py-3 rounded-xl inline-block glass-hover text-sm"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">새 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 bg-white/5 border ${
              errors.password ? 'border-red-400' : 'border-white/10'
            } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
            placeholder="5자 이상"
            disabled={loading}
            required
          />
          {errors.password && <p className="text-red-400 text-sm mt-2">⚠️ {errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">새 비밀번호 확인</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={`w-full px-4 py-3 bg-white/5 border ${
              errors.passwordConfirm ? 'border-red-400' : 'border-white/10'
            } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
            placeholder="비밀번호 재입력"
            disabled={loading}
            required
          />
          {errors.passwordConfirm && (
            <p className="text-red-400 text-sm mt-2">⚠️ {errors.passwordConfirm}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50"
        >
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {loading ? '재설정 중...' : '비밀번호 재설정'}
          </span>
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      {/* 몽환적 배경 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              비밀번호 재설정
            </span>
          </h1>
          <p className="text-gray-400">새로운 비밀번호를 입력해주세요</p>
        </div>

        <Suspense fallback={<div className="glass p-8 rounded-3xl text-center">로딩 중...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-300">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}

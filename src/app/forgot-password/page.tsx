'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        showToast('비밀번호 재설정 링크가 전송되었습니다', 'success');
        setSent(true);
      } else {
        const data = await response.json();
        setErrors({ email: data.error });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
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
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              비밀번호 찾기
            </span>
          </h1>
          <p className="text-gray-400">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.email ? 'border-red-400' : 'border-white/10'
                  } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                />
                {errors.email && <p className="text-red-400 text-sm mt-2">⚠️ {errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50"
              >
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {loading ? '전송 중...' : '재설정 링크 받기'}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <div className="glass p-8 rounded-3xl text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">이메일이 전송되었습니다</h3>
            <p className="text-gray-400 text-sm mb-6">
              {email}로 비밀번호 재설정 링크를 전송했습니다.
              <br />
              이메일을 확인해주세요.
            </p>
            <Link
              href="/login"
              className="glass px-6 py-3 rounded-xl inline-block glass-hover text-sm"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-gray-400 hover:text-gray-300">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}

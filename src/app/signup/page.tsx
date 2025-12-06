'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

type Step = 'email' | 'verify' | 'password';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 인증 코드 전송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email || !email.includes('@')) {
      setErrors({ email: '유효한 이메일을 입력해주세요' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('인증 코드가 이메일로 전송되었습니다', 'success');
        setStep('verify');
        setCountdown(300); // 5분 카운트다운

        // 카운트다운 타이머
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({ email: data.error });
      }
    } catch (error) {
      console.error('Send code error:', error);
      setErrors({ email: '서버 오류가 발생했습니다' });
    } finally {
      setLoading(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!verificationCode || verificationCode.length !== 4) {
      setErrors({ verificationCode: '4자리 인증 코드를 입력해주세요' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('이메일 인증이 완료되었습니다', 'success');
        setStep('password');
      } else {
        setErrors({ verificationCode: data.error });
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setErrors({ verificationCode: '서버 오류가 발생했습니다' });
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const handleSignup = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('회원가입이 완료되었습니다!', 'success');
        // 라이프스타일 선택 페이지로 이동
        setTimeout(() => {
          router.push('/lifestyle-selection');
        }, 1000);
      } else {
        setErrors({ password: data.error });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ password: '서버 오류가 발생했습니다' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              회원가입
            </span>
          </h1>
          <p className="text-gray-400">AI 기반 맞춤 특가를 받아보세요</p>

          {/* 진행 단계 표시 */}
          <div className="flex justify-center gap-2 mt-6">
            <div
              className={`h-2 w-16 rounded-full ${
                step === 'email' ? 'bg-purple-500' : 'bg-white/20'
              }`}
            ></div>
            <div
              className={`h-2 w-16 rounded-full ${
                step === 'verify' ? 'bg-purple-500' : 'bg-white/20'
              }`}
            ></div>
            <div
              className={`h-2 w-16 rounded-full ${
                step === 'password' ? 'bg-purple-500' : 'bg-white/20'
              }`}
            ></div>
          </div>
        </div>

        {/* Step 1: 이메일 입력 */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="glass p-8 rounded-3xl">
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
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-2">⚠️ {errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50"
              >
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {loading ? '전송 중...' : '인증 코드 받기'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: 인증 코드 입력 */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="glass p-8 rounded-3xl">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">인증 코드</label>
                  {countdown > 0 && (
                    <span className="text-sm text-purple-400">{formatTime(countdown)}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.verificationCode ? 'border-red-400' : 'border-white/10'
                  } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors text-center text-2xl tracking-widest`}
                  placeholder="0000"
                  disabled={loading}
                />
                {errors.verificationCode && (
                  <p className="text-red-400 text-sm mt-2">⚠️ {errors.verificationCode}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {email}로 전송된 4자리 코드를 입력해주세요
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50"
              >
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {loading ? '확인 중...' : '인증 확인'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-gray-400 hover:text-gray-300"
              >
                이메일 다시 입력하기
              </button>
            </div>
          </form>
        )}

        {/* Step 3: 비밀번호 입력 */}
        {step === 'password' && (
          <form onSubmit={handleSignup} className="glass p-8 rounded-3xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.password ? 'border-red-400' : 'border-white/10'
                  } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
                  placeholder="5자 이상"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-2">⚠️ {errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.passwordConfirm ? 'border-red-400' : 'border-white/10'
                  } rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors`}
                  placeholder="비밀번호 재입력"
                  disabled={loading}
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
                  {loading ? '가입 중...' : '회원가입 완료'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* 로그인 링크 */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

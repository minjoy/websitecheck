'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { authService } from '@/lib/auth';
import { sendVerificationCode, verifyCode, getRemainingTime } from '@/lib/emailVerification';
import { useToast } from '@/components/Toast';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // 단계 관리
  const [step, setStep] = useState<'info' | 'verify'>('info');

  // 폼 데이터
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 인증 코드
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 정보 입력 단계 제출
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (name.length < 2) {
      setError('이름은 2자 이상이어야 합니다.');
      return;
    }

    // 인증 코드 발송
    setLoading(true);

    // 이메일 중복 확인 (향후 API 구현 예정, 현재는 회원가입 시 체크됨)
    const result = sendVerificationCode(email);

    if (result.success) {
      setSentCode(result.code || '');
      setStep('verify');
      setRemainingTime(30);
      showToast('인증 코드가 이메일로 발송되었습니다. (개발 환경: 콘솔 확인)', 'success');

      // 타이머 시작
      const timer = setInterval(() => {
        const remaining = getRemainingTime(email);
        setRemainingTime(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      setError(result.error || '인증 코드 발송에 실패했습니다.');
    }

    setLoading(false);
  };

  // 인증 코드 재발송
  const handleResend = () => {
    const result = sendVerificationCode(email);
    if (result.success) {
      setSentCode(result.code || '');
      setRemainingTime(30);
      setVerificationCode('');
      showToast('인증 코드가 재발송되었습니다. (개발 환경: 콘솔 확인)', 'success');
    } else {
      showToast(result.error || '재발송에 실패했습니다.', 'error');
    }
  };

  // 인증 코드 확인 및 회원가입
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = verifyCode(email, verificationCode);

    if (result.success) {
      // 회원가입 처리
      const signupResult = await authService.signup(email, name, password);

      if (signupResult.success) {
        showToast('회원가입이 완료되었습니다!', 'success');
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
      } else {
        setError(signupResult.error || '회원가입에 실패했습니다.');
      }
    } else {
      setError(result.error || '인증 코드가 일치하지 않습니다.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">회원가입</h2>
            <p className="text-gray-400 text-sm">AI 특가와 함께 스마트한 쇼핑을 시작하세요</p>
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

          {/* 단계 표시 */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step === 'info' ? 'text-purple-400' : 'text-green-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'info' ? 'bg-purple-500' : 'bg-green-500'}`}>
                {step === 'verify' ? '✓' : '1'}
              </div>
              <span className="ml-2 text-sm font-semibold">정보 입력</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-600 mx-2"></div>
            <div className={`flex items-center ${step === 'verify' ? 'text-purple-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'verify' ? 'bg-purple-500' : 'bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-semibold">이메일 인증</span>
            </div>
          </div>

          {/* 정보 입력 단계 */}
          {step === 'info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/50"
              >
                {loading ? '처리 중...' : '다음 단계'}
              </button>
            </form>
          )}

          {/* 이메일 인증 단계 */}
          {step === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-2">
                  <span className="text-purple-400 font-semibold">{email}</span>
                  <br />
                  으로 인증 코드를 발송했습니다.
                </p>
                <p className="text-sm text-gray-500">
                  {remainingTime > 0 ? (
                    <>남은 시간: <span className="text-purple-400 font-semibold">{remainingTime}분</span></>
                  ) : (
                    <span className="text-red-400">인증 코드가 만료되었습니다</span>
                  )}
                </p>
                {sentCode && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-400 mb-1">개발 환경 - 인증 코드:</p>
                    <p className="text-2xl font-bold text-yellow-300">{sentCode}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">인증 코드 (4자리)</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="flex-1 glass glass-hover py-3 rounded-lg font-semibold"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="flex-1 glass glass-hover py-3 rounded-lg font-semibold text-purple-400"
                >
                  재발송
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 4}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/50"
              >
                {loading ? '인증 중...' : '회원가입 완료'}
              </button>
            </form>
          )}

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                로그인
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      </main>
    </SimpleLayout>
  );
}

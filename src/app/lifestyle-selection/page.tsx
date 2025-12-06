'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function LifestyleSelectionPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    gender: '',
    ageGroup: '',
    lifeStage: '',
    residenceType: '',
    regionType: '',
    incomeLevel: '',
    jobIndustry: '',
    jobRole: '',
    workStyle: '',
    dailyPattern: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, suppressPopup: false }),
      });

      if (response.ok) {
        showToast('라이프스타일 정보가 저장되었습니다!', 'success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        const data = await response.json();
        showToast(data.error || '저장에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Save lifestyle error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch('/api/profile/lifestyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suppressPopup: true }),
      });
      router.push('/');
    } catch (error) {
      console.error('Skip error:', error);
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* 몽환적 배경 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              당신의 라이프스타일을 알려주세요
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            AI가 당신에게 딱 맞는 특가 상품을 추천해드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-8">
          {/* 인구통계학적 정보 */}
          <div>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              📊 기본 정보
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 성별 */}
              <div>
                <label className="block text-sm font-semibold mb-3">성별</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'MALE', label: '남성' },
                    { value: 'FEMALE', label: '여성' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.gender === option.value
                          ? 'bg-purple-500/30 border-purple-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 연령대 */}
              <div>
                <label className="block text-sm font-semibold mb-3">연령대</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'AGE_20S', label: '20대' },
                    { value: 'AGE_30S', label: '30대' },
                    { value: 'AGE_40S', label: '40대' },
                    { value: 'AGE_50S_PLUS', label: '50대+' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ageGroup: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.ageGroup === option.value
                          ? 'bg-purple-500/30 border-purple-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 라이프스타일 */}
          <div>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              🏠 라이프스타일
            </h2>

            <div className="space-y-6">
              {/* 가족 형태 */}
              <div>
                <label className="block text-sm font-semibold mb-3">가족 형태</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'SINGLE', label: '1인 가구' },
                    { value: 'COUPLE_NO_CHILD', label: '부부(자녀 없음)' },
                    { value: 'PARENTS_BABY_0_3', label: '영유아 자녀' },
                    { value: 'PARENTS_CHILD_4_7', label: '유아 자녀' },
                    { value: 'PARENTS_CHILD_8_13', label: '초등 자녀' },
                    { value: 'MULTI_GENERATION', label: '다세대 가구' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, lifeStage: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.lifeStage === option.value
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주거 형태 */}
              <div>
                <label className="block text-sm font-semibold mb-3">주거 형태</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'ONE_ROOM', label: '원룸/오피스텔' },
                    { value: 'APARTMENT', label: '아파트' },
                    { value: 'HOUSE', label: '주택/빌라' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, residenceType: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.residenceType === option.value
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지역 */}
              <div>
                <label className="block text-sm font-semibold mb-3">거주 지역</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'SEOUL_METRO', label: '수도권' },
                    { value: 'METRO_CITY', label: '광역시' },
                    { value: 'LOCAL_CITY', label: '지방 도시' },
                    { value: 'RURAL', label: '농어촌' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, regionType: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.regionType === option.value
                          ? 'bg-blue-500/30 border-blue-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 직업 및 업무 스타일 */}
          <div>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              💼 직업 및 업무
            </h2>

            <div className="space-y-6">
              {/* 직업 분야 */}
              <div>
                <label className="block text-sm font-semibold mb-3">직업 분야</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'OFFICE_BUSINESS', label: '사무/경영' },
                    { value: 'IT_DEV', label: 'IT/개발' },
                    { value: 'DESIGN_CREATIVE', label: '디자인/창작' },
                    { value: 'EDU_TEACHER', label: '교육/강사' },
                    { value: 'MEDICAL_HEALTH', label: '의료/보건' },
                    { value: 'SALES_SERVICE', label: '영업/서비스' },
                    { value: 'SELF_EMPLOYED', label: '자영업' },
                    { value: 'STUDENT', label: '학생' },
                    { value: 'HOME_MAKER', label: '주부/주부' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, jobIndustry: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.jobIndustry === option.value
                          ? 'bg-green-500/30 border-green-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 근무 형태 */}
              <div>
                <label className="block text-sm font-semibold mb-3">근무 형태</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'FULL_REMOTE', label: '재택근무' },
                    { value: 'HYBRID', label: '하이브리드' },
                    { value: 'ON_SITE', label: '사무실 출근' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, workStyle: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.workStyle === option.value
                          ? 'bg-green-500/30 border-green-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 생활 패턴 */}
              <div>
                <label className="block text-sm font-semibold mb-3">생활 패턴</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'MORNING_PERSON', label: '아침형 인간' },
                    { value: 'NIGHT_PERSON', label: '저녁형 인간' },
                    { value: 'NO_PATTERN', label: '불규칙' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyPattern: option.value })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        formData.dailyPattern === option.value
                          ? 'bg-green-500/30 border-green-400'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 glass px-6 py-4 rounded-xl font-semibold glass-hover"
            >
              다음에 하기
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 glass px-6 py-4 rounded-xl font-semibold glass-hover disabled:opacity-50"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {loading ? '저장 중...' : '저장하고 시작하기'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

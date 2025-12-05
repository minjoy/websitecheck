'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile } from '@/lib/types/profile';
import {
  GENDER_LABELS,
  AGE_GROUP_LABELS,
  LIFE_STAGE_LABELS,
  RESIDENCE_TYPE_LABELS,
  REGION_TYPE_LABELS,
  INCOME_LEVEL_LABELS,
  JOB_INDUSTRY_LABELS,
  JOB_ROLE_LABELS,
  WORK_STYLE_LABELS,
  DAILY_PATTERN_LABELS,
} from '@/lib/types/profile';

interface ProfileCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: UserProfile) => Promise<void>;
  onLater: () => void;
  onNeverShowAgain: () => void;
}

export default function ProfileCollectionModal({
  isOpen,
  onClose,
  onSubmit,
  onLater,
  onNeverShowAgain,
}: ProfileCollectionModalProps) {
  const [step, setStep] = useState(1); // 1: 인구통계, 2: 직업
  const [profile, setProfile] = useState<UserProfile>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(profile);
      onClose();
    } catch (error) {
      console.error('프로필 저장 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                // 배경 클릭 시 아무 동작 안 함 (팝업 강제 유지)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    맞춤형 추천을 위한 프로필 설정
                  </span>
                </h2>
                <p className="text-gray-400 text-sm">
                  회원님께 더 적합한 상품을 추천해드리기 위해 몇 가지 정보를 수집합니다.
                </p>
              </div>

              {/* 진행 단계 표시 */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    step >= 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-700'
                  }`}
                />
                <div
                  className={`flex-1 h-2 rounded-full ${
                    step >= 2 ? 'bg-gradient-to-r from-pink-600 to-blue-600' : 'bg-gray-700'
                  }`}
                />
              </div>

              {/* Step 1: 인구통계 */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold mb-4">기본 정보 (선택사항)</h3>

                  {/* 성별 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">성별</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(GENDER_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('gender', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.gender === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 연령대 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">연령대</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('ageGroup', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.ageGroup === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 생활 단계 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">생활 단계</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(LIFE_STAGE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('lifeStage', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all text-left ${
                            profile.lifeStage === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 거주 형태 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">거주 형태</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(RESIDENCE_TYPE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('residenceType', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.residenceType === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 지역 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">지역</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(REGION_TYPE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('regionType', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.regionType === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 소득 수준 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">소득 수준</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(INCOME_LEVEL_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('incomeLevel', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.incomeLevel === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleNext}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                      다음 단계
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: 직업 정보 */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-bold mb-4">직업 정보 (선택사항)</h3>

                  {/* 업종 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">업종</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(JOB_INDUSTRY_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('jobIndustry', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.jobIndustry === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 직급 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">직급</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(JOB_ROLE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('jobRole', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.jobRole === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 근무 형태 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">근무 형태</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(WORK_STYLE_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('workStyle', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.workStyle === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 생활 패턴 */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">생활 패턴</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(DAILY_PATTERN_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => handleUpdate('dailyPattern', value)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            profile.dailyPattern === value
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                              : 'glass glass-hover'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 rounded-lg font-semibold glass glass-hover"
                    >
                      이전
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? '저장 중...' : '완료'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 하단 옵션 */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                  <button
                    onClick={onLater}
                    className="flex-1 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    나중에 하기
                  </button>
                  <button
                    onClick={onNeverShowAgain}
                    className="flex-1 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    다시 보지 않기
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  다시 보지 않더라도 마이페이지에서 언제든지 수정할 수 있습니다
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

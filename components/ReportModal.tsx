'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  productTitle: string;
}

export default function ReportModal({ isOpen, onClose, onSubmit, productTitle }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass border border-white/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">상품 신고</h3>
                  <p className="text-sm text-gray-400 line-clamp-1">{productTitle}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 신고 사유 입력 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  신고 사유 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="신고 사유를 상세히 입력해주세요&#10;(예: 허위 정보, 스팸, 부적절한 콘텐츠 등)"
                  className="w-full bg-gray-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  rows={5}
                  disabled={isSubmitting}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {reason.length}/500
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-xs text-gray-300">
                    <p className="font-semibold text-yellow-400 mb-1">신고 안내</p>
                    <p>• 3회 이상 신고된 상품은 자동으로 노출이 중지됩니다</p>
                    <p>• 허위 신고는 제재 대상이 될 수 있습니다</p>
                    <p>• 신고는 취소할 수 없습니다</p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 glass glass-hover px-4 py-3 rounded-lg font-semibold"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '신고 중...' : '신고하기'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

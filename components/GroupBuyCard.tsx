'use client';

import { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { favoritesService } from '@/lib/favorites';
import { useToast } from './Toast';
import { trackProductView, trackProductClick, updateFavoriteCount } from '@/lib/analytics';
import { reportProduct, hasUserReported } from '@/lib/reports';
import ReportModal from './ReportModal';

interface GroupBuyCardProps {
  product: Product;
  index: number;
}

const marketplaceColors = {
  coupang: 'from-red-500 to-pink-500',
  naver: 'from-green-500 to-emerald-500',
  gmarket: 'from-orange-500 to-amber-500',
  '11st': 'from-blue-500 to-cyan-500',
  instagram: 'from-pink-500 to-purple-500',
  blog: 'from-blue-500 to-cyan-500',
  cafe: 'from-yellow-500 to-orange-500',
  other: 'from-gray-500 to-slate-500',
};

const marketplaceNames = {
  coupang: '쿠팡',
  naver: '네이버',
  gmarket: 'G마켓',
  '11st': '11번가',
  instagram: '인스타그램',
  blog: '블로그',
  cafe: '카페',
  other: '기타',
};

export default function GroupBuyCard({ product, index }: GroupBuyCardProps) {
  const { showToast } = useToast();
  const [user, setUser] = useState<Awaited<ReturnType<typeof authService.getCurrentUser>>>(null);
  const [isFav, setIsFav] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const isFav = await favoritesService.isFavorite(product.id);
        setIsFav(isFav);
        setHasReported(hasUserReported(product.id, currentUser.id));
      }
    };
    loadUser();

    // 상품 조회수 추적
    trackProductView(product.id);
  }, [product.id]);

  useEffect(() => {
    const handleAuthChange = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const isFav = await favoritesService.isFavorite(product.id);
        setIsFav(isFav);
        setHasReported(hasUserReported(product.id, currentUser.id));
      }
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [product.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('로그인이 필요합니다', 'warning');
      return;
    }

    const result = await favoritesService.toggleFavorite(product.id);
    if (result.success) {
      setIsFav(result.isFavorite);
      updateFavoriteCount(product.id, result.isFavorite);
      showToast(result.isFavorite ? '즐겨찾기에 추가되었습니다' : '즐겨찾기에서 제거되었습니다', 'success');
    } else {
      showToast(result.error || '즐겨찾기 처리에 실패했습니다', 'error');
    }
  };

  const handleProductClick = () => {
    trackProductClick(product.id);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('로그인이 필요합니다', 'warning');
      return;
    }

    if (hasReported) {
      showToast('이미 신고한 상품입니다', 'warning');
      return;
    }

    setShowReportModal(true);
  };

  const handleReportSubmit = async (reason: string) => {
    if (!user) return;

    const result = reportProduct(
      product.id,
      user.id,
      user.name,
      user.email,
      reason
    );

    if (result.success) {
      setHasReported(true);
      showToast(
        `신고가 접수되었습니다 (신고 ${result.reportCount}회)`,
        'success'
      );
    } else {
      showToast(result.error || '신고 처리에 실패했습니다', 'error');
    }
  };

  const formattedSalePrice = Math.floor(product.salePrice).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex-shrink-0 w-64"
    >
      <div className="glass glass-hover rounded-2xl overflow-hidden h-full">
        {/* 16:9 이미지 */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"
            onDoubleClick={handleFavoriteClick}
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />

            {/* 왼쪽 상단: 공구소식 라벨 & 할인율 */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg text-center">
                공구소식
              </div>
              {/* 할인율 - 형광색 */}
              <div className="bg-gradient-to-r from-lime-400 to-green-400 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg text-center">
                {product.discountRate}%
              </div>
            </div>

            {/* 오른쪽 상단: 신고 & 즐겨찾기 버튼 */}
            <div className="absolute top-3 right-3 flex gap-2">
              {/* 신고 버튼 */}
              <button
                onClick={handleReportClick}
                className={`bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all px-3 py-2 rounded-full shadow-lg ${
                  hasReported ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={hasReported}
                title={hasReported ? '이미 신고한 상품입니다' : '상품 신고'}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </button>

              {/* 즐겨찾기 버튼 */}
              <button
                onClick={handleFavoriteClick}
                className="bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all px-3 py-2 rounded-full shadow-lg"
              >
                <svg
                  className={`w-5 h-5 transition-all ${
                    isFav
                      ? 'fill-red-500 text-red-500'
                      : 'fill-none text-white hover:text-red-400'
                  }`}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* 마켓플레이스 */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/70 backdrop-blur-sm border border-white/30 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                {marketplaceNames[product.marketplace]}
              </div>
            </div>
          </div>
        </div>

        {/* 정보 섹션 */}
        <div className="p-3">
          {/* 제품명 */}
          <h3 className="text-sm font-bold mb-1.5 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {product.title}
          </h3>

          {/* 작성자 */}
          <div className="text-xs text-gray-500 mb-1.5">
            by {product.authorName}
          </div>

          {/* 공구 기간 */}
          <div className="text-xs text-gray-400 mb-2">
            {new Date(product.dealDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} ~ {product.dealEndDate ? new Date(product.dealEndDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'TBD'}
          </div>

          {/* 가격 */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {formattedSalePrice}원
            </span>
          </div>

          {/* 공구 참여 버튼 */}
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleProductClick}
            className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-center py-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
          >
            공구 보러가기
          </a>
        </div>
      </div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        productTitle={product.title}
      />
    </motion.div>
  );
}

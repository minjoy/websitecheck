'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { getAllProducts } from '@/lib/mockData';
import { Product } from '@/lib/types';
import { sortByPopularity, sortByRelevance, trackProductView, trackProductClick } from '@/lib/analytics';
import { filterHiddenProducts } from '@/lib/reports';
import { getUserInterests } from '@/lib/categories';
import { authService } from '@/lib/auth';

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

export default function GroupBuyPage() {
  const [groupBuys, setGroupBuys] = useState<Product[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  useEffect(() => {
    const loadGroupBuys = async () => {
      const allProducts = await getAllProducts();
      const groupBuyProducts = allProducts.filter(p => p.type === 'group-buy');

      // 사용자 관심사 로드
      const currentUser = await authService.getCurrentUser();
      const interests = currentUser ? getUserInterests(currentUser.id) : [];
      setUserInterests(interests);

      // 카테고리+인기도 기반 정렬 (조회수, 클릭수, 즐겨찾기 수 + 카테고리 매칭)
      const sortedProducts = sortByRelevance(groupBuyProducts, interests);
      // 신고된 상품 제외 (3회 이상 신고)
      const filteredProducts = filterHiddenProducts(sortedProducts);
      setGroupBuys(filteredProducts);
    };
    loadGroupBuys();

    // 관심사 변경 이벤트 리스너
    const handleInterestsChange = () => {
      loadGroupBuys();
    };
    window.addEventListener('interests-change', handleInterestsChange);
    window.addEventListener('auth-change', handleInterestsChange);

    return () => {
      window.removeEventListener('interests-change', handleInterestsChange);
      window.removeEventListener('auth-change', handleInterestsChange);
    };
  }, []);

  return (
    <SimpleLayout>
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                공구 소식
              </span>
            </h1>
            <p className="text-gray-400">
              {groupBuys.length}개의 공구가 진행 중입니다
            </p>
          </motion.div>

          {/* 그리드 */}
          {groupBuys.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groupBuys.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="glass glass-hover rounded-2xl overflow-hidden h-full">
                    {/* 16:9 이미지 */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* 공구소식 라벨 & 할인율 */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                            공구소식
                          </div>
                          {/* 할인율 - 형광색 */}
                          <div className="bg-gradient-to-r from-lime-400 to-green-400 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg text-center">
                            {product.discountRate}%
                          </div>
                        </div>

                        {/* 마켓플레이스 */}
                        <div className="absolute bottom-3 left-3">
                          <div className="glass px-2 py-1 rounded-full text-xs font-semibold">
                            {marketplaceNames[product.marketplace]}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 정보 섹션 */}
                    <div className="p-4">
                      {/* 제품명 */}
                      <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {product.title}
                      </h3>

                      {/* 작성자 및 날짜 */}
                      <div className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                        <span>by {product.authorName}</span>
                        <span>{new Date(product.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                      </div>

                      {/* 가격 */}
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 line-through mb-1">
                          {Math.floor(product.originalPrice).toLocaleString()}원
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {Math.floor(product.salePrice).toLocaleString()}원
                        </div>
                      </div>

                      {/* 공구 기간 */}
                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(product.dealDate).toLocaleDateString('ko-KR')} ~ {new Date(product.dealEndDate).toLocaleDateString('ko-KR')}
                      </div>

                      {/* 공구 참여 버튼 */}
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackProductClick(product.id)}
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-center py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50 text-sm"
                      >
                        공구 보러가기
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="glass inline-block p-8 rounded-2xl">
                <p className="text-gray-400 text-lg mb-2">진행 중인 공구가 없습니다</p>
                <p className="text-gray-500 text-sm">곧 다양한 공구 소식이 업데이트됩니다</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </SimpleLayout>
  );
}

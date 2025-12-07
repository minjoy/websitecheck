'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  normalPrice: number;
  salePrice: number;
  discountRate: number;
  isGroupBuy: boolean;
  favoriteCount: number;
  externalUrl: string | null;
  category: {
    name: string;
  } | null;
}

export default function HomePage() {
  const { showToast } = useToast();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/products/recommended?limit=12');
      const data = await response.json();

      if (response.ok) {
        setRecommendedProducts(data.products);
        setIsPersonalized(data.isPersonalized);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (productId: string) => {
    if (!reportReason.trim()) {
      showToast('신고 사유를 입력해주세요', 'warning');
      return;
    }

    setReportLoading(true);

    try {
      const response = await fetch(\`/api/products/\${productId}/report\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('신고가 접수되었습니다', 'success');
        setShowReportModal(null);
        setReportReason('');

        if (data.isHidden) {
          // 숨김 처리된 상품 제거
          setRecommendedProducts((prev) => prev.filter((p) => p.id !== productId));
        }
      } else {
        showToast(data.error || '신고에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Report error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const groupBuyProducts = recommendedProducts.filter((p) => p.isGroupBuy);
  const adminProducts = recommendedProducts.filter((p) => !p.isGroupBuy);

  return (
    <main className="min-h-screen">
      {/* Hero 섹션 */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* 몽환적 배경 애니메이션 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* AI 배지 */}
            <div className="inline-block mb-6">
              <div className="glass px-6 py-2 rounded-full inline-flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-sm font-semibold">
                  {isPersonalized ? '🎯 맞춤 추천' : '🔥 실시간 인기'}
                </span>
              </div>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                매일 찾아주는
              </span>
              <br />
              <span className="text-white">최고의 특가</span>
            </h1>

            {/* 설명 */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              AI가 분석한 신뢰도 높은 특가 상품을 매일 업데이트합니다.
              <br />
              스마트한 쇼핑으로 현명한 구매 결정을 내리세요.
            </p>

            {/* 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {recommendedProducts.length}
                </div>
                <div className="text-sm text-gray-400 mt-2">추천 상품</div>
              </div>
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  4.8★
                </div>
                <div className="text-sm text-gray-400 mt-2">평균 평점</div>
              </div>
              <div className="glass p-6 rounded-2xl glass-hover">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  매일
                </div>
                <div className="text-sm text-gray-400 mt-2">업데이트</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 공동구매 특가 섹션 */}
      {groupBuyProducts.length > 0 && (
        <section className="container mx-auto px-4 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                🔥 공동구매 특가
              </span>
            </h2>
            <p className="text-gray-400">사용자들이 직접 올린 실시간 공동구매</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groupBuyProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onReport={setShowReportModal} />
            ))}
          </div>
        </section>
      )}

      {/* 관리자 추천 특가 섹션 */}
      {adminProducts.length > 0 && (
        <section className="container mx-auto px-4 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                ✅ 관리자 추천 특가
              </span>
            </h2>
            <p className="text-gray-400">검증된 믿을 수 있는 특가 상품</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onReport={setShowReportModal} />
            ))}
          </div>
        </section>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <section className="container mx-auto px-4 pb-20 text-center">
          <div className="text-gray-400">상품을 불러오는 중...</div>
        </section>
      )}

      {/* 상품이 없을 때 */}
      {!loading && recommendedProducts.length === 0 && (
        <section className="container mx-auto px-4 pb-20">
          <div className="glass p-12 rounded-3xl text-center">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold mb-4">아직 등록된 상품이 없습니다</h3>
            <p className="text-gray-400 mb-8">첫 번째 상품을 등록해보세요!</p>
            <Link href="/upload" className="glass px-8 py-4 rounded-xl inline-block glass-hover">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                + 상품 업로드
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* CTA 버튼 */}
      {!isPersonalized && (
        <section className="container mx-auto px-4 pb-20">
          <div className="text-center">
            <Link
              href="/signup"
              className="glass px-8 py-4 rounded-full inline-block text-lg font-semibold glass-hover"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                지금 가입하고 맞춤 추천 받기 →
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* 푸터 */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="glass inline-block px-6 py-3 rounded-full mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              마켓플레이스 딜
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            매일 업데이트되는 스마트한 쇼핑 가이드
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2025 마켓플레이스 딜. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 신고 모달 */}
      {showReportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowReportModal(null)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl font-bold mb-4">상품 신고</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none mb-4"
                rows={4}
                placeholder="신고 사유를 입력해주세요"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(null)}
                  className="flex-1 glass px-6 py-3 rounded-xl glass-hover"
                >
                  취소
                </button>
                <button
                  onClick={() => handleReport(showReportModal)}
                  disabled={reportLoading}
                  className="flex-1 glass px-6 py-3 rounded-xl glass-hover disabled:opacity-50"
                >
                  <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                    {reportLoading ? '신고 중...' : '신고하기'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function ProductCard({
  product,
  onReport,
}: {
  product: Product;
  onReport: (id: string) => void;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden glass-hover group relative">
      {/* 신고 버튼 */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onReport(product.id);
        }}
        className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded-full bg-black/40 text-gray-400 hover:text-red-400 transition-colors"
      >
        신고
      </button>

      <a href={product.externalUrl || '#'} target="_blank" rel="noopener noreferrer">
        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">{product.isGroupBuy ? '🔥' : '✅'}</div>
          )}
        </div>
        <div className="p-5">
          {product.category && (
            <div className="text-xs text-purple-400 mb-1">{product.category.name}</div>
          )}
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {product.salePrice.toLocaleString()}원
            </span>
            <span className="text-sm glass px-2 py-1 rounded-full text-red-400 font-semibold">
              {product.discountRate}%
            </span>
          </div>
          <div className="text-sm text-gray-500 line-through">
            {product.normalPrice.toLocaleString()}원
          </div>
          <div className="mt-2 text-xs text-gray-400">
            ❤️ {product.favoriteCount.toLocaleString()}
          </div>
        </div>
      </a>
    </div>
  );
}

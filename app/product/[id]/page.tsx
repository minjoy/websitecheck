'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProductById, getReviewSummary } from '@/lib/mockData';

const sentimentColors = {
  positive: 'from-green-500 to-emerald-500',
  neutral: 'from-yellow-500 to-orange-500',
  negative: 'from-red-500 to-pink-500',
};

const sentimentText = {
  positive: '긍정적',
  neutral: '중립적',
  negative: '부정적',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const product = getProductById(productId);
  const reviewSummary = getReviewSummary(productId);

  if (!product) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
          <button
            onClick={() => router.push('/')}
            className="glass glass-hover px-6 py-3 rounded-xl"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  const discountAmount = product.originalPrice - product.salePrice;

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* 뒤로가기 버튼 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="glass glass-hover px-6 py-3 rounded-xl mb-8 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          돌아가기
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* 왼쪽: 상품 정보 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass rounded-2xl overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg">
                    {product.discountRate}%
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-sm text-purple-300 mb-2">{product.category}</div>
                <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-2xl">★</span>
                    <span className="ml-2 text-xl font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-gray-400">
                    ({product.reviewCount.toLocaleString()}개 리뷰)
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toLocaleString()}원
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {product.salePrice.toLocaleString()}원
                  </div>
                  <div className="text-xl text-green-400">
                    {discountAmount.toLocaleString()}원 할인
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="glass px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-center py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  구매하러 가기
                </a>
              </div>
            </div>
          </motion.div>

          {/* 오른쪽: 리뷰 요약 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {reviewSummary ? (
              <div className="space-y-6">
                {/* AI 인사이트 */}
                <div className="glass rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">AI 분석</h2>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{reviewSummary.aiInsight}</p>
                </div>

                {/* 종합 평가 */}
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4">종합 평가</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">전체 리뷰</span>
                    <span className="font-bold">{reviewSummary.totalReviews.toLocaleString()}개</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">평균 평점</span>
                    <span className="font-bold flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {reviewSummary.averageRating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">리뷰 감정</span>
                    <span className={`font-bold bg-gradient-to-r ${sentimentColors[reviewSummary.overallSentiment]} bg-clip-text text-transparent`}>
                      {sentimentText[reviewSummary.overallSentiment]}
                    </span>
                  </div>
                </div>

                {/* 장점 */}
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    장점
                  </h3>
                  <ul className="space-y-3">
                    {reviewSummary.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-gray-300">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 단점 */}
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-orange-400">!</span>
                    단점
                  </h3>
                  <ul className="space-y-3">
                    {reviewSummary.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">•</span>
                        <span className="text-gray-300">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 핵심 포인트 */}
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">★</span>
                    핵심 포인트
                  </h3>
                  <ul className="space-y-3">
                    {reviewSummary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-gray-400">리뷰 요약 정보가 아직 없습니다.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

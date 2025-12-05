'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { authService } from '@/lib/auth';
import { User } from '@/lib/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 폼 데이터
  const [title, setTitle] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [marketplace, setMarketplace] = useState<'instagram' | 'blog' | 'cafe' | 'other' | 'coupang' | 'naver' | 'gmarket' | '11st'>('instagram');
  const [category, setCategory] = useState('');
  const [dealDate, setDealDate] = useState('');
  const [dealEndDate, setDealEndDate] = useState('');

  // 리뷰 정보 (관리자 전용)
  const [rating, setRating] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);

  useEffect(() => {
    const loadUserAndProduct = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      setUser(currentUser);

      try {
        // 상품 데이터 로드 (실제 API 사용)
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          alert('상품을 찾을 수 없습니다.');
          router.push('/my-page');
          return;
        }

        const product = await productResponse.json();

        // 작성자 또는 관리자 확인
        if (product.authorId !== currentUser.id && currentUser.role !== 'admin') {
          alert('이 상품을 수정할 권한이 없습니다.');
          router.push('/my-page');
          return;
        }

        // 폼에 기존 데이터 채우기 (가격은 포맷팅하여 표시)
        setTitle(product.title);
        setOriginalPrice(product.originalPrice.toLocaleString());
        setSalePrice(product.salePrice.toLocaleString());
        setImageUrl(product.imageUrl);
        setProductUrl(product.productUrl);
        setMarketplace(product.marketplace);
        setCategory(product.category);
        setDealDate(product.dealDate);
        setDealEndDate(product.dealEndDate);

        // 리뷰 정보 로드 (관리자인 경우)
        if (currentUser.role === 'admin') {
          setRating(product.rating.toString());
          setReviewCount(product.reviewCount.toString());

          // 리뷰 요약 로드 (실제 API 사용)
          const reviewResponse = await fetch(`/api/reviews/${productId}`);
          if (reviewResponse.ok) {
            const review = await reviewResponse.json();
            setAiInsight(review.aiInsight);
            setPros(review.pros.length > 0 ? review.pros : ['']);
            setCons(review.cons.length > 0 ? review.cons : ['']);
            setKeyPoints(review.keyPoints.length > 0 ? review.keyPoints : ['']);
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        alert('상품을 불러오는 중 오류가 발생했습니다.');
        router.push('/my-page');
      }
    };

    loadUserAndProduct();
  }, [router, productId]);

  // 가격 포맷팅 함수
  const formatPrice = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    // 천단위 콤마 추가
    return parseInt(numbers).toLocaleString();
  };

  const handlePriceChange = (value: string, setter: (value: string) => void) => {
    const formatted = formatPrice(value);
    setter(formatted);
  };

  const parsePrice = (price: string) => {
    return parseInt(price.replace(/[^\d]/g, '') || '0');
  };

  const calculateDiscountRate = () => {
    const original = parsePrice(originalPrice);
    const sale = parsePrice(salePrice);
    if (original && sale && original > sale) {
      return Math.round(((original - sale) / original) * 100);
    }
    return 0;
  };

  // 배열 입력 관리 함수
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) return;

    const original = parsePrice(originalPrice);
    const sale = parsePrice(salePrice);

    if (sale >= original) {
      setError('할인가는 정가보다 낮아야 합니다.');
      return;
    }

    setLoading(true);

    try {
      // 상품 수정 (실제 API 사용)
      const updateResponse = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          originalPrice: original,
          salePrice: sale,
          imageUrl,
          marketplace,
          productUrl,
          rating: user.role === 'admin' ? parseFloat(rating) || 0 : 0,
          reviewCount: user.role === 'admin' ? parseInt(reviewCount) || 0 : 0,
          dealDate,
          dealEndDate,
          category: category || '기타',
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setError(errorData.error || '상품 수정에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 관리자가 리뷰 정보를 입력한 경우 저장 (TODO: 리뷰 API 구현 필요)
      // if (user.role === 'admin' && (rating || reviewCount || aiInsight || pros.some(p => p) || cons.some(c => c) || keyPoints.some(k => k))) {
      //   await fetch(`/api/reviews/${productId}`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       overallSentiment: 'positive',
      //       pros: pros.filter(p => p.trim() !== ''),
      //       cons: cons.filter(c => c.trim() !== ''),
      //       keyPoints: keyPoints.filter(k => k.trim() !== ''),
      //       aiInsight: aiInsight || '',
      //       totalReviews: parseInt(reviewCount) || 0,
      //       averageRating: parseFloat(rating) || 0,
      //     }),
      //   });
      // }

      setSuccess(true);

      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        router.push('/my-page');
      }, 2000);
    } catch (err) {
      setError('상품 수정에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SimpleLayout>
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            {/* 헤더 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">상품 수정</h1>
              <p className="text-gray-400">상품 정보를 수정하세요.</p>
            </div>

            {/* 에러/성공 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass bg-green-500/10 border-2 border-green-500/50 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
                >
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">수정 완료!</h3>
                  <p className="text-gray-300">마이페이지로 이동합니다...</p>
                </motion.div>
              </motion.div>
            )}

            {/* 수정 폼 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 제품명 */}
              <div>
                <label className="block text-sm font-semibold mb-2">제품명 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: 삼성 갤럭시 버즈3 프로"
                  required
                />
              </div>

              {/* 가격 정보 */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">정가 (원) *</label>
                  <input
                    type="text"
                    value={originalPrice}
                    onChange={(e) => handlePriceChange(e.target.value, setOriginalPrice)}
                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="100,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">할인가 (원) *</label>
                  <input
                    type="text"
                    value={salePrice}
                    onChange={(e) => handlePriceChange(e.target.value, setSalePrice)}
                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="70,000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">할인율</label>
                  <div className="glass px-4 py-3 rounded-lg text-purple-400 font-bold text-center">
                    {calculateDiscountRate()}%
                  </div>
                </div>
              </div>

              {/* 상품 링크 */}
              <div>
                <label className="block text-sm font-semibold mb-2">상품 링크 *</label>
                <div className="flex gap-2">
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value as typeof marketplace)}
                    className="glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <option value="coupang">쿠팡</option>
                        <option value="naver">네이버</option>
                        <option value="gmarket">G마켓</option>
                        <option value="11st">11번가</option>
                      </>
                    ) : (
                      <>
                        <option value="instagram">인스타그램</option>
                        <option value="blog">블로그</option>
                        <option value="cafe">카페</option>
                        <option value="other">기타</option>
                      </>
                    )}
                  </select>
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>

              {/* 상품 이미지 URL */}
              <div>
                <label className="block text-sm font-semibold mb-2">상품 이미지 URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..."
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-semibold mb-2">카테고리</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="예: 전자기기, 생활가전, 패션 등"
                />
              </div>

              {/* 공구 기간 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">시작일 *</label>
                  <input
                    type="date"
                    value={dealDate}
                    onChange={(e) => setDealDate(e.target.value)}
                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">종료일 *</label>
                  <input
                    type="date"
                    value={dealEndDate}
                    onChange={(e) => setDealEndDate(e.target.value)}
                    className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    min={dealDate}
                  />
                </div>
              </div>

              {/* 관리자 전용: 리뷰 정보 */}
              {user.role === 'admin' && (
                <>
                  <div className="border-t border-purple-500/20 pt-6 mt-2">
                    <h3 className="text-xl font-bold mb-4 text-purple-400">리뷰 정보 (선택사항)</h3>

                    {/* 별점 및 리뷰 수 */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">별점 (0.0 ~ 5.0)</label>
                        <input
                          type="number"
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="4.8"
                          min="0"
                          max="5"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">리뷰 수</label>
                        <input
                          type="number"
                          value={reviewCount}
                          onChange={(e) => setReviewCount(e.target.value)}
                          className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="1243"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* AI 인사이트 */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">AI 리뷰 요약</label>
                      <textarea
                        value={aiInsight}
                        onChange={(e) => setAiInsight(e.target.value)}
                        className="w-full glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                        placeholder="AI 분석 결과, 이 제품은..."
                      />
                    </div>

                    {/* 장점 */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">장점</label>
                      {pros.map((pro, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={pro}
                            onChange={(e) => updateArrayItem(setPros, index, e.target.value)}
                            className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="예: 뛰어난 노이즈 캔슬링 기능"
                          />
                          {pros.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(setPros, index)}
                              className="glass glass-hover px-4 py-3 rounded-lg text-red-400"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setPros)}
                        className="glass glass-hover px-4 py-2 rounded-lg text-sm text-purple-400"
                      >
                        + 장점 추가
                      </button>
                    </div>

                    {/* 단점 */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">단점</label>
                      {cons.map((con, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={con}
                            onChange={(e) => updateArrayItem(setCons, index, e.target.value)}
                            className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="예: 가격이 다소 비싼 편"
                          />
                          {cons.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(setCons, index)}
                              className="glass glass-hover px-4 py-3 rounded-lg text-red-400"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setCons)}
                        className="glass glass-hover px-4 py-2 rounded-lg text-sm text-purple-400"
                      >
                        + 단점 추가
                      </button>
                    </div>

                    {/* 핵심 포인트 */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">핵심 포인트</label>
                      {keyPoints.map((point, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => updateArrayItem(setKeyPoints, index, e.target.value)}
                            className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="예: 최신 블루투스 5.3 기술 적용"
                          />
                          {keyPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(setKeyPoints, index)}
                              className="glass glass-hover px-4 py-3 rounded-lg text-red-400"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setKeyPoints)}
                        className="glass glass-hover px-4 py-2 rounded-lg text-sm text-purple-400"
                      >
                        + 핵심 포인트 추가
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* 제출 버튼 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/my-page')}
                  className="flex-1 glass glass-hover py-3 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/50"
                >
                  {loading ? '수정 중...' : '수정하기'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </SimpleLayout>
  );
}

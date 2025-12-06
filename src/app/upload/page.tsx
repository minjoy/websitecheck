'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function UploadPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [productType, setProductType] = useState<'group-buy' | 'admin-deal'>('group-buy');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    externalUrl: '',
    normalPrice: '',
    salePrice: '',
    sourceSite: '',
    reviewCount: '',
    rating: '',
    pros: '',
    cons: '',
    summary: '',
    partnerLabel: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        showToast('로그인이 필요합니다', 'warning');
        router.push('/login');
        return;
      }

      setIsAdmin(data.user.isAdmin);
      setIsBlacklisted(data.user.isBlacklisted);
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlacklisted) {
      showToast('신고/차단 되었습니다. 관리자에게 문의해 주세요', 'error');
      return;
    }

    if (productType === 'admin-deal' && !isAdmin) {
      showToast('관리자만 등록할 수 있습니다', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isGroupBuy: productType === 'group-buy',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('상품이 등록되었습니다!', 'success');
        setTimeout(() => {
          router.push('/mypage');
        }, 1000);
      } else {
        showToast(data.error || '등록에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </main>
    );
  }

  if (isBlacklisted) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="glass p-12 rounded-3xl text-center max-w-md">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold mb-4">업로드 제한</h2>
          <p className="text-gray-400 mb-6">
            신고/차단 되었습니다.
            <br />
            관리자에게 문의해 주세요.
          </p>
          <button
            onClick={() => router.push('/')}
            className="glass px-6 py-3 rounded-xl glass-hover"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              특가 상품 업로드
            </span>
          </h1>
          <p className="text-gray-400">공동구매나 특가 상품 정보를 공유해주세요</p>
        </div>

        {/* Product type selection */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setProductType('group-buy')}
            className={\`flex-1 px-6 py-4 rounded-xl border transition-all \${
              productType === 'group-buy'
                ? 'bg-orange-500/30 border-orange-400'
                : 'glass border-white/10 glass-hover'
            }\`}
          >
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-semibold">공동구매</div>
            <div className="text-xs text-gray-400 mt-1">누구나 등록 가능</div>
          </button>

          <button
            type="button"
            onClick={() => isAdmin && setProductType('admin-deal')}
            disabled={!isAdmin}
            className={\`flex-1 px-6 py-4 rounded-xl border transition-all \${
              productType === 'admin-deal'
                ? 'bg-green-500/30 border-green-400'
                : isAdmin
                ? 'glass border-white/10 glass-hover'
                : 'glass border-white/10 opacity-50 cursor-not-allowed'
            }\`}
          >
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold">관리자 추천 특가</div>
            <div className="text-xs text-gray-400 mt-1">
              {isAdmin ? '관리자 전용' : '관리자만 가능'}
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
          {/* Common fields */}
          <div>
            <label className="block text-sm font-semibold mb-2">썸네일 이미지 주소</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">제품명</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
              placeholder="예) 삼성 갤럭시북4 프로 16인치"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">정상가 (원)</label>
              <input
                type="number"
                value={formData.normalPrice}
                onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="2900000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">할인가 (원)</label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="1890000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">제품 링크</label>
            <input
              type="url"
              value={formData.externalUrl}
              onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">제품 출처</label>
            <input
              type="text"
              value={formData.sourceSite}
              onChange={(e) => setFormData({ ...formData, sourceSite: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
              placeholder="예) 쿠팡, 11번가, 네이버쇼핑"
            />
          </div>

          {/* Admin deal extra fields */}
          {productType === 'admin-deal' && (
            <>
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  관리자 추천 특가 추가 정보
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">리뷰 수</label>
                  <input
                    type="number"
                    value={formData.reviewCount}
                    onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                    placeholder="1250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">별점 (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                    placeholder="4.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">장점</label>
                <textarea
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={3}
                  placeholder="예) 가성비 우수, 성능 뛰어남, 디자인 세련됨"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">단점</label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={3}
                  placeholder="예) 무게가 약간 무거움, 배터리 시간 보통"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">실제 총평 요약</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={4}
                  placeholder="이 제품에 대한 종합적인 평가를 작성해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">파트너스 문구</label>
                <input
                  type="text"
                  value={formData.partnerLabel}
                  onChange={(e) => setFormData({ ...formData, partnerLabel: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                  placeholder="예) 쿠팡 파트너스 활동으로 일정액의 수수료를 제공받습니다"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50 mt-8"
          >
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {loading ? '업로드 중...' : '업로드하기'}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}

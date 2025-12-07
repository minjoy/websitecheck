'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    isGroupBuy: false,
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);

      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.product.title || '',
          description: data.product.description || '',
          thumbnailUrl: data.product.thumbnailUrl || '',
          externalUrl: data.product.externalUrl || '',
          normalPrice: data.product.normalPrice?.toString() || '',
          salePrice: data.product.salePrice?.toString() || '',
          sourceSite: data.product.sourceSite || '',
          reviewCount: data.product.reviewCount?.toString() || '',
          rating: data.product.rating?.toString() || '',
          pros: data.product.pros || '',
          cons: data.product.cons || '',
          summary: data.product.summary || '',
          partnerLabel: data.product.partnerLabel || '',
          isGroupBuy: data.product.isGroupBuy,
        });
      } else {
        showToast('상품을 불러올 수 없습니다', 'error');
        router.push('/mypage');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast('상품이 수정되었습니다', 'success');
        setTimeout(() => {
          router.push('/mypage');
        }, 1000);
      } else {
        const data = await response.json();
        showToast(data.error || '수정에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              상품 수정
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">썸네일 이미지 주소</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
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
            />
          </div>

          {!formData.isGroupBuy && (
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
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">단점</label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">실제 총평 요약</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">파트너스 문구</label>
                <input
                  type="text"
                  value={formData.partnerLabel}
                  onChange={(e) => setFormData({ ...formData, partnerLabel: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full glass py-4 rounded-xl font-semibold glass-hover disabled:opacity-50 mt-8"
          >
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {saving ? '저장 중...' : '수정 완료'}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    price: '',
    discountRate: '',
    isGroupBuy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동
    alert('업로드 기능은 준비 중입니다.');
  };

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              특가 상품 업로드
            </span>
          </h1>
          <p className="text-gray-400">
            공동구매나 특가 상품 정보를 공유해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl">
          <div className="space-y-6">
            {/* 상품명 */}
            <div>
              <label className="block text-sm font-semibold mb-2">상품명</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="예) 삼성 노트북 갤럭시북"
                required
              />
            </div>

            {/* 상품 URL */}
            <div>
              <label className="block text-sm font-semibold mb-2">상품 URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                placeholder="https://..."
                required
              />
            </div>

            {/* 가격 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">가격 (원)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                  placeholder="990000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">할인율 (%)</label>
                <input
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400/50 transition-colors"
                  placeholder="30"
                />
              </div>
            </div>

            {/* 공동구매 여부 */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isGroupBuy"
                checked={formData.isGroupBuy}
                onChange={(e) => setFormData({ ...formData, isGroupBuy: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 cursor-pointer"
              />
              <label htmlFor="isGroupBuy" className="text-sm cursor-pointer">
                공동구매 상품입니다
              </label>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="w-full glass py-4 rounded-xl font-semibold glass-hover mt-8"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                업로드하기
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

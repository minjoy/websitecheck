'use client';

import { useEffect, useState } from 'react';
import { productAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import RealtimeBanner from '@/components/RealtimeBanner';

interface Product {
  id: string;
  title: string;
  thumbnailUrl: string;
  normalPrice: number;
  salePrice: number;
  discountRate: number;
  isGroupBuy: boolean;
  favoriteCount: number;
}

export default function HomePage() {
  const [groupBuyProducts, setGroupBuyProducts] = useState<Product[]>([]);
  const [verifiedProducts, setVerifiedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [groupBuyRes, verifiedRes] = await Promise.all([
        productAPI.getProducts({ isGroupBuy: true, limit: 20 }),
        productAPI.getProducts({ isAdminVerified: true, limit: 20 }),
      ]);

      setGroupBuyProducts(groupBuyRes.data.products || []);
      setVerifiedProducts(verifiedRes.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 실시간 배너 */}
      <RealtimeBanner />

      <main className="container mx-auto px-4 py-8">
        {/* 공동구매 상품 섹션 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">🔥 공동구매 특가</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupBuyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 검증된 상품 섹션 */}
        <section>
          <h2 className="text-3xl font-bold mb-6">✅ 관리자 추천 상품</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {verifiedProducts.map((product) => (
              <ProductCard key={product.id} product={product} isVerified />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

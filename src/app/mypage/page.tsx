'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  createdAt: string;
}

export default function MyPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/my');
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        if (response.status === 401) {
          showToast('로그인이 필요합니다', 'warning');
          router.push('/login');
        } else {
          showToast(data.error || '상품을 불러올 수 없습니다', 'error');
        }
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('상품이 삭제되었습니다', 'success');
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        const data = await response.json();
        showToast(data.error || '삭제에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setDeleting(null);
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              👤 마이페이지
            </span>
          </h1>
          <p className="text-gray-400">내가 등록한 상품을 관리하세요</p>
        </div>

        {/* 상품 목록 */}
        {products.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold mb-4">등록한 상품이 없습니다</h3>
            <p className="text-gray-400 mb-8">첫 번째 상품을 등록해보세요!</p>
            <Link
              href="/upload"
              className="glass px-8 py-4 rounded-xl inline-block glass-hover"
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                + 상품 업로드
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="glass p-6 rounded-2xl glass-hover">
                <div className="flex gap-6">
                  {/* 썸네일 */}
                  <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-4xl">
                        {product.isGroupBuy ? '🔥' : '✅'}
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 glass">
                          {product.isGroupBuy ? '🔥 공동구매' : '✅ 관리자 추천'}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
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
                    </div>

                    {/* 통계 */}
                    <div className="flex gap-6 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-400">조회수:</span>{' '}
                        <span className="font-semibold text-blue-400">
                          {product.viewCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">클릭수:</span>{' '}
                        <span className="font-semibold text-green-400">
                          {product.clickCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">즐겨찾기:</span>{' '}
                        <span className="font-semibold text-pink-400">
                          {product.favoriteCount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="glass px-6 py-2 rounded-xl glass-hover text-sm font-semibold"
                      >
                        ✏️ 수정
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="glass px-6 py-2 rounded-xl glass-hover text-sm font-semibold text-red-400 disabled:opacity-50"
                      >
                        {deleting === product.id ? '삭제 중...' : '🗑️ 삭제'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 라이프스타일 설정 링크 */}
        <div className="mt-12 text-center">
          <Link
            href="/lifestyle-selection"
            className="glass px-6 py-3 rounded-xl inline-block glass-hover text-sm"
          >
            ⚙️ 라이프스타일 정보 수정
          </Link>
        </div>
      </div>
    </main>
  );
}

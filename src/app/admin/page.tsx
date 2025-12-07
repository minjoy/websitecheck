'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isBlacklisted: boolean;
}

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
  reportCount: number;
  user: User | null;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchProducts();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      setFilteredProducts(products.filter((p) => p.user?.id === selectedUserId));
    } else {
      setFilteredProducts(products);
    }
  }, [selectedUserId, products]);

  const checkAdminAndFetchProducts = async () => {
    try {
      // 관리자 확인
      const meResponse = await fetch('/api/auth/me');
      const meData = await meResponse.json();

      if (!meData.user || !meData.user.isAdmin) {
        showToast('관리자 권한이 필요합니다', 'error');
        router.push('/');
        return;
      }

      // 상품 목록 가져오기
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        showToast(data.error || '상품을 불러올 수 없습니다', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? '해제' : '추가';
    if (!confirm(`정말 블랙리스트에서 ${action}하시겠습니까?`)) {
      return;
    }

    setActionLoading(userId);

    try {
      const response = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blacklist: !currentStatus }),
      });

      if (response.ok) {
        showToast(`블랙리스트에서 ${action}되었습니다`, 'success');
        // 상품 목록 새로고침
        await checkAdminAndFetchProducts();
      } else {
        const data = await response.json();
        showToast(data.error || '작업에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Blacklist error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    setActionLoading(productId);

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
      console.error('Delete error:', error);
      showToast('서버 오류가 발생했습니다', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // 고유한 사용자 목록 추출
  const uniqueUsers = Array.from(
    new Map(
      products
        .filter((p) => p.user)
        .map((p) => [p.user!.id, p.user!])
    ).values()
  );

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              🛠️ 관리자 페이지
            </span>
          </h1>
          <p className="text-gray-400">모든 사용자의 상품을 관리하세요</p>
        </div>

        {/* 사용자 필터 */}
        <div className="mb-8 glass p-6 rounded-2xl">
          <label className="block text-sm font-semibold mb-3">등록자 필터</label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedUserId(null)}
              className={`px-4 py-2 rounded-xl border transition-all ${
                selectedUserId === null
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'glass border-white/10 glass-hover'
              }`}
            >
              전체 ({products.length})
            </button>
            {uniqueUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  selectedUserId === user.id
                    ? 'bg-purple-500/30 border-purple-400'
                    : 'glass border-white/10 glass-hover'
                }`}
              >
                {user.email}
                {user.isBlacklisted && ' 🚫'}
                ({products.filter((p) => p.user?.id === user.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        {filteredProducts.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold mb-4">상품이 없습니다</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="glass p-6 rounded-2xl">
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
                      <div className="text-4xl">{product.isGroupBuy ? '🔥' : '✅'}</div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold glass">
                            {product.isGroupBuy ? '🔥 공동구매' : '✅ 관리자 추천'}
                          </div>
                          {product.reportCount >= 3 && (
                            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/30 border border-red-400">
                              🚨 신고 {product.reportCount}회
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                        {product.user && (
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => setSelectedUserId(product.user!.id)}
                              className="text-sm text-purple-400 hover:text-purple-300"
                            >
                              등록자: {product.user.email}
                            </button>
                            {product.user.isBlacklisted && (
                              <span className="text-xs glass px-2 py-1 rounded-full text-red-400">
                                블랙리스트
                              </span>
                            )}
                          </div>
                        )}
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
                        <span className="text-gray-400">조회:</span>{' '}
                        <span className="font-semibold">{product.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">클릭:</span>{' '}
                        <span className="font-semibold">{product.clickCount.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">즐겨찾기:</span>{' '}
                        <span className="font-semibold">
                          {product.favoriteCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">신고:</span>{' '}
                        <span
                          className={`font-semibold ${
                            product.reportCount >= 3 ? 'text-red-400' : ''
                          }`}
                        >
                          {product.reportCount}
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
                        disabled={actionLoading === product.id}
                        className="glass px-6 py-2 rounded-xl glass-hover text-sm font-semibold text-red-400 disabled:opacity-50"
                      >
                        {actionLoading === product.id ? '삭제 중...' : '🗑️ 삭제'}
                      </button>
                      {product.user && (
                        <button
                          onClick={() =>
                            handleBlacklist(product.user!.id, product.user!.isBlacklisted)
                          }
                          disabled={actionLoading === product.user.id}
                          className={`glass px-6 py-2 rounded-xl glass-hover text-sm font-semibold ${
                            product.user.isBlacklisted ? 'text-green-400' : 'text-orange-400'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === product.user.id
                            ? '처리 중...'
                            : product.user.isBlacklisted
                            ? '✅ 블랙리스트 해제'
                            : '🚫 블랙리스트 추가'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

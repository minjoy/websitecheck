'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  productCount: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  productUrl: string;
  category: string;
  type: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMemberProducts, setSelectedMemberProducts] = useState<Product[]>([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadMembers = async () => {
      const isAdmin = await authService.isAdmin();
      if (!isAdmin) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/admin/members', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data = await response.json();
        setMembers(data.members);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadMembers();
  }, [router]);

  const handleMemberClick = async (member: Member) => {
    setSelectedMember(member);
    setShowProductsModal(true);
    setLoadingProducts(true);

    try {
      const response = await fetch(`/api/admin/members/${member.id}/products`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch member products');
      }

      const data = await response.json();
      setSelectedMemberProducts(data.products);
    } catch (error) {
      console.error('Failed to load member products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCloseModal = () => {
    setShowProductsModal(false);
    setSelectedMember(null);
    setSelectedMemberProducts([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              회원 관리
            </span>
          </h1>
          <p className="text-gray-400">
            전체 {members.length}명의 회원
          </p>
        </motion.div>

        {/* 회원 목록 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">이메일</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">이름</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">역할</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">상품 개수</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">가입일</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">액션</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleMemberClick(member)}
                  >
                    <td className="px-6 py-4 text-sm">{member.email}</td>
                    <td className="px-6 py-4 text-sm">{member.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          member.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {member.role === 'admin' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                        {member.productCount}개
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMemberClick(member);
                        }}
                        className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                      >
                        상품 보기
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {members.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              등록된 회원이 없습니다.
            </div>
          )}
        </motion.div>
      </div>

      {/* 상품 목록 모달 */}
      <AnimatePresence>
        {showProductsModal && selectedMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 모달 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{selectedMember.name}님의 상품</h3>
                    <p className="text-gray-400 text-sm">{selectedMember.email}</p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 상품 목록 */}
                {loadingProducts ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">상품 목록을 불러오는 중...</p>
                  </div>
                ) : selectedMemberProducts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMemberProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass rounded-lg p-4 flex gap-4"
                      >
                        {/* 상품 이미지 */}
                        <div className="flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* 상품 정보 */}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2 line-clamp-2">{product.title}</h4>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-semibold">
                              {product.category}
                            </span>
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-semibold">
                              {product.type === 'group-buy' ? '공동구매' : '일반'}
                            </span>
                            {product.isVerified && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                                ✓ 검증됨
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-purple-400">
                              {product.price.toLocaleString()}원
                            </span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {product.originalPrice.toLocaleString()}원
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>상품 ID: {product.id}</span>
                            <span>등록일: {new Date(product.createdAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
                          >
                            상품 보기
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    등록한 상품이 없습니다.
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

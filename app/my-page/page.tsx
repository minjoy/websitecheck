'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SimpleLayout from '@/components/SimpleLayout';
import { authService } from '@/lib/auth';
import { getAllProducts, deleteProduct } from '@/lib/mockData';
import { User, Product } from '@/lib/types';
import { addToBlacklist, removeFromBlacklist, isUserBlacklisted } from '@/lib/blacklist';
import { useToast } from '@/components/Toast';
import { getUserFavorites } from '@/lib/favorites';
import { getUserKeywords, addKeyword, removeKeyword } from '@/lib/keywordAlerts';
import { getProductStatsForAuthor } from '@/lib/analytics';
import { getReportCount, getReporters, dismissReports, Report } from '@/lib/reports';
import { CATEGORIES, Category, getUserInterests, updateUserInterests } from '@/lib/categories';

export default function MyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'favorites' | 'keywords' | 'interests'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [interests, setInterests] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [userBlacklistStatus, setUserBlacklistStatus] = useState<Record<string, boolean>>({});
  const [showReportDetails, setShowReportDetails] = useState<string | null>(null);
  const [selectedProductReports, setSelectedProductReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      setUser(currentUser);
      loadProducts(currentUser);
    };

    loadUser();
  }, [router]);

  const loadProducts = async (currentUser: User) => {
    const allProducts = await getAllProducts();

    // 관리자는 모든 상품, 일반 사용자는 자신의 상품만
    const userProducts = currentUser.role === 'admin'
      ? allProducts
      : allProducts.filter(p => p.authorId === currentUser.id);

    setProducts(userProducts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));

    // 즐겨찾기 상품 로드
    const favoriteIds = await getUserFavorites(currentUser.id);
    const favorites = allProducts.filter(p => favoriteIds.includes(p.id));
    setFavoriteProducts(favorites.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));

    // 키워드 알림 로드
    const userKeywords = await getUserKeywords(currentUser.id);
    setKeywords(userKeywords);

    // 관심사 카테고리 로드
    const userInterests = getUserInterests(currentUser.id);
    setInterests(userInterests);

    // 관리자의 경우 블랙리스트 상태 로드
    if (currentUser.role === 'admin') {
      const status: Record<string, boolean> = {};
      const uniqueAuthors = Array.from(new Set(allProducts.map(p => p.authorId)));
      uniqueAuthors.forEach(authorId => {
        status[authorId] = isUserBlacklisted(authorId);
      });
      setUserBlacklistStatus(status);
    }
  };

  const handleToggleBlacklist = (authorId: string, authorEmail: string, authorName: string) => {
    const isBlacklisted = userBlacklistStatus[authorId];

    if (isBlacklisted) {
      // 블랙리스트 해제
      const success = removeFromBlacklist(authorId);
      if (success) {
        setUserBlacklistStatus(prev => ({ ...prev, [authorId]: false }));
        showToast(`${authorName}님의 블랙리스트가 해제되었습니다.`, 'success');
      }
    } else {
      // 블랙리스트 추가
      const success = addToBlacklist(authorId, authorEmail, authorName, '관리자에 의한 제재');
      if (success) {
        setUserBlacklistStatus(prev => ({ ...prev, [authorId]: true }));
        showToast(`${authorName}님이 블랙리스트에 추가되었습니다.`, 'warning');
      }
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !productToDelete) return;

    const success = await deleteProduct(productToDelete, user.id);
    if (success) {
      await loadProducts(user);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } else {
      alert('삭제 권한이 없거나 상품을 찾을 수 없습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleWithdrawClick = () => {
    setShowWithdrawConfirm(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!user) return;

    // 회원 탈퇴 처리
    const success = await authService.deleteAccount();
    if (success) {
      // 로그인 페이지로 이동
      window.dispatchEvent(new Event('auth-change'));
      router.push('/');
    }
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawConfirm(false);
  };

  const handleAddKeyword = async () => {
    if (!user || !newKeyword.trim()) return;

    const success = await addKeyword(user.id, user.email, newKeyword.trim());
    if (success) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
      showToast('키워드가 추가되었습니다', 'success');
    } else {
      showToast('이미 등록된 키워드이거나 잘못된 입력입니다', 'error');
    }
  };

  const handleRemoveKeyword = async (keyword: string) => {
    if (!user) return;

    const success = await removeKeyword(user.id, keyword);
    if (success) {
      setKeywords(keywords.filter(k => k !== keyword));
      showToast('키워드가 삭제되었습니다', 'success');
    }
  };

  const handleToggleInterest = (category: Category) => {
    if (!user) return;

    const newInterests = interests.includes(category)
      ? interests.filter(c => c !== category)
      : [...interests, category];

    const success = updateUserInterests(user.id, newInterests);
    if (success) {
      setInterests(newInterests);
      showToast(
        interests.includes(category)
          ? '관심사가 제거되었습니다'
          : '관심사가 추가되었습니다',
        'success'
      );
    } else {
      showToast('관심사 업데이트에 실패했습니다', 'error');
    }
  };

  const handleRemoveFavorite = async (productId: string, productTitle: string) => {
    if (!user) return;

    const confirmed = window.confirm(`"${productTitle}"을(를) 즐겨찾기에서 해제할까요?`);
    if (!confirmed) return;

    const { favoritesService } = await import('@/lib/favorites');
    const result = await favoritesService.removeFavorite(productId);

    if (result.success) {
      setFavoriteProducts(favoriteProducts.filter(p => p.id !== productId));
      showToast('즐겨찾기가 해제되었습니다', 'success');
    } else {
      showToast(result.error || '즐겨찾기 해제에 실패했습니다', 'error');
    }
  };

  const handleViewReports = (productId: string) => {
    const reports = getReporters(productId);
    setSelectedProductReports(reports);
    setShowReportDetails(productId);
  };

  const handleDismissReports = (productId: string) => {
    const confirmed = window.confirm('이 상품의 모든 신고를 해제하시겠습니까?');
    if (!confirmed) return;

    dismissReports(productId);
    setShowReportDetails(null);
    setSelectedProductReports([]);
    showToast('신고가 해제되었습니다', 'success');

    // reports-change 이벤트 발생으로 다른 컴포넌트에 알림
    window.dispatchEvent(new Event('reports-change'));
  };

  if (!user) {
    return null;
  }

  return (
    <SimpleLayout>
      <main className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                마이페이지
              </span>
            </h1>
            <p className="text-gray-400">
              {user.role === 'admin' ? '모든 상품을 관리할 수 있습니다' : '내가 등록한 상품을 관리할 수 있습니다'}
            </p>
          </motion.div>

          {/* 사용자 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-sm text-purple-400 mt-2">
                  {user.role === 'admin' ? '관리자' : '일반 회원'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {products.length}
                </div>
                <div className="text-sm text-gray-400">등록 상품</div>
              </div>
            </div>

            {/* 회원 탈퇴 버튼 (관리자는 제외) */}
            {user.role !== 'admin' && (
              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={handleWithdrawClick}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  회원 탈퇴
                </button>
              </div>
            )}
          </motion.div>

          {/* 탭 네비게이션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                  : 'glass glass-hover'
              }`}
            >
              내 상품 ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                  : 'glass glass-hover'
              }`}
            >
              즐겨찾기 ({favoriteProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'keywords'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                  : 'glass glass-hover'
              }`}
            >
              키워드 알림 ({keywords.length})
            </button>
            <button
              onClick={() => setActiveTab('interests')}
              className={`py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'interests'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50'
                  : 'glass glass-hover'
              }`}
            >
              관심사 ({interests.length})
            </button>
          </motion.div>

          {/* 내 상품 목록 */}
          {activeTab === 'products' && products.length > 0 && (
            <div className="space-y-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="glass glass-hover rounded-2xl p-4 md:p-6"
                >
                  {/* 모바일 레이아웃 */}
                  <div className="md:hidden space-y-3">
                    {/* 상단: 썸네일 + 배지 + 할인율 + 날짜 + 가격 */}
                    <div className="flex gap-3">
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            product.type === 'deal'
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                          }`}>
                            {product.type === 'deal' ? '검증' : '공구'}
                          </span>
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            {product.discountRate}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-gray-500 line-through">
                            {Math.floor(product.originalPrice).toLocaleString()}원
                          </div>
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {Math.floor(product.salePrice).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-base font-bold line-clamp-2">{product.title}</h3>

                    {/* 통계 정보 */}
                    {(() => {
                      const stats = getProductStatsForAuthor(product.id);
                      const reportCount = getReportCount(product.id);
                      return (
                        <div className="flex gap-3 text-xs flex-wrap">
                          <div className="flex items-center gap-1 text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{stats.viewCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            <span>{stats.clickCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-400">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{stats.favoriteCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-400">
                            <span>참여율 {stats.engagementRate}%</span>
                          </div>
                          {reportCount > 0 && (
                            <button
                              onClick={() => handleViewReports(product.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                                reportCount >= 3
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                              </svg>
                              <span>신고 {reportCount}회</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* 작성자 */}
                    {user.role === 'admin' && product.authorId !== user.id && (
                      <div className="flex items-center justify-between py-2 border-t border-white/10">
                        <div className="text-xs text-gray-500">
                          작성자: {product.authorName}
                        </div>
                        <button
                          onClick={() => handleToggleBlacklist(product.authorId, product.authorName, product.authorName)}
                          className={`text-xs px-2 py-1 rounded-full font-semibold transition-all ${
                            userBlacklistStatus[product.authorId]
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {userBlacklistStatus[product.authorId] ? '해제' : '블랙리스트'}
                        </button>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-center"
                      >
                        상품 보기
                      </a>
                      <Link
                        href={`/edit/${product.id}`}
                        className="flex-1 glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-blue-400 text-center"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="flex-1 glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-red-400"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 데스크톱 레이아웃 */}
                  <div className="hidden md:flex gap-4">
                    {/* 이미지 */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.type === 'deal'
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                          }`}>
                            {product.type === 'deal' ? '검증 상품' : '공구 소식'}
                          </span>
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {product.discountRate}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-gray-400 line-through text-sm">
                          {Math.floor(product.originalPrice).toLocaleString()}원
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {Math.floor(product.salePrice).toLocaleString()}원
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 mb-3">
                        {new Date(product.dealDate).toLocaleDateString('ko-KR')} ~ {new Date(product.dealEndDate).toLocaleDateString('ko-KR')}
                      </div>

                      {/* 통계 정보 */}
                      {(() => {
                        const stats = getProductStatsForAuthor(product.id);
                        const reportCount = getReportCount(product.id);
                        return (
                          <div className="flex gap-4 text-sm mb-4 flex-wrap">
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{stats.viewCount} 조회</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                              </svg>
                              <span>{stats.clickCount} 클릭</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-red-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{stats.favoriteCount} 즐겨찾기</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-green-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span>참여율 {stats.engagementRate}%</span>
                            </div>
                            {reportCount > 0 && (
                              <button
                                onClick={() => handleViewReports(product.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${
                                  reportCount >= 3
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                                <span>신고 {reportCount}회</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* 작성자 (관리자만 표시) */}
                      {user.role === 'admin' && product.authorId !== user.id && (
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500">
                            작성자: {product.authorName}
                          </div>
                          <button
                            onClick={() => handleToggleBlacklist(product.authorId, product.authorName, product.authorName)}
                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                              userBlacklistStatus[product.authorId]
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }`}
                          >
                            {userBlacklistStatus[product.authorId] ? '블랙리스트 해제' : '블랙리스트 추가'}
                          </button>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <a
                          href={product.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          상품 보기
                        </a>
                        <Link
                          href={`/edit/${product.id}`}
                          className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold text-blue-400"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold text-red-400"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 내 상품 없음 */}
          {activeTab === 'products' && products.length === 0 && (
            <div className="text-center py-20">
              <div className="glass inline-block p-8 rounded-2xl">
                <p className="text-gray-400 text-lg mb-4">등록한 상품이 없습니다</p>
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  상품 등록하기
                </button>
              </div>
            </div>
          )}

          {/* 즐겨찾기 목록 */}
          {activeTab === 'favorites' && favoriteProducts.length > 0 && (
            <div className="space-y-4">
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass glass-hover rounded-2xl p-4 md:p-6"
                >
                  {/* 모바일 레이아웃 */}
                  <div className="md:hidden space-y-3">
                    {/* 상단: 썸네일 + 배지 + 할인율 + 날짜 + 가격 */}
                    <div className="flex gap-3">
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            product.type === 'deal'
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                          }`}>
                            {product.type === 'deal' ? '검증' : '공구'}
                          </span>
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            {product.discountRate}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs text-gray-500 line-through">
                            {Math.floor(product.originalPrice).toLocaleString()}원
                          </div>
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {Math.floor(product.salePrice).toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-base font-bold line-clamp-2">{product.title}</h3>

                    {/* 작성자 */}
                    <div className="text-xs text-gray-500">
                      작성자: {product.authorName}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-center"
                      >
                        상품 보기
                      </a>
                      {product.isVerified && (
                        <button
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="flex-1 glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-purple-400"
                        >
                          리뷰 요약
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFavorite(product.id, product.title)}
                        className="glass glass-hover px-3 py-2 rounded-lg text-xs font-semibold text-red-400"
                        title="즐겨찾기 해제"
                      >
                        ❤️
                      </button>
                    </div>
                  </div>

                  {/* 데스크톱 레이아웃 */}
                  <div className="hidden md:flex gap-4">
                    {/* 이미지 */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{product.title}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.type === 'deal'
                              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                          }`}>
                            {product.type === 'deal' ? '검증 상품' : '공구 소식'}
                          </span>
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {product.discountRate}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-gray-400 line-through text-sm">
                          {Math.floor(product.originalPrice).toLocaleString()}원
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {Math.floor(product.salePrice).toLocaleString()}원
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 mb-4">
                        작성자: {product.authorName}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <a
                          href={product.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          상품 보기
                        </a>
                        {product.isVerified && (
                          <button
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold text-purple-400"
                          >
                            리뷰 요약
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveFavorite(product.id, product.title)}
                          className="glass glass-hover px-4 py-2 rounded-lg text-sm font-semibold text-red-400"
                          title="즐겨찾기 해제"
                        >
                          ❤️
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 즐겨찾기 없음 */}
          {activeTab === 'favorites' && favoriteProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="glass inline-block p-8 rounded-2xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-400 text-lg mb-4">즐겨찾기한 상품이 없습니다</p>
                <p className="text-gray-500 text-sm mb-6">마음에 드는 상품의 하트 아이콘을 눌러 즐겨찾기에 추가해보세요</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                >
                  상품 둘러보기
                </button>
              </div>
            </div>
          )}

          {/* 키워드 알림 설정 */}
          {activeTab === 'keywords' && (
            <div>
              {/* 키워드 추가 폼 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <h3 className="text-xl font-bold mb-4">새 키워드 추가</h3>
                <p className="text-gray-400 text-sm mb-4">
                  등록한 키워드가 포함된 상품이 등록되면 이메일로 알림을 보내드립니다.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    className="flex-1 glass px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="예: 노트북, 에어팟, 스마트폰 등"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    추가
                  </button>
                </div>
              </motion.div>

              {/* 등록된 키워드 목록 */}
              {keywords.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold mb-4">등록된 키워드 ({keywords.length})</h3>
                  <div className="flex flex-wrap gap-3">
                    {keywords.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass px-4 py-2 rounded-full flex items-center gap-2 group"
                      >
                        <span className="text-sm font-semibold">{keyword}</span>
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <div className="glass inline-block p-8 rounded-2xl">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-400 text-lg mb-4">등록된 키워드가 없습니다</p>
                    <p className="text-gray-500 text-sm">
                      위 입력창에서 관심 키워드를 추가해보세요
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 관심사 카테고리 설정 */}
          {activeTab === 'interests' && (
            <div>
              {/* 안내 메시지 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
              >
                <h3 className="text-xl font-bold mb-2">관심사 카테고리 선택</h3>
                <p className="text-gray-400 text-sm">
                  관심 있는 카테고리를 선택하면 메인 페이지에서 맞춤형 추천 상품을 우선적으로 보여드립니다.
                </p>
              </motion.div>

              {/* 카테고리 그리드 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4"
              >
                {CATEGORIES.map((category, index) => {
                  const isSelected = interests.includes(category);
                  return (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleToggleInterest(category)}
                      className={`p-4 rounded-xl font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 scale-105'
                          : 'glass glass-hover'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isSelected && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{category}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* 선택된 관심사 요약 */}
              {interests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass rounded-2xl p-6 mt-6"
                >
                  <h3 className="text-lg font-bold mb-3">
                    선택한 관심사 ({interests.length}개)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 px-3 py-1.5 rounded-full text-sm font-semibold"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 정보 박스 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6"
              >
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-blue-400 mb-1">맞춤 추천 안내</p>
                    <ul className="space-y-1 text-gray-400">
                      <li>• 선택한 카테고리의 상품이 메인 페이지에서 우선 노출됩니다</li>
                      <li>• 인기도(조회수, 클릭수, 즐겨찾기)와 결합되어 최적의 추천을 제공합니다</li>
                      <li>• 언제든지 관심사를 변경할 수 있습니다</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 max-w-md mx-4"
            >
              <h3 className="text-2xl font-bold mb-4">상품 삭제</h3>
              <p className="text-gray-400 mb-6">
                정말로 이 상품을 삭제하시겠습니까?
                <br />
                삭제된 상품은 복구할 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 glass glass-hover py-3 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 py-3 rounded-lg font-bold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-red-500/50"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 회원 탈퇴 확인 모달 */}
        {showWithdrawConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 max-w-md mx-4"
            >
              <h3 className="text-2xl font-bold mb-4 text-red-400">회원 탈퇴</h3>
              <div className="text-gray-400 mb-6 space-y-2">
                <p className="font-semibold">정말로 탈퇴하시겠습니까?</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
                  <p className="text-red-400 font-semibold mb-2">⚠️ 주의사항</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>등록한 모든 상품이 삭제됩니다</li>
                    <li>계정 정보는 복구할 수 없습니다</li>
                    <li>동일한 이메일로 재가입이 가능합니다</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleWithdrawCancel}
                  className="flex-1 glass glass-hover py-3 rounded-lg font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleWithdrawConfirm}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 py-3 rounded-lg font-bold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-red-500/50"
                >
                  탈퇴하기
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 신고 내역 모달 */}
        {showReportDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowReportDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">신고 내역</h3>
                  <p className="text-sm text-gray-400">
                    총 {selectedProductReports.length}건의 신고
                  </p>
                </div>
                <button
                  onClick={() => setShowReportDetails(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 신고 목록 */}
              <div className="space-y-3 mb-6">
                {selectedProductReports.map((report, index) => (
                  <div
                    key={index}
                    className="glass rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold">{report.userName}</div>
                        <div className="text-xs text-gray-400">{report.userEmail}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.reportedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 bg-gray-900/30 rounded p-3 mt-2">
                      {report.reason}
                    </div>
                  </div>
                ))}
              </div>

              {/* 액션 버튼 */}
              {user?.role === 'admin' && (
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowReportDetails(null)}
                    className="flex-1 glass glass-hover px-4 py-3 rounded-lg font-semibold"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => handleDismissReports(showReportDetails)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    신고 해제
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </SimpleLayout>
  );
}

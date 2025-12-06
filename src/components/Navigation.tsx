'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isBlacklisted: boolean;
  profileCompleted: boolean;
  suppressProfilePopup: boolean;
}

export default function Navigation() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Fetch user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('로그아웃되었습니다', 'success');
      setUser(null);
      setDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      showToast('로그아웃 중 오류가 발생했습니다', 'error');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              마켓플레이스 딜
            </span>
          </Link>

          {/* 네비게이션 버튼들 */}
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="glass px-4 py-2 rounded-full glass-hover inline-flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span className="font-semibold">업로드</span>
            </Link>

            {loading ? (
              <div className="glass px-6 py-2 rounded-full">
                <span className="font-semibold text-gray-400">...</span>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="glass px-6 py-2 rounded-full glass-hover inline-flex items-center gap-2"
                >
                  <span className="font-semibold">{user.email}</span>
                  <span className="text-sm">▾</span>
                </button>

                {dropdownOpen && (
                  <>
                    {/* 백드롭 */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    ></div>

                    {/* 드롭다운 메뉴 */}
                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden z-50 border border-white/20">
                      <Link
                        href={user.isAdmin ? '/admin' : '/mypage'}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-white/10 transition-colors"
                      >
                        <span className="font-semibold">
                          {user.isAdmin ? '🛠️ 관리자 페이지' : '👤 마이페이지'}
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
                      >
                        <span className="font-semibold text-red-400">🚪 로그아웃</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="glass px-6 py-2 rounded-full glass-hover">
                <span className="font-semibold">로그인</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

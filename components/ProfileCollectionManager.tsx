'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import ProfileCollectionModal from './ProfileCollectionModal';
import type { User } from '@/lib/types';
import type { UserProfile } from '@/lib/types/profile';

/**
 * 프로필 수집 팝업 관리 컴포넌트
 * - 로그인 후 shouldShowProfilePopup이 true이면 팝업 표시
 * - 사용자의 결정에 따라 팝업 동작 제어
 */
export default function ProfileCollectionManager() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAndShowPopup();

    // auth-change 이벤트 리스너
    const handleAuthChange = () => {
      checkAndShowPopup();
    };

    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const checkAndShowPopup = async () => {
    setIsChecking(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      // shouldShowProfilePopup이 true이면 팝업 표시
      if (currentUser?.shouldShowProfilePopup) {
        // 페이지 로드 후 약간의 딜레이 (UX 개선)
        setTimeout(() => {
          setShowModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to check profile popup:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (profile: UserProfile) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // 성공 메시지 (선택적)
      alert('프로필이 저장되었습니다! 맞춤형 추천을 받을 수 있습니다.');

      // 팝업 닫기
      setShowModal(false);

      // 사용자 정보 갱신
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLater = async () => {
    // 결정 API 호출 (LATER)
    try {
      await fetch('/api/user/profile-popup-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ decision: 'LATER' }),
      });

      setShowModal(false);
    } catch (error) {
      console.error('Failed to record decision:', error);
      setShowModal(false);
    }
  };

  const handleNeverShowAgain = async () => {
    // 결정 API 호출 (NEVER_SHOW_AGAIN)
    try {
      const response = await fetch('/api/user/profile-popup-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ decision: 'NEVER_SHOW_AGAIN' }),
      });

      if (!response.ok) {
        throw new Error('Failed to record decision');
      }

      alert('프로필 팝업이 더 이상 표시되지 않습니다. 마이페이지에서 언제든지 수정할 수 있습니다.');
      setShowModal(false);

      // 사용자 정보 갱신
      window.dispatchEvent(new Event('auth-change'));
    } catch (error) {
      console.error('Failed to record decision:', error);
      setShowModal(false);
    }
  };

  const handleClose = () => {
    // 팝업 강제 유지 (나중에 하기 또는 다시 보지 않기 버튼으로만 닫을 수 있음)
    // setShowModal(false);
  };

  if (isChecking || !user) {
    return null;
  }

  return (
    <ProfileCollectionModal
      isOpen={showModal}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onLater={handleLater}
      onNeverShowAgain={handleNeverShowAgain}
    />
  );
}

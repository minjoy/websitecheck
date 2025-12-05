import { User } from './types';

// API 기반 인증 시스템
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const authService = {
  // 현재 로그인한 사용자 가져오기
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // 401은 정상적인 로그아웃 상태이므로 에러 로그 출력 안함
        if (response.status !== 401) {
          console.error('Get current user error:', response.status);
        }
        return null;
      }

      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // 로그인
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '로그인에 실패했습니다.' };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          createdAt: data.user.createdAt,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '서버 연결에 실패했습니다.' };
    }
  },

  // 회원가입
  async signup(email: string, name: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || '회원가입에 실패했습니다.' };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          createdAt: data.user.createdAt,
        }
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: '서버 연결에 실패했습니다.' };
    }
  },

  // 로그아웃
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // 관리자 여부 확인
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  },

  // 회원 탈퇴
  async deleteAccount(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'DELETE',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    }
  },

  // 비밀번호 재설정 (향후 구현)
  async resetPassword(_email: string, _newPassword: string): Promise<{ success: boolean; error?: string }> {
    // TODO: 비밀번호 재설정 API 구현 후 연동
    console.warn('비밀번호 재설정 기능은 아직 구현되지 않았습니다.');
    return { success: false, error: '이 기능은 곧 제공될 예정입니다.' };
  },

  // 이메일 존재 여부 확인 (향후 구현)
  async emailExists(_email: string): Promise<boolean> {
    // TODO: 이메일 체크 API 구현 후 연동
    // 현재는 회원가입 시도로 확인
    return false;
  },
};

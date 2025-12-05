import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, JWTPayload } from '@/lib/authUtils';

/**
 * 인증 필요 - 로그인된 사용자만 접근 가능
 */
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getCurrentUserFromRequest(request);

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

/**
 * 관리자 권한 필요 - 관리자만 접근 가능
 */
export function requireAdmin(request: NextRequest): JWTPayload {
  const user = getCurrentUserFromRequest(request);

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * 에러 응답 생성 헬퍼
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json(
        { error: '권한이 없습니다' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: '서버 에러가 발생했습니다' },
    { status: 500 }
  );
}

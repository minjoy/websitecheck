import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/authUtils';

export async function POST(_request: NextRequest) {
  try {
    // 쿠키 삭제
    await clearAuthCookie();

    return NextResponse.json({
      message: '로그아웃되었습니다',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}

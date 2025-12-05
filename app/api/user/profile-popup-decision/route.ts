import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';
import type { PopupDecision } from '@/lib/types/profile';

/**
 * POST /api/user/profile-popup-decision
 * 프로필 팝업에 대한 사용자 결정 처리
 *
 * - LATER: 다음에 다시 보기 (아무 동작 안 함)
 * - NEVER_SHOW_AGAIN: 다시 보지 않기 (suppress_profile_popup = 1)
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const body = await request.json();
    const decision = body.decision as PopupDecision;

    if (!decision || !['LATER', 'NEVER_SHOW_AGAIN'].includes(decision)) {
      return NextResponse.json(
        { error: '유효하지 않은 결정입니다' },
        { status: 400 }
      );
    }

    if (decision === 'NEVER_SHOW_AGAIN') {
      // suppress_profile_popup = 1 로 설정
      await db.query(
        'UPDATE users SET suppress_profile_popup = 1 WHERE id = ?',
        [currentUser.userId]
      );

      return NextResponse.json({
        message: '프로필 팝업을 더 이상 표시하지 않습니다',
        decision: 'NEVER_SHOW_AGAIN',
      });
    }

    // LATER: 로깅만 하고 아무 것도 변경하지 않음
    return NextResponse.json({
      message: '다음에 다시 표시합니다',
      decision: 'LATER',
    });
  } catch (error) {
    console.error('Profile popup decision error:', error);
    return createErrorResponse(error);
  }
}

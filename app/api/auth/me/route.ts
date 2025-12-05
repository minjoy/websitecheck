import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';
import { clearAuthCookie } from '@/lib/authUtils';

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    // DB에서 최신 사용자 정보 조회 (프로필 정보 포함)
    const [users] = await db.query(
      `SELECT
        id, email, name, role, created_at,
        gender, age_group, life_stage, residence_type, region_type, income_level,
        job_industry, job_role, work_style, daily_pattern,
        profile_completed_at, suppress_profile_popup
       FROM users WHERE id = ?`,
      [currentUser.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    interface UserRow {
      id: string;
      email: string;
      name: string;
      role: string;
      created_at: string;
      gender: string | null;
      age_group: string | null;
      life_stage: string | null;
      residence_type: string | null;
      region_type: string | null;
      income_level: string | null;
      job_industry: string | null;
      job_role: string | null;
      work_style: string | null;
      daily_pattern: string | null;
      profile_completed_at: string | null;
      suppress_profile_popup: number;
    }
    const user = users[0] as UserRow;

    // 프로필 팝업 노출 여부 계산
    const shouldShowProfilePopup =
      user.profile_completed_at === null &&
      user.suppress_profile_popup === 0;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      // 프로필 정보
      gender: user.gender || null,
      ageGroup: user.age_group || null,
      lifeStage: user.life_stage || null,
      residenceType: user.residence_type || null,
      regionType: user.region_type || null,
      incomeLevel: user.income_level || null,
      jobIndustry: user.job_industry || null,
      jobRole: user.job_role || null,
      workStyle: user.work_style || null,
      dailyPattern: user.daily_pattern || null,
      profileCompletedAt: user.profile_completed_at || null,
      suppressProfilePopup: user.suppress_profile_popup === 1,
      // 팝업 노출 여부
      shouldShowProfilePopup,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/auth/me
 * 회원 탈퇴
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    // 사용자 삭제 (CASCADE로 관련 데이터도 삭제됨)
    await db.query('DELETE FROM users WHERE id = ?', [currentUser.userId]);

    // 쿠키 삭제
    await clearAuthCookie();

    return NextResponse.json({
      message: '회원 탈퇴가 완료되었습니다',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return createErrorResponse(error);
  }
}

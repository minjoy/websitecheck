import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';
import type { UserProfile } from '@/lib/types/profile';

interface ProfileRow {
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

/**
 * GET /api/user/profile
 * 현재 사용자의 프로필 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const [users] = await db.query(
      `SELECT
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

    const user = users[0] as ProfileRow;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return createErrorResponse(error);
  }
}

/**
 * POST /api/user/profile
 * 사용자 프로필 정보 저장/업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const body = await request.json() as UserProfile;

    // 프로필 업데이트 쿼리
    await db.query(
      `UPDATE users SET
        gender = ?,
        age_group = ?,
        life_stage = ?,
        residence_type = ?,
        region_type = ?,
        income_level = ?,
        job_industry = ?,
        job_role = ?,
        work_style = ?,
        daily_pattern = ?,
        profile_completed_at = NOW()
       WHERE id = ?`,
      [
        body.gender || null,
        body.ageGroup || null,
        body.lifeStage || null,
        body.residenceType || null,
        body.regionType || null,
        body.incomeLevel || null,
        body.jobIndustry || null,
        body.jobRole || null,
        body.workStyle || null,
        body.dailyPattern || null,
        currentUser.userId,
      ]
    );

    // 업데이트된 프로필 반환
    const [users] = await db.query(
      `SELECT
        gender, age_group, life_stage, residence_type, region_type, income_level,
        job_industry, job_role, work_style, daily_pattern,
        profile_completed_at, suppress_profile_popup
       FROM users WHERE id = ?`,
      [currentUser.userId]
    );

    const user = (users as ProfileRow[])[0];

    return NextResponse.json({
      message: '프로필이 저장되었습니다',
      profile: {
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
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return createErrorResponse(error);
  }
}

/**
 * PUT /api/user/profile
 * 마이페이지에서 프로필 수정 (POST와 동일하지만 명시적으로 구분)
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const body = await request.json() as UserProfile;

    // 기존 profile_completed_at 확인
    const [users] = await db.query(
      'SELECT profile_completed_at FROM users WHERE id = ?',
      [currentUser.userId]
    );

    const existingUser = (users as { profile_completed_at: string | null }[])[0];
    const shouldSetCompletedAt = !existingUser.profile_completed_at;

    // 프로필 업데이트
    await db.query(
      `UPDATE users SET
        gender = ?,
        age_group = ?,
        life_stage = ?,
        residence_type = ?,
        region_type = ?,
        income_level = ?,
        job_industry = ?,
        job_role = ?,
        work_style = ?,
        daily_pattern = ?
        ${shouldSetCompletedAt ? ', profile_completed_at = NOW()' : ''}
       WHERE id = ?`,
      [
        body.gender || null,
        body.ageGroup || null,
        body.lifeStage || null,
        body.residenceType || null,
        body.regionType || null,
        body.incomeLevel || null,
        body.jobIndustry || null,
        body.jobRole || null,
        body.workStyle || null,
        body.dailyPattern || null,
        currentUser.userId,
      ]
    );

    return NextResponse.json({
      message: '프로필이 수정되었습니다',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return createErrorResponse(error);
  }
}

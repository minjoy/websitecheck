import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    const {
      gender,
      ageGroup,
      lifeStage,
      residenceType,
      regionType,
      incomeLevel,
      jobIndustry,
      jobRole,
      workStyle,
      dailyPattern,
      suppressPopup,
    } = await request.json();

    // 사용자 프로필 업데이트
    await prisma.user.update({
      where: { id: BigInt(payload.userId) },
      data: {
        gender: gender || null,
        ageGroup: ageGroup || null,
        lifeStage: lifeStage || null,
        residenceType: residenceType || null,
        regionType: regionType || null,
        incomeLevel: incomeLevel || null,
        jobIndustry: jobIndustry || null,
        jobRole: jobRole || null,
        workStyle: workStyle || null,
        dailyPattern: dailyPattern || null,
        profileCompletedAt: new Date(),
        suppressProfilePopup: suppressPopup || false,
      },
    });

    return NextResponse.json({
      message: '라이프스타일 정보가 저장되었습니다',
    });
  } catch (error) {
    console.error('Update lifestyle error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
      select: {
        gender: true,
        ageGroup: true,
        lifeStage: true,
        residenceType: true,
        regionType: true,
        incomeLevel: true,
        jobIndustry: true,
        jobRole: true,
        workStyle: true,
        dailyPattern: true,
        profileCompletedAt: true,
        suppressProfilePopup: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error('Get lifestyle error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

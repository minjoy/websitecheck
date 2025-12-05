import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/keywords
 * 키워드 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);

    const [keywords] = await db.query(
      'SELECT keyword FROM keyword_alerts WHERE user_id = ? ORDER BY created_at DESC',
      [currentUser.userId]
    );

    const keywordList = (keywords as Record<string, unknown>[]).map(k => k.keyword);

    return NextResponse.json({ keywords: keywordList });
  } catch (error) {
    console.error('Get keywords error:', error);
    return createErrorResponse(error);
  }
}

/**
 * POST /api/keywords
 * 키워드 추가
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = requireAuth(request);
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요' },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();

    // 이미 등록된 키워드인지 확인
    const [existing] = await db.query(
      'SELECT id FROM keyword_alerts WHERE user_id = ? AND keyword = ?',
      [currentUser.userId, trimmedKeyword]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: '이미 등록된 키워드입니다' },
        { status: 400 }
      );
    }

    // 키워드 추가
    const [result] = await db.query(
      'INSERT INTO keyword_alerts (user_id, keyword, created_at) VALUES (?, ?, NOW())',
      [currentUser.userId, trimmedKeyword]
    );

    const insertId = (result as { insertId: number }).insertId;

    return NextResponse.json(
      {
        id: insertId,
        keyword: trimmedKeyword,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add keyword error:', error);
    return createErrorResponse(error);
  }
}

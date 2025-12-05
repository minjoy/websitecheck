import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin, createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/admin/blacklist
 * 블랙리스트 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const [blacklist] = await db.query(
      `SELECT
        id, user_id as userId, email, name, reason, created_at as createdAt
       FROM blacklist
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ blacklist });
  } catch (error) {
    console.error('Get blacklist error:', error);
    return createErrorResponse(error);
  }
}

/**
 * POST /api/admin/blacklist
 * 블랙리스트 추가 (관리자 전용)
 */
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { userId, reason } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const [users] = await db.query(
      'SELECT email, name FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const user = users[0] as { email: string; name: string };

    // 이미 블랙리스트에 있는지 확인
    const [existing] = await db.query(
      'SELECT id FROM blacklist WHERE user_id = ?',
      [userId]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: '이미 블랙리스트에 추가된 사용자입니다' },
        { status: 400 }
      );
    }

    // 블랙리스트 추가
    const [result] = await db.query(
      'INSERT INTO blacklist (user_id, email, name, reason, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, user.email, user.name, reason || null]
    );

    const insertId = (result as { insertId: number }).insertId;

    return NextResponse.json(
      {
        id: insertId,
        userId,
        email: user.email,
        name: user.name,
        reason: reason || null,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to blacklist error:', error);
    return createErrorResponse(error);
  }
}

/**
 * DELETE /api/admin/blacklist/:userId
 * 블랙리스트 해제 (관리자 전용)
 */
export async function DELETE(request: NextRequest) {
  try {
    requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 블랙리스트에서 제거
    const [result] = await db.query(
      'DELETE FROM blacklist WHERE user_id = ?',
      [userId]
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: '블랙리스트에서 사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '블랙리스트에서 제거되었습니다',
    });
  } catch (error) {
    console.error('Remove from blacklist error:', error);
    return createErrorResponse(error);
  }
}

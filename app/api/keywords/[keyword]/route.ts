import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth, createErrorResponse } from '@/lib/middleware/auth';

/**
 * DELETE /api/keywords/:keyword
 * 키워드 삭제
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ keyword: string }> }
) {
  try {
    const { keyword: keywordParam } = await context.params;
    const currentUser = requireAuth(request);
    const keyword = decodeURIComponent(keywordParam);

    // 키워드 삭제
    const [result] = await db.query(
      'DELETE FROM keyword_alerts WHERE user_id = ? AND keyword = ?',
      [currentUser.userId, keyword]
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: '키워드를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '키워드가 삭제되었습니다',
    });
  } catch (error) {
    console.error('Remove keyword error:', error);
    return createErrorResponse(error);
  }
}

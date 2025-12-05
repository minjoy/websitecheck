import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { createErrorResponse } from '@/lib/middleware/auth';

/**
 * GET /api/stats
 * 오늘의 통계 조회
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 테이블 존재 확인 및 생성
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        visitor_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 오늘 통계 조회
    const [stats] = await db.query(
      'SELECT visitor_count as visitorCount, view_count as viewCount FROM daily_stats WHERE date = ?',
      [today]
    );

    if (!Array.isArray(stats) || stats.length === 0) {
      // 오늘 통계가 없으면 생성
      await db.query(
        'INSERT INTO daily_stats (date, visitor_count, view_count) VALUES (?, 0, 0)',
        [today]
      );

      return NextResponse.json({
        visitorCount: 0,
        viewCount: 0,
        date: today,
      });
    }

    const stat = stats[0] as { visitorCount: number; viewCount: number };

    return NextResponse.json({
      visitorCount: stat.visitorCount,
      viewCount: stat.viewCount,
      date: today,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return createErrorResponse(error);
  }
}

/**
 * POST /api/stats
 * 통계 증가 (type: 'visitor' | 'view')
 */
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    if (type !== 'visitor' && type !== 'view') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "visitor" or "view"' },
        { status: 400 }
      );
    }

    // 테이블 존재 확인
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        visitor_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 오늘 통계가 있는지 확인
    const [existing] = await db.query(
      'SELECT id FROM daily_stats WHERE date = ?',
      [today]
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      // 없으면 생성
      await db.query(
        'INSERT INTO daily_stats (date, visitor_count, view_count) VALUES (?, 0, 0)',
        [today]
      );
    }

    // 통계 증가
    const column = type === 'visitor' ? 'visitor_count' : 'view_count';
    await db.query(
      `UPDATE daily_stats SET ${column} = ${column} + 1 WHERE date = ?`,
      [today]
    );

    // 업데이트된 통계 조회
    const [stats] = await db.query(
      'SELECT visitor_count as visitorCount, view_count as viewCount FROM daily_stats WHERE date = ?',
      [today]
    );

    const stat = (stats as { visitorCount: number; viewCount: number }[])[0];

    return NextResponse.json({
      visitorCount: stat.visitorCount,
      viewCount: stat.viewCount,
      date: today,
    });
  } catch (error) {
    console.error('Update stats error:', error);
    return createErrorResponse(error);
  }
}

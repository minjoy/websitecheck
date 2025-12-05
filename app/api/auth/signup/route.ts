import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/authUtils';
import { signupSchema } from '@/lib/validators/auth';
import { createErrorResponse } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유효성 검증
    const validatedData = signupSchema.parse(body);
    const { email, password, name } = validatedData;

    // 이메일 중복 체크
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다' },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const userId = uuidv4();
    await db.query(
      `INSERT INTO users (id, email, name, role, password, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, email, name, 'user', hashedPassword]
    );

    // JWT 토큰 생성
    const token = generateToken({
      userId,
      email,
      role: 'user',
    });

    // 쿠키 설정
    await setAuthCookie(token);

    // 응답
    return NextResponse.json(
      {
        user: {
          id: userId,
          email,
          name,
          role: 'user',
          createdAt: new Date().toISOString(),
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}

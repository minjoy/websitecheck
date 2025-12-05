import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/authUtils';
import { loginSchema } from '@/lib/validators/auth';
import { createErrorResponse } from '@/lib/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 유효성 검증
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // 사용자 조회
    const [users] = await db.query(
      'SELECT id, email, name, role, password FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      );
    }

    const user = users[0] as { id: string; email: string; name: string; role: 'admin' | 'user'; password: string };

    // 비밀번호 검증
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 쿠키 설정
    await setAuthCookie(token);

    // 응답 (비밀번호 제외)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}

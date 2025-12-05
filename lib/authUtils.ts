import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

/**
 * JWT 토큰 생성
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT 토큰 검증
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * 현재 로그인한 사용자 정보 가져오기 (서버 컴포넌트용)
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * 현재 로그인한 사용자 정보 가져오기 (API Routes용)
 */
export function getCurrentUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * 인증 쿠키 설정
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: true, // HTTPS 환경에서 보안 쿠키 사용
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * 인증 쿠키 삭제
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

/**
 * 비밀번호 해싱
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * 비밀번호 검증
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

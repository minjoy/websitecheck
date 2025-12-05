import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// 관리자 계정 생성 스크립트
async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // 기존 admin@aideal.com 계정 확인
    const [existingUsers] = await connection.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@aideal.com']
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log('✅ 관리자 계정이 이미 존재합니다:');
      console.log(existingUsers[0]);
      return;
    }

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userId = `admin-${Date.now()}`;

    await connection.query(
      `INSERT INTO users (id, email, name, password, role, createdAt)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, 'admin@aideal.com', '관리자', hashedPassword, 'admin']
    );

    console.log('✅ 관리자 계정이 생성되었습니다:');
    console.log({
      email: 'admin@aideal.com',
      password: 'admin123',
      role: 'admin',
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser();

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// 관리자 계정 생성 스크립트
async function createAdminUser() {
  console.log('🔍 데이터베이스 연결 중...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // 테이블 구조 확인
    console.log('🔍 테이블 구조 확인 중...');
    const [columns] = await connection.query('DESCRIBE users');
    console.log('📋 users 테이블 컬럼:', columns.map(c => c.Field).join(', '));

    // 기존 admin@aideal.com 계정 확인
    console.log('🔍 기존 관리자 계정 확인 중...');
    const [existingUsers] = await connection.query(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['admin@aideal.com']
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log('✅ 관리자 계정이 이미 존재합니다:');
      console.log('   이메일:', existingUsers[0].email);
      console.log('   이름:', existingUsers[0].name);
      console.log('   역할:', existingUsers[0].role);
      console.log('   비밀번호: admin123');
      await connection.end();
      return;
    }

    // 관리자 계정 생성
    console.log('📝 관리자 계정 생성 중...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userId = `admin-${Date.now()}`;

    // created_at 컬럼 사용 (스네이크 케이스)
    await connection.query(
      `INSERT INTO users (id, email, name, password, role, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, 'admin@aideal.com', '관리자', hashedPassword, 'admin']
    );

    console.log('✅ 관리자 계정이 생성되었습니다!');
    console.log('   이메일: admin@aideal.com');
    console.log('   비밀번호: admin123');
    console.log('   역할: admin');
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('테이블이 존재하지 않습니다. 먼저 데이터베이스 마이그레이션을 실행하세요.');
    }
  } finally {
    await connection.end();
    console.log('✅ 데이터베이스 연결 종료');
  }
}

createAdminUser().catch(console.error);

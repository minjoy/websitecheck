// RDS 연결 테스트 스크립트
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 RDS 연결 테스트 시작...\n');

  console.log('설정 정보:');
  console.log(`  - Host: ${process.env.DB_HOST}`);
  console.log(`  - Port: ${process.env.DB_PORT}`);
  console.log(`  - User: ${process.env.DB_USER}`);
  console.log(`  - Database: ${process.env.DB_NAME}`);
  console.log(`  - SSL: ${process.env.DB_SSL}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    console.log('✅ RDS 연결 성공!\n');

    // 테이블 확인
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 생성된 테이블:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    await connection.end();
    console.log('\n🎉 모든 테스트 통과!');
  } catch (error) {
    console.error('\n❌ 연결 실패:', error.message);
    console.error('\n문제 해결:');
    console.error('  1. .env.local 파일의 DB_HOST 확인');
    console.error('  2. RDS 보안 그룹에서 내 IP 허용 확인');
    console.error('  3. DB_USER, DB_PASSWORD 확인');
    process.exit(1);
  }
}

testConnection();

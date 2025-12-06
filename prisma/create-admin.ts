import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔐 관리자 계정 생성\n');

  const email = await question('관리자 이메일: ');
  const password = await question('비밀번호: ');

  if (!email || !password) {
    console.error('❌ 이메일과 비밀번호를 모두 입력해주세요.');
    process.exit(1);
  }

  // 기존 사용자 확인
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`\n⚠️  이메일 ${email}은 이미 존재합니다.`);
    const confirm = await question('관리자 권한으로 업데이트하시겠습니까? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('취소되었습니다.');
      process.exit(0);
    }

    // 기존 사용자를 관리자로 업데이트
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        isAdmin: true,
        emailVerified: true,
      },
    });

    console.log(`\n✅ ${updated.email}을(를) 관리자로 업데이트했습니다.`);
  } else {
    // 새 관리자 계정 생성
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        isAdmin: true,
        emailVerified: true,
      },
    });

    console.log(`\n✅ 관리자 계정이 생성되었습니다:`);
    console.log(`   이메일: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
  }

  rl.close();
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

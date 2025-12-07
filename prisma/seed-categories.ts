import { PrismaClient, KeywordType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories and keywords...');

  // 카테고리 데이터
  const categories = [
    {
      code: 'ELECTRONICS',
      name: '전자기기',
      keywords: [
        { keyword: '노트북', weight: 10, type: 'CORE' },
        { keyword: '갤럭시북', weight: 10, type: 'CORE' },
        { keyword: 'LG그램', weight: 10, type: 'CORE' },
        { keyword: '맥북', weight: 10, type: 'CORE' },
        { keyword: '아이패드', weight: 10, type: 'CORE' },
        { keyword: '태블릿', weight: 8, type: 'CORE' },
        { keyword: '스마트폰', weight: 8, type: 'CORE' },
        { keyword: '갤럭시', weight: 8, type: 'SECONDARY' },
        { keyword: '아이폰', weight: 8, type: 'SECONDARY' },
        { keyword: '헤드폰', weight: 6, type: 'SECONDARY' },
        { keyword: '이어폰', weight: 6, type: 'SECONDARY' },
        { keyword: '에어팟', weight: 8, type: 'SECONDARY' },
      ],
    },
    {
      code: 'HOME_APPLIANCE',
      name: '가전제품',
      keywords: [
        { keyword: '청소기', weight: 10, type: 'CORE' },
        { keyword: '다이슨', weight: 10, type: 'CORE' },
        { keyword: '에어컨', weight: 10, type: 'CORE' },
        { keyword: '공기청정기', weight: 10, type: 'CORE' },
        { keyword: '냉장고', weight: 10, type: 'CORE' },
        { keyword: '세탁기', weight: 10, type: 'CORE' },
        { keyword: 'TV', weight: 10, type: 'CORE' },
        { keyword: '올레드', weight: 8, type: 'SECONDARY' },
        { keyword: 'QLED', weight: 8, type: 'SECONDARY' },
        { keyword: '비스포크', weight: 8, type: 'SECONDARY' },
        { keyword: '전자레인지', weight: 6, type: 'SECONDARY' },
        { keyword: '커피머신', weight: 6, type: 'SECONDARY' },
      ],
    },
    {
      code: 'FURNITURE',
      name: '가구/인테리어',
      keywords: [
        { keyword: '책상', weight: 10, type: 'CORE' },
        { keyword: '의자', weight: 10, type: 'CORE' },
        { keyword: '소파', weight: 10, type: 'CORE' },
        { keyword: '침대', weight: 10, type: 'CORE' },
        { keyword: '매트리스', weight: 10, type: 'CORE' },
        { keyword: '수납장', weight: 8, type: 'SECONDARY' },
        { keyword: '서랍장', weight: 8, type: 'SECONDARY' },
        { keyword: '행거', weight: 6, type: 'SECONDARY' },
        { keyword: '선반', weight: 6, type: 'SECONDARY' },
      ],
    },
    {
      code: 'FASHION',
      name: '패션/의류',
      keywords: [
        { keyword: '패딩', weight: 10, type: 'CORE' },
        { keyword: '코트', weight: 10, type: 'CORE' },
        { keyword: '자켓', weight: 10, type: 'CORE' },
        { keyword: '청바지', weight: 8, type: 'CORE' },
        { keyword: '운동화', weight: 10, type: 'CORE' },
        { keyword: '나이키', weight: 8, type: 'SECONDARY' },
        { keyword: '아디다스', weight: 8, type: 'SECONDARY' },
        { keyword: '스니커즈', weight: 8, type: 'SECONDARY' },
        { keyword: '가방', weight: 8, type: 'SECONDARY' },
        { keyword: '백팩', weight: 6, type: 'SECONDARY' },
      ],
    },
    {
      code: 'BEAUTY',
      name: '뷰티/화장품',
      keywords: [
        { keyword: '스킨케어', weight: 10, type: 'CORE' },
        { keyword: '화장품', weight: 10, type: 'CORE' },
        { keyword: '세럼', weight: 8, type: 'CORE' },
        { keyword: '크림', weight: 8, type: 'CORE' },
        { keyword: '클렌징', weight: 8, type: 'CORE' },
        { keyword: '마스크팩', weight: 8, type: 'SECONDARY' },
        { keyword: '선크림', weight: 8, type: 'SECONDARY' },
        { keyword: '립스틱', weight: 6, type: 'SECONDARY' },
        { keyword: '향수', weight: 6, type: 'SECONDARY' },
      ],
    },
    {
      code: 'BABY',
      name: '유아/아동',
      keywords: [
        { keyword: '기저귀', weight: 10, type: 'CORE' },
        { keyword: '분유', weight: 10, type: 'CORE' },
        { keyword: '유모차', weight: 10, type: 'CORE' },
        { keyword: '카시트', weight: 10, type: 'CORE' },
        { keyword: '아기침대', weight: 10, type: 'CORE' },
        { keyword: '젖병', weight: 8, type: 'SECONDARY' },
        { keyword: '완구', weight: 8, type: 'SECONDARY' },
        { keyword: '장난감', weight: 8, type: 'SECONDARY' },
      ],
    },
    {
      code: 'FOOD',
      name: '식품/건강',
      keywords: [
        { keyword: '건강식품', weight: 10, type: 'CORE' },
        { keyword: '영양제', weight: 10, type: 'CORE' },
        { keyword: '비타민', weight: 10, type: 'CORE' },
        { keyword: '프로틴', weight: 8, type: 'CORE' },
        { keyword: '유산균', weight: 8, type: 'CORE' },
        { keyword: '오메가3', weight: 8, type: 'SECONDARY' },
        { keyword: '홍삼', weight: 8, type: 'SECONDARY' },
        { keyword: '간식', weight: 6, type: 'SECONDARY' },
      ],
    },
    {
      code: 'SPORTS',
      name: '스포츠/레저',
      keywords: [
        { keyword: '운동기구', weight: 10, type: 'CORE' },
        { keyword: '요가매트', weight: 10, type: 'CORE' },
        { keyword: '덤벨', weight: 8, type: 'CORE' },
        { keyword: '런닝머신', weight: 10, type: 'CORE' },
        { keyword: '사이클', weight: 8, type: 'CORE' },
        { keyword: '등산', weight: 6, type: 'SECONDARY' },
        { keyword: '캠핑', weight: 8, type: 'SECONDARY' },
        { keyword: '텐트', weight: 8, type: 'SECONDARY' },
      ],
    },
  ];

  for (const cat of categories) {
    // 카테고리 생성
    const category = await prisma.productCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name },
      create: {
        code: cat.code,
        name: cat.name,
        depth: 0,
        displayOrder: 0,
      },
    });

    console.log(`✓ Category: ${cat.name}`);

    // 기존 키워드 삭제
    await prisma.categoryKeyword.deleteMany({
      where: { categoryId: category.id },
    });

    // 키워드 생성
    for (const kw of cat.keywords) {
      await prisma.categoryKeyword.create({
        data: {
          categoryId: category.id,
          keyword: kw.keyword,
          weight: kw.weight,
          keywordType: kw.type as KeywordType,
        },
      });
    }

    console.log(`  ✓ ${cat.keywords.length} keywords added`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

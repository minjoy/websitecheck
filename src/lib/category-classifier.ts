import prisma from '@/lib/prisma';

/**
 * 상품명을 분석하여 카테고리를 자동으로 분류합니다
 */
export async function classifyProduct(productId: bigint, title: string) {
  try {
    // 1. 모든 카테고리와 키워드 가져오기
    const categories = await prisma.productCategory.findMany({
      include: {
        categoryKeywords: true,
      },
    });

    // 2. 상품명을 공백과 특수문자로 분리
    const words = title
      .toLowerCase()
      .replace(/[^가-힣a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // 3. 각 카테고리별 점수 계산
    const categoryScores: { categoryId: bigint; score: number }[] = [];

    for (const category of categories) {
      let score = 0;

      for (const keyword of category.categoryKeywords) {
        const keywordLower = keyword.keyword.toLowerCase();

        // 정확히 일치하는 단어가 있는지 확인
        if (words.includes(keywordLower)) {
          score += keyword.weight;
        }

        // 부분 일치 확인 (상품명 전체에서)
        if (title.toLowerCase().includes(keywordLower)) {
          score += keyword.weight * 0.5;
        }
      }

      if (score > 0) {
        categoryScores.push({
          categoryId: category.id,
          score,
        });
      }
    }

    // 4. 점수순으로 정렬
    categoryScores.sort((a, b) => b.score - a.score);

    // 5. 상위 3개 카테고리에 매핑 (점수가 있는 경우만)
    const topCategories = categoryScores.slice(0, 3);

    // 기존 매핑 삭제
    await prisma.productCategoryMap.deleteMany({
      where: { productId },
    });

    // 새 매핑 생성
    for (let i = 0; i < topCategories.length; i++) {
      await prisma.productCategoryMap.create({
        data: {
          productId,
          categoryId: topCategories[i].categoryId,
          score: topCategories[i].score,
          isPrimary: i === 0, // 첫 번째 카테고리를 주 카테고리로
          isSuggested: true,
        },
      });
    }

    return {
      success: true,
      categoriesCount: topCategories.length,
      primaryCategory: topCategories[0]?.categoryId,
    };
  } catch (error) {
    console.error('Category classification error:', error);
    return {
      success: false,
      error: 'Failed to classify product',
    };
  }
}

/**
 * 사용자의 라이프스타일 기반으로 카테고리 가중치 계산
 */
export async function calculateUserCategoryWeights(userId: bigint) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 카테고리별 기본 가중치 (라이프스타일 기반)
    const categoryWeights: Record<string, number> = {};

    // 가족 형태에 따른 가중치
    if (user.lifeStage === 'PARENTS_BABY_0_3' || user.lifeStage === 'PARENTS_CHILD_4_7') {
      categoryWeights['BABY'] = 10;
      categoryWeights['HOME_APPLIANCE'] = 8;
    } else if (user.lifeStage === 'SINGLE') {
      categoryWeights['ELECTRONICS'] = 10;
      categoryWeights['FASHION'] = 8;
    } else if (user.lifeStage === 'COUPLE_NO_CHILD') {
      categoryWeights['FURNITURE'] = 8;
      categoryWeights['HOME_APPLIANCE'] = 8;
    }

    // 주거 형태에 따른 가중치
    if (user.residenceType === 'APARTMENT') {
      categoryWeights['HOME_APPLIANCE'] = (categoryWeights['HOME_APPLIANCE'] || 0) + 5;
      categoryWeights['FURNITURE'] = (categoryWeights['FURNITURE'] || 0) + 5;
    } else if (user.residenceType === 'ONE_ROOM') {
      categoryWeights['ELECTRONICS'] = (categoryWeights['ELECTRONICS'] || 0) + 5;
    }

    // 직업에 따른 가중치
    if (user.jobIndustry === 'IT_DEV') {
      categoryWeights['ELECTRONICS'] = (categoryWeights['ELECTRONICS'] || 0) + 8;
    } else if (user.jobIndustry === 'HOME_MAKER') {
      categoryWeights['HOME_APPLIANCE'] = (categoryWeights['HOME_APPLIANCE'] || 0) + 8;
      categoryWeights['FOOD'] = (categoryWeights['FOOD'] || 0) + 6;
    }

    // 근무 형태에 따른 가중치
    if (user.workStyle === 'FULL_REMOTE') {
      categoryWeights['FURNITURE'] = (categoryWeights['FURNITURE'] || 0) + 6;
      categoryWeights['ELECTRONICS'] = (categoryWeights['ELECTRONICS'] || 0) + 4;
    }

    // DB에 가중치 저장
    const categories = await prisma.productCategory.findMany();

    for (const category of categories) {
      const weight = categoryWeights[category.code] || 1;

      await prisma.userCategoryWeight.upsert({
        where: {
          userId_categoryId: {
            userId,
            categoryId: category.id,
          },
        },
        update: {
          weight,
          lastCalculatedAt: new Date(),
        },
        create: {
          userId,
          categoryId: category.id,
          weight,
        },
      });
    }

    return { success: true, weightsCount: Object.keys(categoryWeights).length };
  } catch (error) {
    console.error('Calculate weights error:', error);
    return { success: false, error: 'Failed to calculate weights' };
  }
}

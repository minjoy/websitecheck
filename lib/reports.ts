// 상품 신고 시스템
// localStorage 기반으로 신고 정보 관리

export interface Report {
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  reportedAt: string; // ISO date string
}

const REPORTS_STORAGE_KEY = 'product_reports';
const REPORT_THRESHOLD = 3; // 3회 이상 신고시 노출 중지

// 모든 신고 내역 가져오기
function getAllReports(): Report[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(REPORTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load reports:', error);
    return [];
  }
}

// 신고 내역 저장
function saveReports(reports: Report[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    // 신고 변경 이벤트 발생
    window.dispatchEvent(new Event('reports-change'));
  } catch (error) {
    console.error('Failed to save reports:', error);
  }
}

// 상품 신고하기
export function reportProduct(
  productId: string,
  userId: string,
  userName: string,
  userEmail: string,
  reason: string
): { success: boolean; error?: string; reportCount?: number } {
  const reports = getAllReports();

  // 이미 신고한 사용자인지 확인
  const alreadyReported = reports.some(
    r => r.productId === productId && r.userId === userId
  );

  if (alreadyReported) {
    return {
      success: false,
      error: '이미 신고한 상품입니다'
    };
  }

  // 새 신고 추가
  const newReport: Report = {
    productId,
    userId,
    userName,
    userEmail,
    reason,
    reportedAt: new Date().toISOString()
  };

  reports.push(newReport);
  saveReports(reports);

  const reportCount = getReportCount(productId);

  return {
    success: true,
    reportCount
  };
}

// 특정 상품의 신고 횟수 가져오기
export function getReportCount(productId: string): number {
  const reports = getAllReports();
  return reports.filter(r => r.productId === productId).length;
}

// 특정 상품의 신고자 목록 가져오기
export function getReporters(productId: string): Report[] {
  const reports = getAllReports();
  return reports
    .filter(r => r.productId === productId)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

// 상품이 신고 임계값을 넘었는지 확인 (3회 이상)
export function isProductHidden(productId: string): boolean {
  return getReportCount(productId) >= REPORT_THRESHOLD;
}

// 사용자가 특정 상품을 신고했는지 확인
export function hasUserReported(productId: string, userId: string): boolean {
  const reports = getAllReports();
  return reports.some(r => r.productId === productId && r.userId === userId);
}

// 관리자용: 모든 신고된 상품 목록 가져오기
export function getAllReportedProducts(): Array<{
  productId: string;
  reportCount: number;
  latestReport: string;
}> {
  const reports = getAllReports();
  const productMap = new Map<string, Report[]>();

  // 상품별로 신고 그룹화
  reports.forEach(report => {
    const existing = productMap.get(report.productId) || [];
    existing.push(report);
    productMap.set(report.productId, existing);
  });

  // 신고 횟수와 최신 신고 시간 추출
  return Array.from(productMap.entries()).map(([productId, productReports]) => ({
    productId,
    reportCount: productReports.length,
    latestReport: productReports.sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    )[0].reportedAt
  }));
}

// 관리자용: 특정 상품의 신고 삭제/해제
export function dismissReports(productId: string): void {
  const reports = getAllReports();
  const filtered = reports.filter(r => r.productId !== productId);
  saveReports(filtered);
}

// 상품 목록에서 신고된 상품 필터링 (3회 이상 신고된 상품 제외)
export function filterHiddenProducts<T extends { id: string }>(
  products: T[]
): T[] {
  return products.filter(product => !isProductHidden(product.id));
}

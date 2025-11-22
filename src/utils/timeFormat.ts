/**
 * 상대 시간 포맷 유틸리티
 * "방금 전", "5분 전", "2시간 전", "3일 전" 등의 형식으로 반환
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '방금 전';
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks}주 전`;
  } else if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months}개월 전`;
  } else {
    const years = Math.floor(diffDay / 365);
    return `${years}년 전`;
  }
};

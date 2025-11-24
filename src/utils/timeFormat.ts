import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 상대 시간 포맷 유틸리티
 * "방금 전", "5분 전", "2시간 전", "3일 전" 등의 형식으로 반환
 */
export const getRelativeTime = (dateString: string): string => {
  const target = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);

  // 1분 미만은 "방금 전"
  if (diffSec < 60) {
    return '방금 전';
  }

  // date-fns의 formatDistanceToNow 사용
  return formatDistanceToNow(target, {
    addSuffix: true,
    locale: ko
  });
};

/**
 * 채팅 메시지 시간 포맷 유틸리티
 * 오늘: "오후 1:33"
 * 어제: "어제 오후 1:33"
 * 그 외: "2024.01.15 오후 1:33"
 */
export const formatChatTime = (dateString: string): string => {
  try {
    const target = new Date(dateString);

    // 유효하지 않은 날짜 체크
    if (isNaN(target.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }

    const hours = target.getHours();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(target.getMinutes()).padStart(2, '0');
    const timeStr = `${period} ${displayHours}:${displayMinutes}`;

    if (isToday(target)) {
      return timeStr;
    } else if (isYesterday(target)) {
      return `어제 ${timeStr}`;
    } else {
      const year = target.getFullYear();
      const month = String(target.getMonth() + 1).padStart(2, '0');
      const day = String(target.getDate()).padStart(2, '0');
      return `${year}.${month}.${day} ${timeStr}`;
    }
  } catch (error) {
    console.error('Error formatting chat time:', error);
    return '';
  }
};

/**
 * 날짜 구분선용 포맷 유틸리티
 * 오늘: "오늘"
 * 어제: "어제"
 * 그 외: "2025년 1월 15일 수요일"
 */
export const formatDateSeparator = (dateString: string): string => {
  try {
    const target = new Date(dateString);

    // 유효하지 않은 날짜 체크
    if (isNaN(target.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }

    if (isToday(target)) {
      return '오늘';
    } else if (isYesterday(target)) {
      return '어제';
    } else {
      return format(target, 'yyyy년 M월 d일 EEEE', { locale: ko });
    }
  } catch (error) {
    console.error('Error formatting date separator:', error);
    return '';
  }
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};

import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 서버 시간을 브라우저 로컬 시간으로 변환
 * 서버에서 보낸 시간 문자열을 그대로 Date 객체로 변환하여 사용
 */
const toKoreanTime = (dateString: string): Date => {
  // Date 객체는 자동으로 로컬 시간대를 고려하여 표시
  // 서버에서 UTC나 다른 시간대로 보내더라도 브라우저가 자동 변환
  return new Date(dateString);
};

/**
 * 상대 시간 포맷 유틸리티
 * "방금 전", "5분 전", "2시간 전", "3일 전" 등의 형식으로 반환
 */
export const getRelativeTime = (dateString: string): string => {
  const target = toKoreanTime(dateString);
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
 * 채팅 메시지 시간 포맷 유틸리티 (한국 시간 기준)
 * 오늘: "오후 1:33"
 * 어제: "어제 오후 1:33"
 * 그 외: "2024.01.15 오후 1:33"
 */
export const formatChatTime = (dateString: string): string => {
  try {
    // 한국 시간으로 변환
    const target = toKoreanTime(dateString);

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
 * 날짜 구분선용 포맷 유틸리티 (한국 시간 기준)
 * 오늘: "오늘"
 * 어제: "어제"
 * 그 외: "2025년 1월 15일 수요일"
 */
export const formatDateSeparator = (dateString: string): string => {
  try {
    // 한국 시간으로 변환
    const target = toKoreanTime(dateString);

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
 * 두 날짜가 같은 날인지 확인 (한국 시간 기준)
 */
export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  try {
    // 문자열인 경우 한국 시간으로 변환
    const d1 = typeof date1 === 'string' ? toKoreanTime(date1) : date1;
    const d2 = typeof date2 === 'string' ? toKoreanTime(date2) : date2;

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

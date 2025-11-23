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
  const target = new Date(dateString);

  const hours = target.getHours();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const displayMinutes = format(target, 'mm');
  const timeStr = `${period} ${displayHours}:${displayMinutes}`;

  if (isToday(target)) {
    return timeStr;
  } else if (isYesterday(target)) {
    return `어제 ${timeStr}`;
  } else {
    return `${format(target, 'yyyy.MM.dd')} ${timeStr}`;
  }
};

import { format, parseISO, isValid } from 'date-fns';

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return dateString;
    }
    const dayOfWeek = dayNames[date.getDay()];
    return format(date, `M月d日(${dayOfWeek})`);
  } catch {
    return dateString;
  }
};

export const formatDateForInput = (dateString: string): string => {
  return dateString; // YYYY-MM-DD形式をそのまま返す
};

/**
 * UUID v4を生成
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

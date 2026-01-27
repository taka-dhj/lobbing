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

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

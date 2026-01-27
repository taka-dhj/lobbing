import { Reservation, MonthlySummary } from '../types';
import { format, parseISO, addMonths, startOfMonth } from 'date-fns';

export const calculateTotalAmount = (
  unitPrice: number,
  numberOfPeople: number,
  tennisCourt: number,
  banquetHall: number,
  other: number
): number => {
  return unitPrice * numberOfPeople + tennisCourt + banquetHall + other;
};

export const groupReservationsByMonth = (
  reservations: Reservation[]
): MonthlySummary[] => {
  const grouped = new Map<string, Reservation[]>();

  reservations.forEach(reservation => {
    const month = format(parseISO(reservation.date), 'yyyy-MM');
    if (!grouped.has(month)) {
      grouped.set(month, []);
    }
    grouped.get(month)!.push(reservation);
  });

  return Array.from(grouped.entries())
    .map(([month, reservations]) => {
      const totalAmount = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
      const generalTotal = reservations
        .filter(r => r.type === '一般')
        .reduce((sum, r) => sum + r.totalAmount, 0);
      const studentTotal = reservations
        .filter(r => r.type === '学生')
        .reduce((sum, r) => sum + r.totalAmount, 0);

      return {
        month,
        totalAmount,
        generalTotal,
        studentTotal,
        reservations: reservations.sort((a, b) => 
          a.date.localeCompare(b.date)
        ),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
};

export const getMonthName = (month: string): string => {
  const date = parseISO(`${month}-01`);
  return format(date, 'yyyy年M月');
};

// 向こう6ヶ月の月リストを生成
export const getNextSixMonths = (): string[] => {
  const today = new Date();
  const months: string[] = [];
  
  for (let i = 0; i < 6; i++) {
    const monthDate = addMonths(startOfMonth(today), i);
    months.push(format(monthDate, 'yyyy-MM'));
  }
  
  return months;
};

// 特定の月の売上を計算
export const getMonthSales = (
  month: string,
  reservations: Reservation[]
): { totalAmount: number; generalTotal: number; studentTotal: number } => {
  const monthReservations = reservations.filter(r => {
    const reservationMonth = format(parseISO(r.date), 'yyyy-MM');
    return reservationMonth === month;
  });

  const totalAmount = monthReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const generalTotal = monthReservations
    .filter(r => r.type === '一般')
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const studentTotal = monthReservations
    .filter(r => r.type === '学生')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  return { totalAmount, generalTotal, studentTotal };
};

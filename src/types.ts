export type CustomerType = '一般' | '学生';

export interface Reservation {
  id: string;
  date: string; // YYYY-MM-DD形式
  customerName: string;
  type: CustomerType;
  unitPrice: number;
  numberOfPeople: number;
  tennisCourt: number;
  banquetHall: number;
  other: number;
  totalAmount: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM形式
  totalAmount: number;
  generalTotal: number;
  studentTotal: number;
  reservations: Reservation[];
}

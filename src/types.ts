export type CustomerType = '一般' | '学生' | '修学' | '子供';

export type RoomType = 
  | '本館1' 
  | '本館2' 
  | '本館3' 
  | '本館4' 
  | '本館5' 
  | '本館6' 
  | '本館7' 
  | '別館' 
  | 'コテージ1' 
  | 'コテージ2' 
  | 'コテージ3';

export interface RoomAllocation {
  roomType: RoomType;
  guestCount: number;
}

export interface Reservation {
  id: string;
  date: string; // YYYY-MM-DD形式
  customerName: string;
  type: CustomerType;
  unitPrice: number;
  numberOfPeople: number; // 合計人数（自動計算）
  tennisCourt: number;
  banquetHall: number;
  other: number;
  totalAmount: number;
  rooms?: RoomAllocation[]; // 部屋ごとの人数配分
}

export interface MonthlySummary {
  month: string; // YYYY-MM形式
  totalAmount: number;
  generalTotal: number;
  studentTotal: number;
  reservations: Reservation[];
}

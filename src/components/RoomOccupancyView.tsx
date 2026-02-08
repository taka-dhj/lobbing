import { useMemo, useState } from 'react';
import { Reservation, RoomType } from '../types';

interface RoomOccupancyViewProps {
  year: number;
  month: number;
  reservations: Reservation[];
  onYearMonthChange?: (year: number, month: number) => void;
}

const ROOM_TYPES: RoomType[] = [
  '本館1', '本館2', '本館3', '本館4', '本館5', '本館6', '本館7',
  '別館',
  'コテージ1', 'コテージ2', 'コテージ3'
];

export const RoomOccupancyView = ({ year, month, reservations, onYearMonthChange }: RoomOccupancyViewProps) => {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    if (onYearMonthChange) {
      onYearMonthChange(newYear, selectedMonth);
    }
  };

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    if (onYearMonthChange) {
      onYearMonthChange(selectedYear, newMonth);
    }
  };

  const occupancyData = useMemo(() => {
    // 指定された年月のデータのみフィルタ
    const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const monthReservations = reservations.filter(r => r.date.startsWith(monthStr));
    
    // その月の日数を取得
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    
    // 日付ごと・部屋ごとのデータを作成
    const dailyOccupancy: Record<number, Record<RoomType, number>> = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      dailyOccupancy[day] = {} as Record<RoomType, number>;
      ROOM_TYPES.forEach(room => {
        dailyOccupancy[day][room] = 0;
      });
    }
    
    // 予約データから部屋の稼働状況を集計
    monthReservations.forEach(reservation => {
      const day = parseInt(reservation.date.split('-')[2]);
      
      if (reservation.rooms && reservation.rooms.length > 0) {
        reservation.rooms.forEach(room => {
          dailyOccupancy[day][room.roomType] += room.guestCount;
        });
      }
    });
    
    // 各部屋の稼働率を計算（稼働日数 / 月の日数）
    const roomOccupancyRate: Record<RoomType, number> = {} as Record<RoomType, number>;
    ROOM_TYPES.forEach(room => {
      let occupiedDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        if (dailyOccupancy[day][room] > 0) {
          occupiedDays++;
        }
      }
      roomOccupancyRate[room] = Math.round((occupiedDays / daysInMonth) * 100);
    });
    
    return { dailyOccupancy, roomOccupancyRate, daysInMonth };
  }, [selectedYear, selectedMonth, reservations]);

  const { dailyOccupancy, roomOccupancyRate, daysInMonth } = occupancyData;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">部屋稼働状況</h2>
        
        {/* 年月選択UI */}
        <div className="flex gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">年:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">月:</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-3 py-2 bg-gray-100 text-sm font-semibold sticky left-0 z-10">日付</th>
              {ROOM_TYPES.map(room => (
                <th key={room} className="border border-gray-300 px-3 py-2 bg-gray-100 text-sm font-semibold min-w-[80px]">
                  {room}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-center font-medium sticky left-0 bg-white z-10">
                  {selectedMonth}/{day}
                </td>
                {ROOM_TYPES.map(room => {
                  const guestCount = dailyOccupancy[day][room];
                  const isOccupied = guestCount > 0;
                  
                  return (
                    <td
                      key={room}
                      className={`border border-gray-300 px-3 py-2 text-center ${
                        isOccupied ? 'bg-blue-100 font-semibold' : ''
                      }`}
                    >
                      {isOccupied ? `${guestCount}人` : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-yellow-50 font-bold">
              <td className="border border-gray-300 px-3 py-2 text-center sticky left-0 z-10 bg-yellow-50">
                稼働率
              </td>
              {ROOM_TYPES.map(room => (
                <td key={room} className="border border-gray-300 px-3 py-2 text-center">
                  {roomOccupancyRate[room]}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">稼働率サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ROOM_TYPES.map(room => (
            <div key={room} className="text-center">
              <div className="text-sm text-gray-600">{room}</div>
              <div className="text-2xl font-bold text-blue-600">{roomOccupancyRate[room]}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

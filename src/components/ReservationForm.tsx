import { useState } from 'react';
import { Reservation, CustomerType, RoomAllocation, RoomType } from '../types';
import { calculateTotalAmount } from '../utils/calculations';
import { generateId } from '../utils/dateUtils';

interface ReservationFormProps {
  reservation?: Reservation;
  onSave: (reservation: Reservation) => void;
  onCancel: () => void;
}

const ROOM_TYPES: RoomType[] = [
  '本館1', '本館2', '本館3', '本館4', '本館5', '本館6', '本館7',
  '別館',
  'コテージ1', 'コテージ2', 'コテージ3'
];

export const ReservationForm = ({ reservation, onSave, onCancel }: ReservationFormProps) => {
  const [formData, setFormData] = useState({
    date: reservation?.date || new Date().toISOString().split('T')[0],
    customerName: reservation?.customerName || '',
    type: (reservation?.type || '一般') as CustomerType,
    unitPrice: reservation?.unitPrice || 0,
    tennisCourt: reservation?.tennisCourt || 0,
    banquetHall: reservation?.banquetHall || 0,
    other: reservation?.other || 0,
  });

  const [rooms, setRooms] = useState<RoomAllocation[]>(
    reservation?.rooms || []
  );

  // 合計人数を計算
  const totalPeople = rooms.reduce((sum, room) => sum + room.guestCount, 0);

  const totalAmount = calculateTotalAmount(
    Number(formData.unitPrice) || 0,
    totalPeople,
    Number(formData.tennisCourt) || 0,
    Number(formData.banquetHall) || 0,
    Number(formData.other) || 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reservationData: Reservation = {
      id: reservation?.id || generateId(),
      ...formData,
      numberOfPeople: totalPeople,
      totalAmount,
      rooms: rooms.length > 0 ? rooms : undefined,
    };
    onSave(reservationData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'customerName' || field === 'date' || field === 'type'
        ? value
        : Number(value) || 0,
    }));
  };

  const handleAddRoom = () => {
    setRooms(prev => [...prev, { roomType: '本館1', guestCount: 1 }]);
  };

  const handleRemoveRoom = (index: number) => {
    setRooms(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomChange = (index: number, field: 'roomType' | 'guestCount', value: string | number) => {
    setRooms(prev => prev.map((room, i) => {
      if (i === index) {
        return {
          ...room,
          [field]: field === 'guestCount' ? Number(value) || 0 : value
        };
      }
      return room;
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold mb-4">
        {reservation ? '予約を編集' : '新しい予約を追加'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            予約日 *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            顧客名 *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            区分 *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="一般">一般</option>
            <option value="学生">学生</option>
            <option value="修学">修学</option>
            <option value="子供">子供</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            単価 (円) *
          </label>
          <input
            type="number"
            value={formData.unitPrice}
            onChange={(e) => handleChange('unitPrice', e.target.value)}
            onFocus={(e) => e.target.value === '0' && e.target.select()}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 部屋と人数 */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            部屋と宿泊人数
          </label>
          <button
            type="button"
            onClick={handleAddRoom}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            + 部屋を追加
          </button>
        </div>
        
        {rooms.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
            部屋を追加してください
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room, index) => (
              <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-md">
                <div className="flex-1">
                  <select
                    value={room.roomType}
                    onChange={(e) => handleRoomChange(index, 'roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROOM_TYPES.map(roomType => (
                      <option key={roomType} value={roomType}>{roomType}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={room.guestCount}
                    onChange={(e) => handleRoomChange(index, 'guestCount', e.target.value)}
                    min="1"
                    placeholder="人数"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRoom(index)}
                  className="text-red-600 hover:text-red-800 font-medium px-2"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">合計宿泊人数:</span>
            <span className="text-xl font-bold text-blue-600">{totalPeople}人</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            テニスコート (円)
          </label>
          <input
            type="number"
            value={formData.tennisCourt}
            onChange={(e) => handleChange('tennisCourt', e.target.value)}
            onFocus={(e) => e.target.value === '0' && e.target.select()}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            宴会場 (円)
          </label>
          <input
            type="number"
            value={formData.banquetHall}
            onChange={(e) => handleChange('banquetHall', e.target.value)}
            onFocus={(e) => e.target.value === '0' && e.target.select()}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            その他 (円)
          </label>
          <input
            type="number"
            value={formData.other}
            onChange={(e) => handleChange('other', e.target.value)}
            onFocus={(e) => e.target.value === '0' && e.target.select()}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">合計金額:</span>
          <span className="text-2xl font-bold text-blue-600">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          {reservation ? '更新' : '追加'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

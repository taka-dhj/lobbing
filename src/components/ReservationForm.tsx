import { useState } from 'react';
import { Reservation, CustomerType } from '../types';
import { calculateTotalAmount } from '../utils/calculations';
import { generateId } from '../utils/dateUtils';

interface ReservationFormProps {
  reservation?: Reservation;
  onSave: (reservation: Reservation) => void;
  onCancel: () => void;
}

export const ReservationForm = ({ reservation, onSave, onCancel }: ReservationFormProps) => {
  const [formData, setFormData] = useState({
    date: reservation?.date || new Date().toISOString().split('T')[0],
    customerName: reservation?.customerName || '',
    type: (reservation?.type || '一般') as CustomerType,
    unitPrice: reservation?.unitPrice || 0,
    numberOfPeople: reservation?.numberOfPeople || 0,
    tennisCourt: reservation?.tennisCourt || 0,
    banquetHall: reservation?.banquetHall || 0,
    other: reservation?.other || 0,
  });

  const totalAmount = calculateTotalAmount(
    formData.unitPrice,
    formData.numberOfPeople,
    formData.tennisCourt,
    formData.banquetHall,
    formData.other
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reservationData: Reservation = {
      id: reservation?.id || generateId(),
      ...formData,
      totalAmount,
    };
    onSave(reservationData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value) || 0,
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
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            人数 *
          </label>
          <input
            type="number"
            value={formData.numberOfPeople}
            onChange={(e) => handleChange('numberOfPeople', e.target.value)}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            テニスコート (円)
          </label>
          <input
            type="number"
            value={formData.tennisCourt}
            onChange={(e) => handleChange('tennisCourt', e.target.value)}
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

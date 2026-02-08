import { useState } from 'react';
import { Reservation, MonthlySummary } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getMonthName } from '../utils/calculations';
import { convertToCSV, downloadCSV } from '../utils/csvExport';

interface MonthlyViewProps {
  summary: MonthlySummary;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
}

export const MonthlyView = ({ summary, onEdit, onDelete }: MonthlyViewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExportMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent = convertToCSV(summary.reservations);
    const filename = `予約データ_${getMonthName(summary.month)}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="mb-4">
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {isExpanded ? '▼' : '▶'}
            </span>
            <h2 className="text-xl font-bold">{getMonthName(summary.month)}</h2>
            <span className="text-sm opacity-90">({summary.reservations.length}件)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportMonth}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              CSV出力
            </button>
            <div className="text-right">
              <div className="text-sm opacity-90">合計売上</div>
              <div className="text-2xl font-bold">¥{summary.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-6 mt-2 text-sm">
          <div>
            <span className="opacity-90">一般:</span>
            <span className="ml-2 font-semibold">¥{summary.generalTotal.toLocaleString()}</span>
          </div>
          <div>
            <span className="opacity-90">学生:</span>
            <span className="ml-2 font-semibold">¥{summary.studentTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto bg-white rounded-b-lg shadow-lg mt-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  区分
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  単価
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  人数
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  テニスコート
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  宴会場
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  その他
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合計金額
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(reservation.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reservation.customerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.type === '一般' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {reservation.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{reservation.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    {reservation.numberOfPeople}人
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{reservation.tennisCourt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{reservation.banquetHall.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                    ¥{reservation.other.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    ¥{reservation.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(reservation);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('この予約を削除しますか？')) {
                            onDelete(reservation.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

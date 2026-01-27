import React, { useState, useEffect } from 'react';
import { Reservation } from './types';
import { loadReservations, saveReservations, updateReservation, deleteReservation } from './utils/storage';
import { groupReservationsByMonth, getMonthsForYear, getMonthSales, getMonthName } from './utils/calculations';
import { MonthlyView } from './components/MonthlyView';
import { ReservationForm } from './components/ReservationForm';
import { dummyReservations } from './data/dummyData';
import { realReservations } from './data/realData';

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  useEffect(() => {
    try {
      const loaded = loadReservations();
      // データが空の場合、実データを読み込む
      if (loaded.length === 0) {
        console.log('ローカルストレージが空のため、実データを読み込みます');
        saveReservations(realReservations);
        setReservations(realReservations);
      } else {
        console.log(`ローカルストレージから ${loaded.length} 件の予約を読み込みました`);
        setReservations(loaded);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました。実データを使用します:', error);
      // エラーが発生した場合でも実データを表示
      setReservations(realReservations);
    }
  }, []);

  const monthlySummaries = groupReservationsByMonth(reservations);

  // 選択中の年度の売上を計算
  const selectedYearSummary = React.useMemo(() => {
    const yearMonths = getMonthsForYear(selectedYear);
    const yearReservations = reservations.filter(r => {
      const reservationMonth = r.date.substring(0, 7); // yyyy-MM形式
      return yearMonths.includes(reservationMonth);
    });

    const totalAmount = yearReservations.reduce((sum, r) => sum + r.totalAmount, 0);
    const generalTotal = yearReservations
      .filter(r => r.type === '一般')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const studentTotal = yearReservations
      .filter(r => r.type === '学生')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const reservationCount = yearReservations.length;

    return { totalAmount, generalTotal, studentTotal, reservationCount };
  }, [reservations, selectedYear]);

  const handleSave = (reservation: Reservation) => {
    if (editingReservation) {
      updateReservation(reservation.id, reservation);
    } else {
      const updated = [...reservations, reservation];
      saveReservations(updated);
    }
    setReservations(loadReservations());
    setShowForm(false);
    setEditingReservation(undefined);
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteReservation(id);
    setReservations(loadReservations());
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReservation(undefined);
  };

  const handleNewReservation = () => {
    setEditingReservation(undefined);
    setShowForm(true);
  };

  const handleLoadDummyData = () => {
    if (confirm('実データを読み込みますか？既存のデータは上書きされます。')) {
      saveReservations(realReservations);
      setReservations(realReservations);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">予約管理システム</h1>
            <div className="flex gap-3">
              <button
                onClick={handleLoadDummyData}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium shadow-sm text-sm"
              >
                実データ読み込み
              </button>
              <button
                onClick={handleNewReservation}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
              >
                + 新しい予約を追加
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="mb-8">
            <ReservationForm
              reservation={editingReservation}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

        {monthlySummaries.length === 0 && !showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">予約がまだ登録されていません</p>
            <button
              onClick={handleNewReservation}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              最初の予約を追加
            </button>
          </div>
        ) : (
          <>
            {/* 全体サマリーを上部に表示 */}
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">{selectedYear}年 全体サマリー</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">総売上</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{selectedYearSummary.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">一般合計</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{selectedYearSummary.generalTotal.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">学生合計</div>
                  <div className="text-2xl font-bold text-green-600">
                    ¥{selectedYearSummary.studentTotal.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-600 mb-1">予約件数</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {selectedYearSummary.reservationCount}件
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">各月売り上げ予定</h3>
                  <div className="flex gap-2">
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          selectedYear === year
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {year}年
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getMonthsForYear(selectedYear).map((month) => {
                    const sales = getMonthSales(month, reservations);
                    return (
                      <div key={month} className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-700 mb-2">{getMonthName(month)}</div>
                        <div className="text-2xl font-bold text-indigo-700">
                          ¥{sales.totalAmount.toLocaleString()}
                        </div>
                        <div className="mt-2 flex gap-3 text-xs">
                          <span className="text-gray-600">一般: ¥{sales.generalTotal.toLocaleString()}</span>
                          <span className="text-gray-600">学生: ¥{sales.studentTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 月次詳細ビュー */}
            <div>
              {monthlySummaries.map((summary) => (
                <MonthlyView
                  key={summary.month}
                  summary={summary}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

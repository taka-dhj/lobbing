import { useState, useEffect } from 'react';
import { Reservation } from './types';
import { loadReservations, saveReservations, updateReservation, deleteReservation } from './utils/storage';
import { groupReservationsByMonth, getNextSixMonths, getMonthSales, getMonthName } from './utils/calculations';
import { MonthlyView } from './components/MonthlyView';
import { ReservationForm } from './components/ReservationForm';
import { dummyReservations } from './data/dummyData';

function App() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      const loaded = loadReservations();
      // データが空の場合、ダミーデータを読み込む
      if (loaded.length === 0) {
        console.log('ローカルストレージが空のため、ダミーデータを読み込みます');
        saveReservations(dummyReservations);
        setReservations(dummyReservations);
      } else {
        console.log(`ローカルストレージから ${loaded.length} 件の予約を読み込みました`);
        setReservations(loaded);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました。ダミーデータを使用します:', error);
      // エラーが発生した場合でもダミーデータを表示
      setReservations(dummyReservations);
    }
  }, []);

  const monthlySummaries = groupReservationsByMonth(reservations);

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
    if (confirm('ダミーデータを読み込みますか？既存のデータは上書きされます。')) {
      saveReservations(dummyReservations);
      setReservations(dummyReservations);
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
                ダミーデータ読み込み
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
        )}

        {monthlySummaries.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">全体サマリー</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-gray-600 mb-1">総売上</div>
                <div className="text-2xl font-bold text-blue-600">
                  ¥{monthlySummaries.reduce((sum, m) => sum + m.totalAmount, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-gray-600 mb-1">一般合計</div>
                <div className="text-2xl font-bold text-blue-600">
                  ¥{monthlySummaries.reduce((sum, m) => sum + m.generalTotal, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-sm text-gray-600 mb-1">学生合計</div>
                <div className="text-2xl font-bold text-green-600">
                  ¥{monthlySummaries.reduce((sum, m) => sum + m.studentTotal, 0).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">向こう6ヶ月の売上予定</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getNextSixMonths().map((month) => {
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
        )}
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Reservation } from './types';
import { loadReservations, saveReservations, updateReservation, deleteReservation, addReservation } from './utils/storage';
import { groupReservationsByMonth, getMonthsForYear, getMonthSales, getMonthName } from './utils/calculations';
import { exportYearlyReservations } from './utils/csvExport';
import { Auth } from './components/Auth';
import { MonthlyView } from './components/MonthlyView';
import { ReservationForm } from './components/ReservationForm';
import { RoomOccupancyView } from './components/RoomOccupancyView';
import { realReservations } from './data/realData';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showRoomOccupancy, setShowRoomOccupancy] = useState(false);

  // 認証状態の監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // データ読み込み
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    try {
      const data = await loadReservations();
      
      // データが空の場合は実データをインポート
      if (data.length === 0) {
        console.log('初回データをインポートします...');
        await saveReservations(realReservations);
        setReservations(realReservations);
      } else {
        setReservations(data);
      }
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
      setReservations([]);
    }
  };

  const monthlySummaries = groupReservationsByMonth(reservations);

  // 選択中の年度の売上を計算
  const selectedYearSummary = React.useMemo(() => {
    const yearMonths = getMonthsForYear(selectedYear);
    const yearReservations = reservations.filter(r => {
      const reservationMonth = r.date.substring(0, 7);
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

  const handleSave = async (reservation: Reservation) => {
    try {
      if (editingReservation) {
        await updateReservation(reservation.id, reservation);
      } else {
        await addReservation(reservation);
      }
      await loadData();
      setShowForm(false);
      setEditingReservation(undefined);
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました');
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReservation(id);
      await loadData();
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReservation(undefined);
  };

  const handleNewReservation = () => {
    setEditingReservation(undefined);
    setShowForm(true);
  };

  const handleExportCSV = () => {
    exportYearlyReservations(selectedYear, reservations);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // 未認証の場合はログイン画面を表示
  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  // 認証済みの場合はメインアプリを表示
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">予約管理システム</h1>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <button
                onClick={() => setShowRoomOccupancy(!showRoomOccupancy)}
                className={`px-4 py-2 rounded-md font-medium shadow-sm text-sm ${
                  showRoomOccupancy 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {showRoomOccupancy ? '売上表示に戻る' : '部屋稼働率'}
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-sm text-sm"
              >
                CSV出力
              </button>
              <button
                onClick={handleNewReservation}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
              >
                + 新しい予約を追加
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium shadow-sm text-sm"
              >
                ログアウト
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

        {showRoomOccupancy ? (
          <RoomOccupancyView
            year={selectedYear}
            month={12}
            reservations={reservations}
          />
        ) : (
          <>
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
              {monthlySummaries
                .filter(summary => summary.month.startsWith(`${selectedYear}-`))
                .map((summary) => (
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;

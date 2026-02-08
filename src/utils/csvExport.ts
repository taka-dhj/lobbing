import { Reservation } from '../types';

/**
 * 予約データをCSV形式に変換
 */
export const convertToCSV = (reservations: Reservation[]): string => {
  const headers = [
    '日付',
    '顧客名',
    '区分',
    '単価',
    '人数',
    '部屋情報',
    'テニスコート料金',
    '宴会場料金',
    'その他',
    '合計金額'
  ];

  const rows = reservations.map(r => {
    // 部屋情報を文字列に変換
    const roomInfo = r.rooms && r.rooms.length > 0
      ? r.rooms.map(room => `${room.roomType}(${room.guestCount}人)`).join('、')
      : '-';

    return [
      r.date,
      r.customerName,
      r.type,
      r.unitPrice.toString(),
      r.numberOfPeople.toString(),
      roomInfo,
      r.tennisCourt.toString(),
      r.banquetHall.toString(),
      r.other.toString(),
      r.totalAmount.toString()
    ];
  });

  // CSVの内容を生成
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // カンマや改行を含む場合はダブルクォートで囲む
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * CSVファイルをダウンロード
 */
export const downloadCSV = (csvContent: string, filename: string) => {
  // BOMを追加してExcelで正しく開けるようにする
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 月別の予約データをCSVとしてエクスポート
 */
export const exportMonthlyReservations = (
  year: number,
  month: number,
  reservations: Reservation[]
) => {
  // 指定された年月でフィルタリング
  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
  const filteredReservations = reservations.filter(r => 
    r.date.startsWith(monthStr)
  );

  if (filteredReservations.length === 0) {
    alert(`${year}年${month}月のデータがありません。`);
    return;
  }

  // CSV生成
  const csvContent = convertToCSV(filteredReservations);
  const filename = `予約データ_${year}年${month}月.csv`;

  // ダウンロード
  downloadCSV(csvContent, filename);
};

/**
 * 年度全体の予約データをCSVとしてエクスポート
 */
export const exportYearlyReservations = (
  year: number,
  reservations: Reservation[]
) => {
  // 指定された年でフィルタリング
  const filteredReservations = reservations.filter(r => 
    r.date.startsWith(`${year}-`)
  );

  if (filteredReservations.length === 0) {
    alert(`${year}年のデータがありません。`);
    return;
  }

  // CSV生成
  const csvContent = convertToCSV(filteredReservations);
  const filename = `予約データ_${year}年.csv`;

  // ダウンロード
  downloadCSV(csvContent, filename);
};

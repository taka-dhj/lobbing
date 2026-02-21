import { Reservation } from '../types';
import { supabase } from '../lib/supabase';

// ローカルストレージのキー（バックアップ用）
const STORAGE_KEY = 'lobbing-reservations';

/**
 * Supabaseから全予約データを取得
 */
export const loadReservations = async (): Promise<Reservation[]> => {
  try {
    console.log('🔍 Supabaseから全データを取得中...');
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    console.log(`✅ Supabaseから ${data?.length || 0} 件のデータを取得しました`);
    
    // 2023年のデータ件数を確認
    const data2023 = (data || []).filter(r => r.date.startsWith('2023'));
    console.log(`📊 2023年のデータ: ${data2023.length} 件`);
    console.log('📝 2023年のサンプル（最初の3件）:', data2023.slice(0, 3));

    // データベースの形式をアプリの形式に変換
    return (data || []).map(record => ({
      id: record.id,
      date: record.date,
      customerName: record.customer_name,
      type: record.type as '一般' | '学生',
      unitPrice: record.unit_price,
      numberOfPeople: record.number_of_people,
      tennisCourt: record.tennis_court,
      banquetHall: record.banquet_hall,
      other: record.other,
      totalAmount: record.total_amount,
      rooms: record.rooms || undefined,
    }));
  } catch (error) {
    console.error('予約データの読み込みに失敗しました:', error);
    // エラー時はローカルストレージからロード
    return loadReservationsFromLocal();
  }
};

/**
 * 予約データを一括保存（Supabase + ローカルバックアップ）
 */
export const saveReservations = async (reservations: Reservation[]): Promise<void> => {
  try {
    // まずローカルにバックアップ
    saveReservationsToLocal(reservations);

    // 既存データを全削除
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 全削除

    if (deleteError) throw deleteError;

    // 新しいデータを挿入
    const dbRecords = reservations.map(r => ({
      id: r.id,
      date: r.date,
      customer_name: r.customerName,
      type: r.type,
      unit_price: r.unitPrice,
      number_of_people: r.numberOfPeople,
      tennis_court: r.tennisCourt,
      banquet_hall: r.banquetHall,
      other: r.other,
      total_amount: r.totalAmount,
      rooms: r.rooms || null,
    }));

    const { error: insertError } = await supabase
      .from('reservations')
      .insert(dbRecords);

    if (insertError) throw insertError;
  } catch (error) {
    console.error('予約データの保存に失敗しました:', error);
    throw error;
  }
};

/**
 * 予約を追加
 */
export const addReservation = async (reservation: Reservation): Promise<void> => {
  try {
    const dbRecord = {
      id: reservation.id,
      date: reservation.date,
      customer_name: reservation.customerName,
      type: reservation.type,
      unit_price: reservation.unitPrice,
      number_of_people: reservation.numberOfPeople,
      tennis_court: reservation.tennisCourt,
      banquet_hall: reservation.banquetHall,
      other: reservation.other,
      total_amount: reservation.totalAmount,
      rooms: reservation.rooms || null,
    };

    const { error } = await supabase
      .from('reservations')
      .insert([dbRecord]);

    if (error) throw error;
  } catch (error) {
    console.error('予約の追加に失敗しました:', error);
    throw error;
  }
};

/**
 * 予約を更新
 */
export const updateReservation = async (id: string, updated: Reservation): Promise<void> => {
  try {
    const dbRecord = {
      date: updated.date,
      customer_name: updated.customerName,
      type: updated.type,
      unit_price: updated.unitPrice,
      number_of_people: updated.numberOfPeople,
      tennis_court: updated.tennisCourt,
      banquet_hall: updated.banquetHall,
      other: updated.other,
      total_amount: updated.totalAmount,
      rooms: updated.rooms || null,
    };

    const { error } = await supabase
      .from('reservations')
      .update(dbRecord)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('予約の更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 予約を削除
 */
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('予約の削除に失敗しました:', error);
    throw error;
  }
};

// ========== ローカルストレージ関連（バックアップ用） ==========

const saveReservationsToLocal = (reservations: Reservation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (error) {
    console.error('ローカルストレージへの保存に失敗しました:', error);
  }
};

const loadReservationsFromLocal = (): Reservation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('ローカルストレージからの読み込みに失敗しました:', error);
  }
  return [];
};

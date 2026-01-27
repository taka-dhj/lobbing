import { Reservation } from '../types';

const STORAGE_KEY = 'lobbing-reservations';

export const saveReservations = (reservations: Reservation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (error) {
    console.error('予約データの保存に失敗しました:', error);
  }
};

export const loadReservations = (): Reservation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('予約データの読み込みに失敗しました:', error);
  }
  return [];
};

export const addReservation = (reservation: Reservation): void => {
  const reservations = loadReservations();
  reservations.push(reservation);
  saveReservations(reservations);
};

export const updateReservation = (id: string, updated: Reservation): void => {
  const reservations = loadReservations();
  const index = reservations.findIndex(r => r.id === id);
  if (index !== -1) {
    reservations[index] = updated;
    saveReservations(reservations);
  }
};

export const deleteReservation = (id: string): void => {
  const reservations = loadReservations();
  const filtered = reservations.filter(r => r.id !== id);
  saveReservations(filtered);
};

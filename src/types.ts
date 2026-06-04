export type Role = 'Operator' | 'Kolektor' | 'Pelanggan';

export type Operator = {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  createdAt?: number;
};

export type Tarif = {
  id: string;
  name: string;
  mcb?: string;
  price: number;
  createdAt?: number;
};

export type Jalur = {
  id: string;
  name: string;
  alamat?: string;
  createdAt?: number;
};

export type Kolektor = {
  id: string;
  name: string;
  jalurIds: string[];
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  createdAt?: number;
};

export type Pelanggan = {
  id: string;
  name: string;
  alamat?: string;
  jalurId: string;
  tarifId: string;
  mcb?: string;
  status: string; // Added status
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  uid?: string;
  createdAt?: number;
};

export type TagihanPeriod = {
  id: string;
  month: number;
  year: number;
  totalDays: number;
  totalAmount: number;
  generatedDate: string;
};

export type TagihanDetail = {
  id: string;
  periodId: string;
  pelangganId: string;
  snapshotPelangganName: string;
  snapshotPelangganAlamat: string;
  snapshotPelangganUsername?: string;
  snapshotPelangganPassword?: string;
  snapshotJalurName: string;
  snapshotTarifName: string;
  snapshotTarifPrice: number;
  kolektorId: string | null;
  kolektorName: string | null;
  pemakaianHari: number;
  totalHariSebulan: number;
  hariMatiListrik: number;
  totalTagihan: number;
  catatan: string;
  status: 'Lunas' | 'Belum Lunas';
  isLocked?: boolean;
};

// Initial Mocks
export const initialTarifs: Tarif[] = [
  { id: 't1', name: 'Lampu', price: 7000, createdAt: 1622500000001 },
  { id: 't2', name: 'Lampu & Pompa Air', price: 8000, createdAt: 1622500000002 },
  { id: 't3', name: 'Lampu & TV', price: 9000, createdAt: 1622500000003 },
  { id: 't4', name: 'Lampu, Pompa Air & TV', price: 10000, createdAt: 1622500000004 },
];

export const initialJalurs: Jalur[] = [
  { id: 'j1', name: 'Hulu', createdAt: 1622500000001 },
  { id: 'j2', name: 'Tengah', createdAt: 1622500000002 },
  { id: 'j3', name: 'Hilir', createdAt: 1622500000003 },
  { id: 'j4', name: 'Sembatang', createdAt: 1622500000004 },
  { id: 'j5', name: 'Lipat Gunting', createdAt: 1622500000005 },
];

export const initialKolektors: Kolektor[] = [
  { id: 'k1', name: 'Yusua', jalurIds: ['j1', 'j2', 'j3', 'j4'], username: 'yusua', password: '123', createdAt: 1622500000001 },
  { id: 'k2', name: 'Pingkun', jalurIds: ['j5'], username: 'pingkun', password: '123', createdAt: 1622500000002 },
];

export const initialPelanggans: Pelanggan[] = [
  { id: 'p1', name: 'Budi Santoso', jalurId: 'j1', tarifId: 't1', status: 'Aktif', username: 'budi', password: 'password123', createdAt: 1622500000001 },
  { id: 'p2', name: 'Siti Aminah', jalurId: 'j5', tarifId: 't3', status: 'Aktif', username: 'siti', password: 'password123', createdAt: 1622500000002 },
];

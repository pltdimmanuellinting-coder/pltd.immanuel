import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Pelanggan, Tarif, Jalur, Kolektor, TagihanPeriod, TagihanDetail, Operator, Role,
  initialPelanggans, initialTarifs, initialJalurs, initialKolektors 
} from '../types';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocFromServer, getDocs, updateDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

type AppState = {
  pelanggans: Pelanggan[];
  tarifs: Tarif[];
  jalurs: Jalur[];
  kolektors: Kolektor[];
  operators: Operator[];
  tagihanPeriods: TagihanPeriod[];
  tagihanDetails: TagihanDetail[];
  appSettings: { logo: string, profilePic: string, appName: string, address: string };
  f4Template: string;
  setF4Template: (t: string) => void;
  f4Config: any;
  setF4Config: (c: any) => void;
  savePrintSettings: (template: string, config: any) => Promise<void>;
  printContent: string;
  setPrintContent: (content: string) => void;
  setPelanggans: React.Dispatch<React.SetStateAction<Pelanggan[]>>;
  setTarifs: React.Dispatch<React.SetStateAction<Tarif[]>>;
  setJalurs: React.Dispatch<React.SetStateAction<Jalur[]>>;
  setKolektors: React.Dispatch<React.SetStateAction<Kolektor[]>>;
  setOperators: React.Dispatch<React.SetStateAction<Operator[]>>;
  setTagihanPeriods: React.Dispatch<React.SetStateAction<TagihanPeriod[]>>;
  setTagihanDetails: React.Dispatch<React.SetStateAction<TagihanDetail[]>>;
  setAppSettings: React.Dispatch<React.SetStateAction<{ logo: string, profilePic: string, appName: string, address: string }>>;
  saveAppSettings: (settings: { logo: string, profilePic: string, appName: string, address: string }) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
  userRole: Role | null;
  setUserRole: (role: Role | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  savePelanggan: (pelanggan: Pelanggan) => Promise<void>;
  deletePelanggan: (id: string) => Promise<void>;
  saveTarif: (tarif: Tarif) => Promise<void>;
  deleteTarif: (id: string) => Promise<void>;
  saveJalur: (jalur: Jalur) => Promise<void>;
  deleteJalur: (id: string) => Promise<void>;
  saveKolektor: (kolektor: Kolektor) => Promise<void>;
  deleteKolektor: (id: string) => Promise<void>;
  saveOperator: (operator: Operator) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
  saveTagihanPeriod: (period: TagihanPeriod) => Promise<void>;
  deleteTagihanPeriod: (id: string) => Promise<void>;
  saveTagihanDetail: (detail: TagihanDetail) => Promise<void>;
  saveTagihanBatch: (period: TagihanPeriod, details: TagihanDetail[]) => Promise<void>;
  seedInitialData: () => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [jalurs, setJalurs] = useState<Jalur[]>([]);
  const [kolektors, setKolektors] = useState<Kolektor[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [tagihanPeriods, setTagihanPeriods] = useState<TagihanPeriod[]>([]);
  const [tagihanDetails, setTagihanDetails] = useState<TagihanDetail[]>([]);
  const [appSettings, setAppSettings] = useState({ 
    logo: '', 
    profilePic: '', 
    appName: 'PLTD IMMANUEL',
    address: 'RT.007 RW.003 DUSUN LIPAT GUNTING'
  });
  const [f4Template, setF4Template] = useState('');
  const [f4Config, setF4Config] = useState({
    paperWidth: 330,
    paperHeight: 215,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    gapX: 8,
    gapY: 8,
  });

  const [printContent, setPrintContent] = useState('');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success'|'error', id: number} | null>(null);
  
  const handleFirestoreErrorLocal = (e: any, op: OperationType, path: string) => {
    console.error(`Firestore Error [${op}] on ${path}:`, e);
    showToast(`Gagal ${op}: ${e.message || 'Kesalahan Database'}`, 'error');
  };

  // Persistence Setup
  useEffect(() => {
    let unsubPelanggans = () => {};
    let unsubTarifs = () => {};
    let unsubJalurs = () => {};
    let unsubKolektors = () => {};
    let unsubOperators = () => {};
    let unsubPeriods = () => {};
    let unsubDetails = () => {};
    let unsubAppSettings = () => {};
    let unsubPrintSettings = () => {};

    const setupListeners = async () => {
      try {
        // Track how many listeners have received their first snapshot
        let loadedCount = 0;
        const totalListeners = 9; // 7 collections + 2 settings
        const markLoaded = () => {
          loadedCount++;
          if (loadedCount >= totalListeners) setIsLoading(false);
        };

        unsubPelanggans = onSnapshot(collection(db, 'pelanggans'), (s) => {
          const data = s.docs.map(d => ({ ...d.data(), id: d.id } as Pelanggan));
          setPelanggans(data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'pelanggans'));
        
        unsubTarifs = onSnapshot(collection(db, 'tarifs'), (s) => {
          const data = s.docs.map(d => ({ ...d.data(), id: d.id } as Tarif));
          setTarifs(data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'tarifs'));
        
        unsubJalurs = onSnapshot(collection(db, 'jalurs'), (s) => {
          const data = s.docs.map(d => ({ ...d.data(), id: d.id } as Jalur));
          setJalurs(data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'jalurs'));
        
        unsubKolektors = onSnapshot(collection(db, 'kolektors'), (s) => {
          const data = s.docs.map(d => ({ ...d.data(), id: d.id } as Kolektor));
          setKolektors(data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'kolektors'));
        
        unsubOperators = onSnapshot(collection(db, 'operators'), (s) => {
          const data = s.docs.map(d => ({ ...d.data(), id: d.id } as Operator));
          setOperators(data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'operators'));
        
        unsubPeriods = onSnapshot(collection(db, 'tagihanPeriods'), (s) => {
          setTagihanPeriods(s.docs.map(d => ({ ...d.data(), id: d.id } as TagihanPeriod)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'tagihanPeriods'));
        
        unsubDetails = onSnapshot(collection(db, 'tagihanDetails'), (s) => {
          setTagihanDetails(s.docs.map(d => ({ ...d.data(), id: d.id } as TagihanDetail)));
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.LIST, 'tagihanDetails'));
        
        unsubAppSettings = onSnapshot(doc(db, 'settings', 'app_settings'), (d) => {
          if (d.exists()) setAppSettings({ ...d.data(), id: d.id } as any);
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.GET, 'settings/app_settings'));

        unsubPrintSettings = onSnapshot(doc(db, 'settings', 'print_settings'), (d) => {
          if (d.exists()) {
            const data = d.data();
            setF4Template(data?.f4Template || '');
            if (data?.f4Config) {
              setF4Config(data.f4Config);
            }
          }
          markLoaded();
        }, (e) => handleFirestoreErrorLocal(e, OperationType.GET, 'settings/print_settings'));

      } catch (err) {
        console.error("Critical error setting up listeners:", err);
        setIsLoading(false);
      }
    };

    // Safety timeout: never stay stuck in loading more than 5s
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Only try to sign in if not already authenticated
        signInAnonymously(auth).catch((e) => {
          console.warn("Anonymous auth failed, proceeding without auth:", e);
        });
      }
      // Always setup listeners regardless of auth state for now
      setupListeners();
    });

    return () => {
      clearTimeout(loadingTimeout);
      unsubAuth();
      unsubPelanggans();
      unsubTarifs();
      unsubJalurs();
      unsubKolektors();
      unsubOperators();
      unsubPeriods();
      unsubDetails();
      unsubAppSettings();
      unsubPrintSettings();
    };
  }, []);

  const seedInitialData = async () => {
    setIsLoading(true);
    try {
      console.log('Starting seedInitialData...');
      const { writeBatch, getDocs } = await import('firebase/firestore');
      const batch = writeBatch(db);

      let seededAny = false;

      // Helper to seed if empty
      const seedIfEmpty = async (colName: string, data: any[]) => {
        console.log(`Checking collection: ${colName}`);
        const snap = await getDocs(collection(db, colName));
        if (snap.empty) {
          console.log(`Collection ${colName} is empty, seeding ${data.length} items`);
          data.forEach(item => {
            const docRef = doc(db, colName, item.id);
            batch.set(docRef, item);
          });
          seededAny = true;
          return true;
        }
        console.log(`Collection ${colName} already has ${snap.size} items`);
        return false;
      };

      await seedIfEmpty('tarifs', initialTarifs);
      await seedIfEmpty('jalurs', initialJalurs);
      await seedIfEmpty('kolektors', initialKolektors);
      await seedIfEmpty('pelanggans', initialPelanggans);
      await seedIfEmpty('operators', [{ id: 'op1', name: 'Eggy Setiawan', username: 'eggystwn@operator', password: 'Zefanya' }]);

      // Always update settings or ensure they exist
      batch.set(doc(db, 'settings', 'app_settings'), appSettings);
      batch.set(doc(db, 'settings', 'print_settings'), { f4Template, f4Config });
      
      console.log('Committing batch...');
      await batch.commit();
      console.log('Batch committed successfully');
      
      if (seededAny) {
        showToast('Data awal berhasil disinkronkan ke Firebase!');
      } else {
        showToast('Database sudah sinkron dengan Firebase.');
      }
    } catch (e) {
      console.error('Seed error:', e);
      handleFirestoreErrorLocal(e, OperationType.WRITE, 'seed');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const logout = async () => {
    setUserRole(null);
    setCurrentUser(null);
  };

  // Firestore Action Implementation
  const saveEntity = async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDocFromServer(docRef).catch(() => null);
      
      const enrichedData = {
        ...data,
        createdAt: docSnap?.exists() ? (docSnap.data()?.createdAt || Date.now()) : Date.now(),
        updatedAt: Date.now()
      };
      
      await setDoc(docRef, enrichedData);
    } catch (e) {
      handleFirestoreErrorLocal(e, OperationType.WRITE, `${collectionName}/${id}`);
      throw e;
    }
  };

  const deleteEntity = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      handleFirestoreErrorLocal(e, OperationType.DELETE, `${collectionName}/${id}`);
      throw e;
    }
  };

  const savePelanggan = (p: Pelanggan) => saveEntity('pelanggans', p.id, p);
  const deletePelanggan = (id: string) => deleteEntity('pelanggans', id);
  const saveTarif = (t: Tarif) => saveEntity('tarifs', t.id, t);
  const deleteTarif = (id: string) => deleteEntity('tarifs', id);
  const saveJalur = (j: Jalur) => saveEntity('jalurs', j.id, j);
  const deleteJalur = (id: string) => deleteEntity('jalurs', id);
  const saveKolektor = (k: Kolektor) => saveEntity('kolektors', k.id, k);
  const deleteKolektor = (id: string) => deleteEntity('kolektors', id);
  const saveOperator = (o: Operator) => saveEntity('operators', o.id, o);
  const deleteOperator = (id: string) => deleteEntity('operators', id);
  const saveTagihanPeriod = (p: TagihanPeriod) => saveEntity('tagihanPeriods', p.id, p);
  const deleteTagihanPeriod = (id: string) => deleteEntity('tagihanPeriods', id);
  const saveTagihanDetail = (d: TagihanDetail) => saveEntity('tagihanDetails', d.id, d);

  const saveTagihanBatch = async (period: TagihanPeriod, details: TagihanDetail[]) => {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    
    batch.set(doc(db, 'tagihanPeriods', period.id), period);
    details.forEach(d => batch.set(doc(db, 'tagihanDetails', d.id), d));
    
    try {
      await batch.commit();
    } catch (e) {
      handleFirestoreErrorLocal(e, OperationType.WRITE, 'tagihanBatch');
      throw e;
    }
  };

  const savePrintSettings = async (template: string, config: any) => {
    try {
      await setDoc(doc(db, 'settings', 'print_settings'), {
        f4Template: template,
        f4Config: config,
        updatedAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/print_settings');
    }
  };

  const saveAppSettings = async (settings: any) => {
    try {
      await setDoc(doc(db, 'settings', 'app_settings'), {
        ...appSettings,
        ...settings,
        updatedAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/app_settings');
    }
  };

  return (
    <AppContext.Provider value={{
      pelanggans, setPelanggans,
      tarifs, setTarifs,
      jalurs, setJalurs,
      kolektors, setKolektors,
      operators, setOperators,
      tagihanPeriods, setTagihanPeriods,
      tagihanDetails, setTagihanDetails,
      appSettings, setAppSettings,
      saveAppSettings,
      f4Template, setF4Template,
      f4Config, setF4Config,
      savePrintSettings,
      printContent, setPrintContent,
      showToast,
      logout,
      savePelanggan, deletePelanggan,
      saveTarif, deleteTarif,
      saveJalur, deleteJalur,
      saveKolektor, deleteKolektor,
      saveOperator, deleteOperator,
      saveTagihanPeriod, deleteTagihanPeriod, saveTagihanDetail,
      saveTagihanBatch,
      seedInitialData,
      setCurrentUser,
      userRole,
      setUserRole,
      isLoading,
      setIsLoading,
    }}>
      {children}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[280px] font-medium text-sm border-2 animate-bounce-short ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
             <div className={`w-2 h-2 rounded-full ${toastMessage.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
             {toastMessage.message}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

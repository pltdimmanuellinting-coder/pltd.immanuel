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
  userRole: Role | null;
  isLoading: boolean;
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
        unsubPelanggans = onSnapshot(collection(db, 'pelanggans'), (s) => 
          setPelanggans(s.docs.map(d => d.data() as Pelanggan)), (e) => handleFirestoreError(e, OperationType.LIST, 'pelanggans'));
        
        unsubTarifs = onSnapshot(collection(db, 'tarifs'), (s) => 
          setTarifs(s.docs.map(d => d.data() as Tarif)), (e) => handleFirestoreError(e, OperationType.LIST, 'tarifs'));
        
        unsubJalurs = onSnapshot(collection(db, 'jalurs'), (s) => 
          setJalurs(s.docs.map(d => d.data() as Jalur)), (e) => handleFirestoreError(e, OperationType.LIST, 'jalurs'));
        
        unsubKolektors = onSnapshot(collection(db, 'kolektors'), (s) => 
          setKolektors(s.docs.map(d => d.data() as Kolektor)), (e) => handleFirestoreError(e, OperationType.LIST, 'kolektors'));
        
        unsubOperators = onSnapshot(collection(db, 'operators'), (s) => 
          setOperators(s.docs.map(d => d.data() as Operator)), (e) => handleFirestoreError(e, OperationType.LIST, 'operators'));
        
        unsubPeriods = onSnapshot(collection(db, 'tagihanPeriods'), (s) => 
          setTagihanPeriods(s.docs.map(d => d.data() as TagihanPeriod)), (e) => handleFirestoreError(e, OperationType.LIST, 'tagihanPeriods'));
        
        unsubDetails = onSnapshot(collection(db, 'tagihanDetails'), (s) => 
          setTagihanDetails(s.docs.map(d => d.data() as TagihanDetail)), (e) => handleFirestoreError(e, OperationType.LIST, 'tagihanDetails'));
        
        unsubAppSettings = onSnapshot(doc(db, 'settings', 'app_settings'), (d) => {
          if (d.exists()) setAppSettings(d.data() as any);
        }, (e) => handleFirestoreError(e, OperationType.GET, 'settings/app_settings'));

        unsubPrintSettings = onSnapshot(doc(db, 'settings', 'print_settings'), (d) => {
          if (d.exists()) {
            const data = d.data();
            setF4Template(data?.f4Template || '');
            if (data?.f4Config) {
              setF4Config(data.f4Config);
            }
          }
        }, (e) => handleFirestoreError(e, OperationType.GET, 'settings/print_settings'));

      } catch (err) {
        console.error("Critical error setting up listeners:", err);
      } finally {
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
        setupListeners();
      } else {
        signInAnonymously(auth).catch((e) => {
          console.error("Auth error:", e);
          setIsLoading(false);
        });
      }
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
      // Seed master data
      for (const t of initialTarifs) await setDoc(doc(db, 'tarifs', t.id), t);
      for (const j of initialJalurs) await setDoc(doc(db, 'jalurs', j.id), j);
      for (const k of initialKolektors) await setDoc(doc(db, 'kolektors', k.id), k);
      for (const p of initialPelanggans) await setDoc(doc(db, 'pelanggans', p.id), p);
      
      // Seed operator if missing
      const opSnap = await getDocs(collection(db, 'operators'));
      if (opSnap.empty) {
        await setDoc(doc(db, 'operators', 'op1'), { id: 'op1', name: 'Eggy Setiawan', username: 'eggystwn@operator', password: 'Zefanya' });
      }
      
      // Seed settings
      await setDoc(doc(db, 'settings', 'app_settings'), appSettings);
      await setDoc(doc(db, 'settings', 'print_settings'), { f4Template, f4Config });
      
      showToast('Data berhasil disinkronkan ke Firebase!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'seed');
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
      await setDoc(doc(db, collectionName, id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `${collectionName}/${id}`);
    }
  };

  const deleteEntity = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${collectionName}/${id}`);
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
      seedInitialData,
      currentUser, userRole, isLoading
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

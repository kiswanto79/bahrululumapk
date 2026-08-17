import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
  MadrasahInfo,
  Siswa, 
  Guru, 
  Kelas,
  AbsensiRecord, 
  AbsensiGuruRecord,
  TahfidzRecord, 
  NilaiMapel, 
  TagihanSPP, 
  KanalPembayaran,
  Pengumuman, 
  JadwalPelajaran,
  MutabaahHarian,
  TabunganAccount,
  TabunganTransaksi,
  ProdukKoperasi,
  TransaksiKoperasi
} from '../types';
import { 
  MADRASAH_INFO,
  INITIAL_SISWA, 
  INITIAL_GURU, 
  INITIAL_KELAS,
  INITIAL_ABSENSI, 
  INITIAL_ABSENSI_GURU,
  INITIAL_TAHFIDZ, 
  INITIAL_NILAI, 
  INITIAL_TAGIHAN, 
  INITIAL_KANAL_PEMBAYARAN,
  INITIAL_PENGUMUMAN, 
  INITIAL_JADWAL,
  INITIAL_TABUNGAN_ACCOUNTS,
  INITIAL_TABUNGAN_TRANSAKSI,
  INITIAL_PRODUK_KOPERASI,
  INITIAL_TRANSAKSI_KOPERASI
} from '../data/initialMadrasahData';
import { formatImageUrl } from '../lib/imageHelper';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  db,
  collection,
  getDocs,
  setDoc,
  doc,
  writeBatch
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface MadrasahContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Madrasah Info
  madrasahInfo: MadrasahInfo;
  updateMadrasahInfo: (info: Partial<MadrasahInfo>) => void;
  resetMadrasahInfo: () => void;

  // Data states
  siswaList: Siswa[];
  guruList: Guru[];
  kelasList: Kelas[];
  absensiList: AbsensiRecord[];
  absensiGuruList: AbsensiGuruRecord[];
  tahfidzList: TahfidzRecord[];
  nilaiList: NilaiMapel[];
  tagihanList: TagihanSPP[];
  pengumumanList: Pengumuman[];
  jadwalList: JadwalPelajaran[];
  mutabaahToday: MutabaahHarian;
  tabunganAccounts: TabunganAccount[];
  tabunganTransaksi: TabunganTransaksi[];

  // Actions
  addSiswa: (siswa: Omit<Siswa, 'id'>) => Promise<void>;
  addBulkSiswa: (siswaArray: Omit<Siswa, 'id'>[]) => Promise<number>;
  updateSiswa: (id: string, siswa: Partial<Siswa>) => Promise<void>;
  deleteSiswa: (id: string) => Promise<void>;

  addGuru: (guru: Omit<Guru, 'id'>) => Promise<void>;
  updateGuru: (id: string, guru: Partial<Guru>) => Promise<void>;
  deleteGuru: (id: string) => Promise<void>;

  addKelas: (kelas: Omit<Kelas, 'id'>) => Promise<void>;
  updateKelas: (id: string, kelas: Partial<Kelas>) => Promise<void>;
  deleteKelas: (id: string) => Promise<void>;

  recordAbsensi: (record: Omit<AbsensiRecord, 'id'>) => Promise<void>;
  recordBulkAbsensi: (records: Omit<AbsensiRecord, 'id'>[]) => Promise<void>;
  recordAbsensiGuru: (record: Omit<AbsensiGuruRecord, 'id'>) => Promise<void>;
  recordTahfidz: (record: Omit<TahfidzRecord, 'id'>) => Promise<void>;
  updateMutabaah: (data: Partial<MutabaahHarian>) => void;
  
  saveNilai: (nilai: Omit<NilaiMapel, 'id'> | NilaiMapel) => Promise<void>;
  bayarTagihan: (id: string, metode: string) => Promise<void>;
  addTagihan: (tagihan: Omit<TagihanSPP, 'id'>) => Promise<void>;
  
  // Kanal Pembayaran Actions
  kanalPembayaranList: KanalPembayaran[];
  addKanalPembayaran: (kanal: Omit<KanalPembayaran, 'id'>) => Promise<void>;
  updateKanalPembayaran: (id: string, updates: Partial<KanalPembayaran>) => Promise<void>;
  deleteKanalPembayaran: (id: string) => Promise<void>;
  toggleKanalPembayaran: (id: string) => Promise<void>;
  
  addPengumuman: (pengumuman: Omit<Pengumuman, 'id'>) => Promise<void>;
  updatePengumuman: (id: string, pengumuman: Partial<Pengumuman>) => Promise<void>;
  deletePengumuman: (id: string) => Promise<void>;

  addJadwal: (jadwal: Omit<JadwalPelajaran, 'id'>) => Promise<void>;
  updateJadwal: (id: string, jadwal: Partial<JadwalPelajaran>) => Promise<void>;
  deleteJadwal: (id: string) => Promise<void>;

  // Tabungan Actions
  addTabunganAccount: (acc: Omit<TabunganAccount, 'id' | 'saldo' | 'tanggalBuka'>, saldoAwal?: number) => Promise<TabunganAccount>;
  updateTabunganAccount: (id: string, data: Partial<TabunganAccount>) => Promise<void>;
  deleteTabunganAccount: (id: string) => Promise<void>;
  setorTabungan: (rekeningId: string, nominal: number, kategori: string, keterangan: string, metode: string) => Promise<TabunganTransaksi | null>;
  tarikTabungan: (rekeningId: string, nominal: number, kategori: string, keterangan: string, metode: string) => Promise<{ success: boolean; message: string; transaksi?: TabunganTransaksi }>;
  bayarSPPDenganTabungan: (rekeningId: string, tagihanId: string) => Promise<{ success: boolean; message: string }>;

  // Koperasi & POS Kasir Actions
  produkKoperasiList: ProdukKoperasi[];
  transaksiKoperasiList: TransaksiKoperasi[];
  addProdukKoperasi: (produk: Omit<ProdukKoperasi, 'id'>) => Promise<void>;
  updateProdukKoperasi: (id: string, updates: Partial<ProdukKoperasi>) => Promise<void>;
  deleteProdukKoperasi: (id: string) => Promise<void>;
  prosesTransaksiKoperasi: (data: Omit<TransaksiKoperasi, 'id' | 'nomorNota'>) => Promise<{ success: boolean; message: string; transaksi?: TransaksiKoperasi }>;

  resetToDefaultData: () => void;
  resetAcademicAndTransactions: () => void;
  resetStudentsAndTeachers: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  triggerConfetti: () => void;
  selectedSiswaForDetail: Siswa | null;
  setSelectedSiswaForDetail: (siswa: Siswa | null) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-admin',
  name: 'King Salman AF',
  email: 'bahrululumku@gmail.com',
  role: 'admin',
  nip: '198205142008011015',
  photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
};

const MadrasahContext = createContext<MadrasahContextType | undefined>(undefined);

export const MadrasahProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('madrasah_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Dr. KH. Abdullah Munir, M.Pd.I') {
          return DEFAULT_USER;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [madrasahInfo, setMadrasahInfo] = useState<MadrasahInfo>(() => {
    const saved = localStorage.getItem('madrasah_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved data was the old default placeholder Al-Azhar, auto-migrate to new Madrasah Bahrul Ulum
        if (parsed.nama === 'Madrasah Unggulan Terpadu Al-Azhar' || !parsed.nama) {
          return MADRASAH_INFO;
        }
        return {
          ...parsed,
          logoUrl: formatImageUrl(parsed.logoUrl)
        };
      } catch (e) {
        return MADRASAH_INFO;
      }
    }
    return MADRASAH_INFO;
  });

  const [activeRole, setActiveRole] = useState<UserRole>(currentUser.role);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSiswaForDetail, setSelectedSiswaForDetail] = useState<Siswa | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Collections
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const saved = localStorage.getItem('madrasah_siswa');
    return saved ? JSON.parse(saved) : INITIAL_SISWA;
  });

  const [guruList, setGuruList] = useState<Guru[]>(() => {
    const saved = localStorage.getItem('madrasah_guru');
    return saved ? JSON.parse(saved) : INITIAL_GURU;
  });

  const [kelasList, setKelasList] = useState<Kelas[]>(() => {
    const saved = localStorage.getItem('madrasah_kelas');
    return saved ? JSON.parse(saved) : INITIAL_KELAS;
  });

  const [absensiList, setAbsensiList] = useState<AbsensiRecord[]>(() => {
    const saved = localStorage.getItem('madrasah_absensi');
    return saved ? JSON.parse(saved) : INITIAL_ABSENSI;
  });

  const [absensiGuruList, setAbsensiGuruList] = useState<AbsensiGuruRecord[]>(() => {
    const saved = localStorage.getItem('madrasah_absensi_guru');
    return saved ? JSON.parse(saved) : INITIAL_ABSENSI_GURU;
  });

  const [tahfidzList, setTahfidzList] = useState<TahfidzRecord[]>(() => {
    const saved = localStorage.getItem('madrasah_tahfidz');
    return saved ? JSON.parse(saved) : INITIAL_TAHFIDZ;
  });

  const [nilaiList, setNilaiList] = useState<NilaiMapel[]>(() => {
    const saved = localStorage.getItem('madrasah_nilai');
    return saved ? JSON.parse(saved) : INITIAL_NILAI;
  });

  const [tagihanList, setTagihanList] = useState<TagihanSPP[]>(() => {
    const saved = localStorage.getItem('madrasah_tagihan');
    return saved ? JSON.parse(saved) : INITIAL_TAGIHAN;
  });

  const [kanalPembayaranList, setKanalPembayaranList] = useState<KanalPembayaran[]>(() => {
    const saved = localStorage.getItem('madrasah_kanal_pembayaran');
    return saved ? JSON.parse(saved) : INITIAL_KANAL_PEMBAYARAN;
  });

  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(() => {
    const saved = localStorage.getItem('madrasah_pengumuman');
    return saved ? JSON.parse(saved) : INITIAL_PENGUMUMAN;
  });

  const [jadwalList, setJadwalList] = useState<JadwalPelajaran[]>(() => {
    const saved = localStorage.getItem('madrasah_jadwal');
    return saved ? JSON.parse(saved) : INITIAL_JADWAL;
  });

  const [tabunganAccounts, setTabunganAccounts] = useState<TabunganAccount[]>(() => {
    const saved = localStorage.getItem('madrasah_tabungan_accounts');
    return saved ? JSON.parse(saved) : INITIAL_TABUNGAN_ACCOUNTS;
  });

  const [tabunganTransaksi, setTabunganTransaksi] = useState<TabunganTransaksi[]>(() => {
    const saved = localStorage.getItem('madrasah_tabungan_transaksi');
    return saved ? JSON.parse(saved) : INITIAL_TABUNGAN_TRANSAKSI;
  });

  const [produkKoperasiList, setProdukKoperasiList] = useState<ProdukKoperasi[]>(() => {
    const saved = localStorage.getItem('madrasah_produk_koperasi');
    return saved ? JSON.parse(saved) : INITIAL_PRODUK_KOPERASI;
  });

  const [transaksiKoperasiList, setTransaksiKoperasiList] = useState<TransaksiKoperasi[]>(() => {
    const saved = localStorage.getItem('madrasah_transaksi_koperasi');
    return saved ? JSON.parse(saved) : INITIAL_TRANSAKSI_KOPERASI;
  });

  const [mutabaahToday, setMutabaahToday] = useState<MutabaahHarian>({
    siswaId: 'sis-01',
    tanggal: new Date().toISOString().split('T')[0],
    sholatWajib: { subuh: true, dzuhur: true, ashar: true, maghrib: false, isya: false },
    sholatSunnah: { dhuha: true, tahajjud: true, rawatib: true },
    tilawahHalaman: 4,
    dzikirPagi: true,
    dzikirPetang: false,
    puasaSunnah: false,
    berbuatBaik: 'Membantu ustadz merapikan mushaf Al-Qur\'an di masjid'
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('madrasah_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('madrasah_info', JSON.stringify(madrasahInfo));
  }, [madrasahInfo]);

  useEffect(() => {
    localStorage.setItem('madrasah_siswa', JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem('madrasah_guru', JSON.stringify(guruList));
  }, [guruList]);

  useEffect(() => {
    localStorage.setItem('madrasah_kelas', JSON.stringify(kelasList));
  }, [kelasList]);

  useEffect(() => {
    localStorage.setItem('madrasah_absensi', JSON.stringify(absensiList));
  }, [absensiList]);

  useEffect(() => {
    localStorage.setItem('madrasah_absensi_guru', JSON.stringify(absensiGuruList));
  }, [absensiGuruList]);

  useEffect(() => {
    localStorage.setItem('madrasah_tahfidz', JSON.stringify(tahfidzList));
  }, [tahfidzList]);

  useEffect(() => {
    localStorage.setItem('madrasah_nilai', JSON.stringify(nilaiList));
  }, [nilaiList]);

  useEffect(() => {
    localStorage.setItem('madrasah_tagihan', JSON.stringify(tagihanList));
  }, [tagihanList]);

  useEffect(() => {
    localStorage.setItem('madrasah_kanal_pembayaran', JSON.stringify(kanalPembayaranList));
  }, [kanalPembayaranList]);

  useEffect(() => {
    localStorage.setItem('madrasah_pengumuman', JSON.stringify(pengumumanList));
  }, [pengumumanList]);

  useEffect(() => {
    localStorage.setItem('madrasah_jadwal', JSON.stringify(jadwalList));
  }, [jadwalList]);

  useEffect(() => {
    localStorage.setItem('madrasah_tabungan_accounts', JSON.stringify(tabunganAccounts));
  }, [tabunganAccounts]);

  useEffect(() => {
    localStorage.setItem('madrasah_tabungan_transaksi', JSON.stringify(tabunganTransaksi));
  }, [tabunganTransaksi]);

  useEffect(() => {
    localStorage.setItem('madrasah_produk_koperasi', JSON.stringify(produkKoperasiList));
  }, [produkKoperasiList]);

  useEffect(() => {
    localStorage.setItem('madrasah_transaksi_koperasi', JSON.stringify(transaksiKoperasiList));
  }, [transaksiKoperasiList]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map to user profile
        setCurrentUser(prev => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Pengguna Madrasah',
          email: firebaseUser.email || 'user@alazhar.sch.id',
          photoUrl: firebaseUser.photoURL || prev.photoUrl,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#fbbf24', '#064e3b']
      });
    } catch {
      // ignore in iframe fallback
    }
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'admin') {
      setCurrentUser({
        id: 'usr-admin',
        name: 'Dr. KH. Abdullah Munir, M.Pd.I',
        email: 'kepala@madrasah-alazhar.sch.id',
        role: 'admin',
        nip: '197508152002121003',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      });
    } else if (role === 'guru') {
      setCurrentUser({
        id: 'gur-01',
        name: 'Ustadz Ahmad Fauzi, Lc., M.Ag.',
        email: 'ahmad.fauzi@madrasah-alazhar.sch.id',
        role: 'guru',
        nip: '198205142008011005',
        kelas: '9A Unggulan',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      });
    } else if (role === 'siswa') {
      setCurrentUser({
        id: 'sis-01',
        name: 'Muhammad Rayhan Al-Fatih',
        email: 'rayhan.alfatih@santri.alazhar.sch.id',
        role: 'siswa',
        nisn: '0089123451',
        kelas: '9A Unggulan',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
      });
    } else if (role === 'wali') {
      setCurrentUser({
        id: 'wali-01',
        name: 'H. Bambang Sulistyo (Wali Rayhan)',
        email: 'bambang.sulistyo@gmail.com',
        role: 'wali',
        studentLinkedId: 'sis-01',
        phone: '081234567890',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser({
        id: user.uid,
        name: user.displayName || 'Akun Google Madrasah',
        email: user.email || '',
        role: activeRole,
        photoUrl: user.photoURL || undefined,
      });
      triggerConfetti();
    } catch (err) {
      console.warn('Google Sign-in popup fallback (using direct state):', err);
      // Demo fallback login
      setCurrentUser(prev => ({
        ...prev,
        name: 'Pengguna Terhubung (Google Auth)',
        email: 'timsultankendal@gmail.com'
      }));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout:', err);
    }
    switchRole('admin');
  };

  // Actions
  const addSiswa = async (siswaData: Omit<Siswa, 'id'>) => {
    const newSiswa: Siswa = {
      ...siswaData,
      id: `sis-${Date.now().toString().slice(-4)}`,
    };
    setSiswaList(prev => [newSiswa, ...prev]);
    triggerConfetti();
    try {
      await setDoc(doc(db, 'students', newSiswa.id), newSiswa);
    } catch (e) {
      console.warn('Firestore fallback sync:', e);
    }
  };

  const addBulkSiswa = async (siswaArray: Omit<Siswa, 'id'>[]): Promise<number> => {
    if (!siswaArray || siswaArray.length === 0) return 0;
    const timestamp = Date.now();
    const newStudents: Siswa[] = siswaArray.map((item, idx) => ({
      ...item,
      id: `sis-${timestamp + idx}`,
    }));

    setSiswaList(prev => [...newStudents, ...prev]);
    triggerConfetti();

    // Firestore batch write attempt
    try {
      const batch = writeBatch(db);
      newStudents.forEach(st => {
        const ref = doc(db, 'students', st.id);
        batch.set(ref, st);
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore bulk sync fallback:', e);
    }

    return newStudents.length;
  };

  const updateSiswa = async (id: string, data: Partial<Siswa>) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    try {
      await setDoc(doc(db, 'students', id), data, { merge: true });
    } catch (e) {
      console.warn('Firestore fallback sync:', e);
    }
  };

  const deleteSiswa = async (id: string) => {
    setSiswaList(prev => prev.filter(s => s.id !== id));
  };

  const addGuru = async (guruData: Omit<Guru, 'id'>) => {
    const newGuru: Guru = {
      ...guruData,
      id: `gur-${Date.now().toString().slice(-4)}`,
    };
    setGuruList(prev => [newGuru, ...prev]);
    triggerConfetti();
  };

  const updateGuru = async (id: string, data: Partial<Guru>) => {
    setGuruList(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const deleteGuru = async (id: string) => {
    setGuruList(prev => prev.filter(g => g.id !== id));
  };

  const addKelas = async (kelasData: Omit<Kelas, 'id'>) => {
    const newKelas: Kelas = {
      ...kelasData,
      id: `kel-${Date.now().toString().slice(-4)}`,
    };
    setKelasList(prev => [...prev, newKelas]);
    triggerConfetti();
  };

  const updateKelas = async (id: string, data: Partial<Kelas>) => {
    setKelasList(prev => prev.map(k => k.id === id ? { ...k, ...data } : k));
    triggerConfetti();
  };

  const deleteKelas = async (id: string) => {
    setKelasList(prev => prev.filter(k => k.id !== id));
  };

  const recordAbsensi = async (recordData: Omit<AbsensiRecord, 'id'>) => {
    const newRec: AbsensiRecord = {
      ...recordData,
      id: `abs-${Date.now().toString().slice(-4)}`,
    };
    setAbsensiList(prev => [newRec, ...prev]);
    triggerConfetti();
    try {
      await setDoc(doc(db, 'attendance', newRec.id), newRec);
    } catch (e) {
      console.warn('Firestore attendance sync:', e);
    }
  };

  const recordBulkAbsensi = async (recordsData: Omit<AbsensiRecord, 'id'>[]) => {
    const timestamp = Date.now().toString();
    const newRecords: AbsensiRecord[] = recordsData.map((rec, index) => ({
      ...rec,
      id: `abs-${timestamp.slice(-4)}-${index}`,
    }));
    setAbsensiList(prev => [...newRecords, ...prev]);
    triggerConfetti();
    try {
      for (const rec of newRecords) {
        await setDoc(doc(db, 'attendance', rec.id), rec);
      }
    } catch (e) {
      console.warn('Firestore bulk attendance sync:', e);
    }
  };

  const recordAbsensiGuru = async (recordData: Omit<AbsensiGuruRecord, 'id'>) => {
    const newRec: AbsensiGuruRecord = {
      ...recordData,
      id: `absg-${Date.now().toString().slice(-4)}`,
    };
    setAbsensiGuruList(prev => [newRec, ...prev]);
    triggerConfetti();
    try {
      await setDoc(doc(db, 'attendance_guru', newRec.id), newRec);
    } catch (e) {
      console.warn('Firestore teacher attendance sync:', e);
    }
  };

  const recordTahfidz = async (recData: Omit<TahfidzRecord, 'id'>) => {
    const newTah: TahfidzRecord = {
      ...recData,
      id: `tah-${Date.now().toString().slice(-4)}`,
    };
    setTahfidzList(prev => [newTah, ...prev]);
    
    // Update student progress
    if (recData.jenis === 'ziyadah') {
      setSiswaList(prev => prev.map(s => {
        if (s.id === recData.siswaId) {
          const added = 0.1;
          return { ...s, hafalanTercapai: Number(Math.min(s.targetJuz, s.hafalanTercapai + added).toFixed(1)) };
        }
        return s;
      }));
    }
    triggerConfetti();
  };

  const updateMutabaah = (data: Partial<MutabaahHarian>) => {
    setMutabaahToday(prev => ({ ...prev, ...data }));
  };

  const saveNilai = async (nilaiData: Omit<NilaiMapel, 'id'> | NilaiMapel) => {
    if ('id' in nilaiData && nilaiData.id) {
      setNilaiList(prev => prev.map(n => n.id === nilaiData.id ? (nilaiData as NilaiMapel) : n));
    } else {
      const newNilai: NilaiMapel = {
        ...(nilaiData as Omit<NilaiMapel, 'id'>),
        id: `nil-${Date.now().toString().slice(-4)}`,
      };
      setNilaiList(prev => [newNilai, ...prev]);
    }
    triggerConfetti();
  };

  const bayarTagihan = async (id: string, metode: string) => {
    const kwitansi = `KW-AZHAR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTagihanList(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'lunas',
          tanggalBayar: new Date().toISOString().split('T')[0],
          metodeBayar: metode,
          nomorKwitansi: kwitansi,
        };
      }
      return t;
    }));
    triggerConfetti();
  };

  const addTagihan = async (tagihanData: Omit<TagihanSPP, 'id'>) => {
    const newTagihan: TagihanSPP = {
      ...tagihanData,
      id: `spp-${Date.now().toString().slice(-4)}`,
    };
    setTagihanList(prev => [newTagihan, ...prev]);
  };

  const addKanalPembayaran = async (kanalData: Omit<KanalPembayaran, 'id'>) => {
    const newKanal: KanalPembayaran = {
      ...kanalData,
      id: `pay-${Date.now().toString().slice(-4)}`,
    };
    setKanalPembayaranList(prev => [...prev, newKanal]);
    triggerConfetti();
  };

  const updateKanalPembayaran = async (id: string, updates: Partial<KanalPembayaran>) => {
    setKanalPembayaranList(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
    triggerConfetti();
  };

  const deleteKanalPembayaran = async (id: string) => {
    setKanalPembayaranList(prev => prev.filter(k => k.id !== id));
  };

  const toggleKanalPembayaran = async (id: string) => {
    setKanalPembayaranList(prev => prev.map(k => k.id === id ? { ...k, aktif: !k.aktif } : k));
  };

  const addPengumuman = async (pengumumanData: Omit<Pengumuman, 'id'>) => {
    const newAnn: Pengumuman = {
      ...pengumumanData,
      id: `ann-${Date.now().toString().slice(-4)}`,
    };
    setPengumumanList(prev => [newAnn, ...prev]);
    triggerConfetti();
  };

  const updatePengumuman = async (id: string, pengumumanData: Partial<Pengumuman>) => {
    setPengumumanList(prev => prev.map(p => p.id === id ? { ...p, ...pengumumanData } : p));
    triggerConfetti();
  };

  const deletePengumuman = async (id: string) => {
    setPengumumanList(prev => prev.filter(p => p.id !== id));
  };

  const addJadwal = async (jadwalData: Omit<JadwalPelajaran, 'id'>) => {
    const newJadwal: JadwalPelajaran = {
      ...jadwalData,
      id: `jad-${Date.now().toString().slice(-4)}`,
    };
    setJadwalList(prev => [...prev, newJadwal]);
    triggerConfetti();
  };

  const updateJadwal = async (id: string, jadwalData: Partial<JadwalPelajaran>) => {
    setJadwalList(prev => prev.map(j => j.id === id ? { ...j, ...jadwalData } : j));
    triggerConfetti();
  };

  const deleteJadwal = async (id: string) => {
    setJadwalList(prev => prev.filter(j => j.id !== id));
  };

  // --- TABUNGAN SANTRI & ASATIDZ ACTIONS ---
  const addTabunganAccount = async (
    accData: Omit<TabunganAccount, 'id' | 'saldo' | 'tanggalBuka'>,
    saldoAwal: number = 0
  ): Promise<TabunganAccount> => {
    const prefix = accData.ownerType === 'siswa' ? 'TBS' : 'TBA';
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const newAcc: TabunganAccount = {
      ...accData,
      id: `tab-${accData.ownerType === 'siswa' ? 'san' : 'gur'}-${Date.now().toString().slice(-4)}`,
      nomorRekening: `${prefix}-${randomCode}`,
      saldo: Number(saldoAwal) || 0,
      tanggalBuka: new Date().toISOString().split('T')[0],
    };

    setTabunganAccounts(prev => [newAcc, ...prev]);

    if (saldoAwal > 0) {
      const now = new Date();
      const initialTrx: TabunganTransaksi = {
        id: `trx-tab-${Date.now().toString().slice(-4)}`,
        rekeningId: newAcc.id,
        nomorRekening: newAcc.nomorRekening,
        ownerNama: newAcc.ownerNama,
        ownerType: newAcc.ownerType,
        jenis: 'setor',
        nominal: Number(saldoAwal),
        saldoSetelah: Number(saldoAwal),
        kategori: 'Setoran Awal Pembukaan Rekening',
        tanggal: now.toISOString().split('T')[0],
        waktu: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        petugas: currentUser.name || 'Teller Baitul Maal',
        metode: 'Tunai Teller Baitul Maal',
        nomorKwitansi: `KW-TAB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        keterangan: 'Setoran Awal saat pembukaan buku tabungan'
      };
      setTabunganTransaksi(prev => [initialTrx, ...prev]);
    }

    triggerConfetti();
    return newAcc;
  };

  const updateTabunganAccount = async (id: string, data: Partial<TabunganAccount>) => {
    setTabunganAccounts(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    triggerConfetti();
  };

  const deleteTabunganAccount = async (id: string) => {
    setTabunganAccounts(prev => prev.filter(a => a.id !== id));
  };

  const setorTabungan = async (
    rekeningId: string,
    nominal: number,
    kategori: string,
    keterangan: string,
    metode: string
  ): Promise<TabunganTransaksi | null> => {
    const acc = tabunganAccounts.find(a => a.id === rekeningId);
    if (!acc) return null;

    const amount = Number(nominal);
    if (amount <= 0) return null;

    const saldoBaru = acc.saldo + amount;
    const now = new Date();
    const newTrx: TabunganTransaksi = {
      id: `trx-tab-${Date.now().toString().slice(-4)}`,
      rekeningId: acc.id,
      nomorRekening: acc.nomorRekening,
      ownerNama: acc.ownerNama,
      ownerType: acc.ownerType,
      jenis: 'setor',
      nominal: amount,
      saldoSetelah: saldoBaru,
      kategori: kategori || 'Uang Saku Santri',
      tanggal: now.toISOString().split('T')[0],
      waktu: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      petugas: currentUser.name || 'Teller Baitul Maal',
      metode: metode || 'Tunai Teller Baitul Maal',
      nomorKwitansi: `KW-TAB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      keterangan: keterangan || 'Setoran Tabungan Masuk'
    };

    setTabunganAccounts(prev => prev.map(a => a.id === rekeningId ? { ...a, saldo: saldoBaru } : a));
    setTabunganTransaksi(prev => [newTrx, ...prev]);
    triggerConfetti();
    return newTrx;
  };

  const tarikTabungan = async (
    rekeningId: string,
    nominal: number,
    kategori: string,
    keterangan: string,
    metode: string
  ): Promise<{ success: boolean; message: string; transaksi?: TabunganTransaksi }> => {
    const acc = tabunganAccounts.find(a => a.id === rekeningId);
    if (!acc) return { success: false, message: 'Rekening tidak ditemukan' };

    const amount = Number(nominal);
    if (amount <= 0) return { success: false, message: 'Nominal tidak valid' };

    if (acc.status !== 'aktif') {
      return { success: false, message: 'Rekening berstatus dibekukan atau nonaktif' };
    }

    if (acc.saldo < amount) {
      return { success: false, message: `Saldo tidak mencukupi (Tersedia: Rp ${acc.saldo.toLocaleString('id-ID')})` };
    }

    // Limit harian check for santri
    if (acc.ownerType === 'siswa' && acc.limitHarianTarik && acc.limitHarianTarik > 0 && amount > acc.limitHarianTarik) {
      return { 
        success: false, 
        message: `Nominal melebihi limit harian uang saku santri (Maksimal Rp ${acc.limitHarianTarik.toLocaleString('id-ID')}/hari)` 
      };
    }

    const saldoBaru = acc.saldo - amount;
    const now = new Date();
    const newTrx: TabunganTransaksi = {
      id: `trx-tab-${Date.now().toString().slice(-4)}`,
      rekeningId: acc.id,
      nomorRekening: acc.nomorRekening,
      ownerNama: acc.ownerNama,
      ownerType: acc.ownerType,
      jenis: 'tarik',
      nominal: amount,
      saldoSetelah: saldoBaru,
      kategori: kategori || 'Uang Saku Santri',
      tanggal: now.toISOString().split('T')[0],
      waktu: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      petugas: currentUser.name || 'Teller Baitul Maal',
      metode: metode || 'Smart Card E-KTS QR',
      nomorKwitansi: `KW-TAB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      keterangan: keterangan || 'Penarikan Uang Saku'
    };

    setTabunganAccounts(prev => prev.map(a => a.id === rekeningId ? { ...a, saldo: saldoBaru } : a));
    setTabunganTransaksi(prev => [newTrx, ...prev]);
    triggerConfetti();
    return { success: true, message: 'Penarikan berhasil diproses', transaksi: newTrx };
  };

  const bayarSPPDenganTabungan = async (
    rekeningId: string,
    tagihanId: string
  ): Promise<{ success: boolean; message: string }> => {
    const acc = tabunganAccounts.find(a => a.id === rekeningId);
    const tagihan = tagihanList.find(t => t.id === tagihanId);

    if (!acc || !tagihan) return { success: false, message: 'Data rekening atau tagihan tidak valid' };
    if (tagihan.status === 'lunas') return { success: false, message: 'Tagihan ini sudah lunas sebelumnya' };

    if (acc.saldo < tagihan.nominal) {
      return { 
        success: false, 
        message: `Saldo tabungan (Rp ${acc.saldo.toLocaleString('id-ID')}) kurang dari nominal SPP (Rp ${tagihan.nominal.toLocaleString('id-ID')})` 
      };
    }

    const saldoBaru = acc.saldo - tagihan.nominal;
    const now = new Date();
    const kwitansiSPP = `KW-AZHAR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTrx: TabunganTransaksi = {
      id: `trx-tab-${Date.now().toString().slice(-4)}`,
      rekeningId: acc.id,
      nomorRekening: acc.nomorRekening,
      ownerNama: acc.ownerNama,
      ownerType: acc.ownerType,
      jenis: 'autodebet_spp',
      nominal: tagihan.nominal,
      saldoSetelah: saldoBaru,
      kategori: 'Pembayaran SPP (Autodebet)',
      tanggal: now.toISOString().split('T')[0],
      waktu: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      petugas: 'Sistem Autodebet Baitul Maal',
      metode: 'Autodebet Saldo Tabungan Santri',
      nomorKwitansi: kwitansiSPP,
      keterangan: `Pembayaran ${tagihan.judulTagihan} (${tagihan.bulan}) via Saldo Tabungan`
    };

    setTabunganAccounts(prev => prev.map(a => a.id === rekeningId ? { ...a, saldo: saldoBaru } : a));
    setTabunganTransaksi(prev => [newTrx, ...prev]);

    setTagihanList(prev => prev.map(t => {
      if (t.id === tagihanId) {
        return {
          ...t,
          status: 'lunas',
          tanggalBayar: now.toISOString().split('T')[0],
          metodeBayar: 'Autodebet Saldo Tabungan',
          nomorKwitansi: kwitansiSPP,
          catatan: 'Lunas otomatis dipotong dari Tabungan Santri'
        };
      }
      return t;
    }));

    triggerConfetti();
    return { success: true, message: `Berhasil! ${tagihan.judulTagihan} telah lunas melalui saldo tabungan.` };
  };

  // Koperasi & POS Functions
  const addProdukKoperasi = async (produkData: Omit<ProdukKoperasi, 'id'>) => {
    const newProd: ProdukKoperasi = {
      ...produkData,
      id: `prd-${Date.now().toString().slice(-4)}`,
      terjualCount: produkData.terjualCount || 0
    };
    setProdukKoperasiList(prev => [newProd, ...prev]);
    triggerConfetti();
  };

  const updateProdukKoperasi = async (id: string, updates: Partial<ProdukKoperasi>) => {
    setProdukKoperasiList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    triggerConfetti();
  };

  const deleteProdukKoperasi = async (id: string) => {
    setProdukKoperasiList(prev => prev.filter(p => p.id !== id));
  };

  const prosesTransaksiKoperasi = async (data: Omit<TransaksiKoperasi, 'id' | 'nomorNota'>): Promise<{ success: boolean; message: string; transaksi?: TransaksiKoperasi }> => {
    const now = new Date();
    const notaNumber = `NT-KOP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Handle payment from Student/Teacher Savings (Tabungan)
    if (data.metodeBayar === 'saldo_santri') {
      let targetAccount = data.rekeningTabunganId 
        ? tabunganAccounts.find(a => a.id === data.rekeningTabunganId)
        : tabunganAccounts.find(a => a.ownerId === data.pembeliId && a.ownerType === (data.pembeliTipe === 'guru' ? 'guru' : 'siswa'));
      
      if (!targetAccount) {
        // Fallback search by name
        targetAccount = tabunganAccounts.find(a => a.ownerNama.toLowerCase().includes(data.pembeliNama.toLowerCase()));
      }

      if (!targetAccount) {
        return {
          success: false,
          message: `Rekening Tabungan Santri/Nasabah atas nama "${data.pembeliNama}" tidak ditemukan.`
        };
      }

      if (targetAccount.status !== 'aktif') {
        return {
          success: false,
          message: `Rekening Tabungan (${targetAccount.nomorRekening}) berstatus ${targetAccount.status.toUpperCase()}. Transaksi ditolak.`
        };
      }

      if (targetAccount.saldo < data.totalAkhir) {
        return {
          success: false,
          message: `Saldo tabungan tidak mencukupi. Saldo saat ini: Rp ${targetAccount.saldo.toLocaleString('id-ID')}, Total belanja: Rp ${data.totalAkhir.toLocaleString('id-ID')}`
        };
      }

      if (targetAccount.limitHarianTarik > 0 && data.totalAkhir > targetAccount.limitHarianTarik) {
        return {
          success: false,
          message: `Total belanja (Rp ${data.totalAkhir.toLocaleString('id-ID')}) melebihi limit harian Smart Card santri (Rp ${targetAccount.limitHarianTarik.toLocaleString('id-ID')})`
        };
      }

      // Deduct from tabungan
      const saldoBaru = targetAccount.saldo - data.totalAkhir;
      const tabTrx: TabunganTransaksi = {
        id: `trx-tab-${Date.now().toString().slice(-4)}`,
        rekeningId: targetAccount.id,
        nomorRekening: targetAccount.nomorRekening,
        ownerNama: targetAccount.ownerNama,
        ownerType: targetAccount.ownerType,
        jenis: 'belanja_koperasi',
        nominal: data.totalAkhir,
        saldoSetelah: saldoBaru,
        kategori: 'Belanja Koperasi Santri',
        tanggal: now.toISOString().split('T')[0],
        waktu: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        petugas: data.kasir || 'Kasir Koperasi Madrasah',
        metode: 'Smart Card E-KTS QR',
        nomorKwitansi: notaNumber,
        keterangan: `Pembelian ${data.totalItem} item produk di Koperasi Pesantren`
      };

      setTabunganAccounts(prev => prev.map(a => a.id === targetAccount.id ? { ...a, saldo: saldoBaru } : a));
      setTabunganTransaksi(prev => [tabTrx, ...prev]);
    }

    // Deduct stock for products
    setProdukKoperasiList(prev => prev.map(prod => {
      const purchasedItem = data.items.find(it => it.produkId === prod.id);
      if (purchasedItem) {
        const newStock = Math.max(0, prod.stok - purchasedItem.jumlah);
        const newTerjual = (prod.terjualCount || 0) + purchasedItem.jumlah;
        return {
          ...prod,
          stok: newStock,
          terjualCount: newTerjual
        };
      }
      return prod;
    }));

    const newTransaksi: TransaksiKoperasi = {
      ...data,
      id: `trx-kop-${Date.now().toString().slice(-4)}`,
      nomorNota: notaNumber
    };

    setTransaksiKoperasiList(prev => [newTransaksi, ...prev]);
    triggerConfetti();

    return {
      success: true,
      message: `Alhamdulillah! Transaksi berhasil diselesaikan. Nota: ${notaNumber}`,
      transaksi: newTransaksi
    };
  };

  const updateMadrasahInfo = (info: Partial<MadrasahInfo>) => {
    const formatted = {
      ...info,
      ...(info.logoUrl !== undefined ? { logoUrl: formatImageUrl(info.logoUrl) } : {})
    };
    setMadrasahInfo(prev => ({ ...prev, ...formatted }));
    triggerConfetti();
  };

  const resetMadrasahInfo = () => {
    setMadrasahInfo(MADRASAH_INFO);
    localStorage.setItem('madrasah_info', JSON.stringify(MADRASAH_INFO));
    triggerConfetti();
  };

  const resetStudentsAndTeachers = () => {
    setSiswaList(INITIAL_SISWA);
    setGuruList(INITIAL_GURU);
    setTabunganAccounts(INITIAL_TABUNGAN_ACCOUNTS);
    localStorage.setItem('madrasah_siswa', JSON.stringify(INITIAL_SISWA));
    localStorage.setItem('madrasah_guru', JSON.stringify(INITIAL_GURU));
    localStorage.setItem('madrasah_tabungan_accounts', JSON.stringify(INITIAL_TABUNGAN_ACCOUNTS));
    triggerConfetti();
  };

  const resetAcademicAndTransactions = () => {
    setAbsensiList(INITIAL_ABSENSI);
    setTahfidzList(INITIAL_TAHFIDZ);
    setNilaiList(INITIAL_NILAI);
    setTagihanList(INITIAL_TAGIHAN);
    setPengumumanList(INITIAL_PENGUMUMAN);
    setJadwalList(INITIAL_JADWAL);
    setTabunganTransaksi(INITIAL_TABUNGAN_TRANSAKSI);
    setMutabaahToday({
      siswaId: 'sis-01',
      tanggal: new Date().toISOString().split('T')[0],
      sholatWajib: { subuh: true, dzuhur: true, ashar: true, maghrib: false, isya: false },
      sholatSunnah: { dhuha: true, tahajjud: true, rawatib: true },
      tilawahHalaman: 4,
      dzikirPagi: true,
      dzikirPetang: false,
      puasaSunnah: false,
      berbuatBaik: 'Membantu ustadz merapikan mushaf Al-Qur\'an di masjid'
    });
    localStorage.setItem('madrasah_absensi', JSON.stringify(INITIAL_ABSENSI));
    localStorage.setItem('madrasah_tahfidz', JSON.stringify(INITIAL_TAHFIDZ));
    localStorage.setItem('madrasah_nilai', JSON.stringify(INITIAL_NILAI));
    localStorage.setItem('madrasah_tagihan', JSON.stringify(INITIAL_TAGIHAN));
    localStorage.setItem('madrasah_pengumuman', JSON.stringify(INITIAL_PENGUMUMAN));
    localStorage.setItem('madrasah_jadwal', JSON.stringify(INITIAL_JADWAL));
    localStorage.setItem('madrasah_tabungan_transaksi', JSON.stringify(INITIAL_TABUNGAN_TRANSAKSI));
    triggerConfetti();
  };

  const resetToDefaultData = () => {
    setMadrasahInfo(MADRASAH_INFO);
    setSiswaList(INITIAL_SISWA);
    setGuruList(INITIAL_GURU);
    setKelasList(INITIAL_KELAS);
    setAbsensiList(INITIAL_ABSENSI);
    setTahfidzList(INITIAL_TAHFIDZ);
    setNilaiList(INITIAL_NILAI);
    setTagihanList(INITIAL_TAGIHAN);
    setPengumumanList(INITIAL_PENGUMUMAN);
    setJadwalList(INITIAL_JADWAL);
    setTabunganAccounts(INITIAL_TABUNGAN_ACCOUNTS);
    setTabunganTransaksi(INITIAL_TABUNGAN_TRANSAKSI);
    setProdukKoperasiList(INITIAL_PRODUK_KOPERASI);
    setTransaksiKoperasiList(INITIAL_TRANSAKSI_KOPERASI);
    setMutabaahToday({
      siswaId: 'sis-01',
      tanggal: new Date().toISOString().split('T')[0],
      sholatWajib: { subuh: true, dzuhur: true, ashar: true, maghrib: false, isya: false },
      sholatSunnah: { dhuha: true, tahajjud: true, rawatib: true },
      tilawahHalaman: 4,
      dzikirPagi: true,
      dzikirPetang: false,
      puasaSunnah: false,
      berbuatBaik: 'Membantu ustadz merapikan mushaf Al-Qur\'an di masjid'
    });
    
    // Explicit sync to localStorage
    localStorage.setItem('madrasah_info', JSON.stringify(MADRASAH_INFO));
    localStorage.setItem('madrasah_siswa', JSON.stringify(INITIAL_SISWA));
    localStorage.setItem('madrasah_guru', JSON.stringify(INITIAL_GURU));
    localStorage.setItem('madrasah_kelas', JSON.stringify(INITIAL_KELAS));
    localStorage.setItem('madrasah_absensi', JSON.stringify(INITIAL_ABSENSI));
    localStorage.setItem('madrasah_tahfidz', JSON.stringify(INITIAL_TAHFIDZ));
    localStorage.setItem('madrasah_nilai', JSON.stringify(INITIAL_NILAI));
    localStorage.setItem('madrasah_tagihan', JSON.stringify(INITIAL_TAGIHAN));
    localStorage.setItem('madrasah_pengumuman', JSON.stringify(INITIAL_PENGUMUMAN));
    localStorage.setItem('madrasah_jadwal', JSON.stringify(INITIAL_JADWAL));
    localStorage.setItem('madrasah_tabungan_accounts', JSON.stringify(INITIAL_TABUNGAN_ACCOUNTS));
    localStorage.setItem('madrasah_tabungan_transaksi', JSON.stringify(INITIAL_TABUNGAN_TRANSAKSI));
    localStorage.setItem('madrasah_produk_koperasi', JSON.stringify(INITIAL_PRODUK_KOPERASI));
    localStorage.setItem('madrasah_transaksi_koperasi', JSON.stringify(INITIAL_TRANSAKSI_KOPERASI));
    triggerConfetti();
  };

  const exportDatabaseJSON = () => {
    const backupData = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      madrasahInfo,
      siswaList,
      guruList,
      kelasList,
      absensiList,
      tahfidzList,
      nilaiList,
      tagihanList,
      pengumumanList,
      jadwalList,
      tabunganAccounts,
      tabunganTransaksi,
      produkKoperasiList,
      transaksiKoperasiList
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.madrasahInfo) setMadrasahInfo(data.madrasahInfo);
      if (Array.isArray(data.siswaList)) setSiswaList(data.siswaList);
      if (Array.isArray(data.guruList)) setGuruList(data.guruList);
      if (Array.isArray(data.kelasList)) setKelasList(data.kelasList);
      if (Array.isArray(data.absensiList)) setAbsensiList(data.absensiList);
      if (Array.isArray(data.tahfidzList)) setTahfidzList(data.tahfidzList);
      if (Array.isArray(data.nilaiList)) setNilaiList(data.nilaiList);
      if (Array.isArray(data.tagihanList)) setTagihanList(data.tagihanList);
      if (Array.isArray(data.pengumumanList)) setPengumumanList(data.pengumumanList);
      if (Array.isArray(data.jadwalList)) setJadwalList(data.jadwalList);
      if (Array.isArray(data.tabunganAccounts)) setTabunganAccounts(data.tabunganAccounts);
      if (Array.isArray(data.tabunganTransaksi)) setTabunganTransaksi(data.tabunganTransaksi);
      if (Array.isArray(data.produkKoperasiList)) setProdukKoperasiList(data.produkKoperasiList);
      if (Array.isArray(data.transaksiKoperasiList)) setTransaksiKoperasiList(data.transaksiKoperasiList);
      triggerConfetti();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <MadrasahContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRole,
        switchRole,
        loginWithGoogle,
        logout,
        activeTab,
        setActiveTab,
        madrasahInfo,
        updateMadrasahInfo,
        resetMadrasahInfo,
        resetStudentsAndTeachers,
        resetAcademicAndTransactions,
        siswaList,
        guruList,
        kelasList,
        absensiList,
        absensiGuruList,
        tahfidzList,
        nilaiList,
        tagihanList,
        kanalPembayaranList,
        pengumumanList,
        jadwalList,
        mutabaahToday,
        tabunganAccounts,
        tabunganTransaksi,
        produkKoperasiList,
        transaksiKoperasiList,
        addSiswa,
        addBulkSiswa,
        updateSiswa,
        deleteSiswa,
        addGuru,
        updateGuru,
        deleteGuru,
        addKelas,
        updateKelas,
        deleteKelas,
        recordAbsensi,
        recordBulkAbsensi,
        recordAbsensiGuru,
        recordTahfidz,
        updateMutabaah,
        saveNilai,
        bayarTagihan,
        addTagihan,
        addKanalPembayaran,
        updateKanalPembayaran,
        deleteKanalPembayaran,
        toggleKanalPembayaran,
        addPengumuman,
        updatePengumuman,
        deletePengumuman,
        addJadwal,
        updateJadwal,
        deleteJadwal,
        addTabunganAccount,
        updateTabunganAccount,
        deleteTabunganAccount,
        setorTabungan,
        tarikTabungan,
        bayarSPPDenganTabungan,
        addProdukKoperasi,
        updateProdukKoperasi,
        deleteProdukKoperasi,
        prosesTransaksiKoperasi,
        resetToDefaultData,
        exportDatabaseJSON,
        importDatabaseJSON,
        isResetModalOpen,
        setIsResetModalOpen,
        triggerConfetti,
        selectedSiswaForDetail,
        setSelectedSiswaForDetail,
      }}
    >
      {children}
    </MadrasahContext.Provider>
  );
};

export const useMadrasah = () => {
  const context = useContext(MadrasahContext);
  if (!context) {
    throw new Error('useMadrasah must be used within a MadrasahProvider');
  }
  return context;
};

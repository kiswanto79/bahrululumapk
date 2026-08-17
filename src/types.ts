export type UserRole = 'admin' | 'guru' | 'siswa' | 'wali';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nisn?: string;
  nip?: string;
  kelas?: string;
  photoUrl?: string;
  phone?: string;
  gender?: 'L' | 'P';
  studentLinkedId?: string; // for wali santri to monitor specific student
}

export interface MadrasahInfo {
  nama: string;
  singkatan: string;
  jenjang: string;
  akreditasi: string;
  nsm: string;
  npsn: string;
  alamat: string;
  kota: string;
  telepon: string;
  email: string;
  website: string;
  kepalaMadrasah: string;
  nipKepala?: string;
  semboyan: string;
  logoUrl?: string;
  logoText: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  kelas: string;
  gender: 'L' | 'P';
  waliNama: string;
  waliPhone: string;
  alamat: string;
  status: 'Aktif' | 'Alumni' | 'Cuti';
  targetJuz: number;
  hafalanTercapai: number; // e.g. 5.5 juz
  fotoUrl: string;
  poinKarakter?: number;
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat: string;
  jurusan: string;
  waliKelasNama: string;
  ruangan: string;
  kapasitas: number;
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  gelar: string;
  mapel: string;
  waliKelas?: string;
  phone: string;
  email: string;
  status: 'PNS' | 'GTT' | 'Ustadz Tetap';
  fotoUrl: string;
}

export interface AbsensiRecord {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  tanggal: string; // YYYY-MM-DD
  waktuMasuk: string; // HH:mm
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  metode: 'kamera' | 'gps' | 'qr' | 'manual';
  catatan?: string;
  fotoBukti?: string;
  lokasi?: string;
  tipe?: 'santri' | 'asatidz';
  guruId?: string;
  jabatan?: string;
}

export interface AbsensiGuruRecord {
  id: string;
  guruId: string;
  guruNama: string;
  nip: string;
  jabatan: string;
  mapel: string;
  tanggal: string;
  waktuMasuk: string;
  waktuPulang?: string;
  status: 'hadir' | 'izin' | 'sakit' | 'dinas_luar' | 'alpha';
  metode: 'kamera' | 'gps' | 'qr' | 'manual';
  lokasi?: string;
  kordinat?: string;
  catatan?: string;
  fotoBukti?: string;
  tugasMengajarHariIni?: string;
}

export interface TahfidzRecord {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  tanggal: string;
  juz: number;
  surah: string;
  ayatMulai: number;
  ayatSelesai: number;
  jenis: 'ziyadah' | 'murojaah';
  kelancaran: 'mumtaz' | 'jayyid_jiddan' | 'jayyid' | 'maqbul';
  nilaiTajwid: number; // 0-100
  ustadzNama: string;
  catatan: string;
}

export interface MutabaahHarian {
  id?: string;
  siswaId: string;
  tanggal: string;
  sholatWajib: {
    subuh: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
  };
  sholatSunnah: {
    dhuha: boolean;
    tahajjud: boolean;
    rawatib: boolean;
  };
  tilawahHalaman: number;
  dzikirPagi: boolean;
  dzikirPetang: boolean;
  puasaSunnah: boolean;
  berbuatBaik: string;
}

export interface NilaiMapel {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  mapel: string;
  kategori: 'Diniyah / Kepesantrenan' | 'Umum / Kemenag';
  tugas: number;
  uts: number;
  uas: number;
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  catatan: string;
}

export interface TagihanSPP {
  id: string;
  siswaId: string;
  siswaNama: string;
  kelas: string;
  judulTagihan: string;
  bulan: string;
  nominal: number;
  status: 'lunas' | 'belum_lunas';
  tanggalBayar?: string;
  metodeBayar?: string;
  nomorKwitansi?: string;
  catatan?: string;
}

export interface KanalPembayaran {
  id: string;
  nama: string;
  kode: string;
  tipe: 'bank' | 'va' | 'qris' | 'tunai' | 'ewallet';
  nomorRekening: string;
  atasNama: string;
  aktif: boolean;
  keterangan?: string;
  instruksi?: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  kategori: 'Akademik' | 'Kepesantrenan' | 'Kegiatan' | 'Penting';
  tanggal: string;
  waktu?: string;
  lokasi?: string;
  target: 'Semua' | 'Siswa' | 'Guru' | 'Wali Santri';
  penulis: string;
  pin: boolean;
}

export interface JadwalPelajaran {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  guruNama: string;
  kelas: string;
  ruangan: string;
}

export interface DoaItem {
  id: string;
  judul: string;
  arab: string;
  latin: string;
  arti: string;
  kategori: 'Harian' | 'Sholat' | 'Hafalan & Belajar' | 'Perlindungan';
}

export interface SurahRingkas {
  nomor: number;
  namaLatin: string;
  namaArab: string;
  arti: string;
  jumlahAyat: number;
  tempatTurun: 'Mekkah' | 'Madinah';
  previewAyat?: string;
}

export interface JadwalSholat {
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  lokasi: string;
}

export type JenisAkadTabungan = 
  | 'Wadiah Yad Dhamanah' 
  | 'Mudharabah (Bagi Hasil)' 
  | 'Tabungan Qurban' 
  | 'Tabungan Wisuda & Rihlah' 
  | 'Tabungan Uang Saku';

export interface TabunganAccount {
  id: string;
  nomorRekening: string;
  ownerType: 'siswa' | 'guru';
  ownerId: string;
  ownerNama: string;
  kelasOrJabatan: string;
  jenisAkad: JenisAkadTabungan;
  saldo: number;
  limitHarianTarik: number; // 0 = unlimited
  status: 'aktif' | 'dibekukan' | 'tutup';
  tanggalBuka: string;
  catatan?: string;
}

export interface TabunganTransaksi {
  id: string;
  rekeningId: string;
  nomorRekening: string;
  ownerNama: string;
  ownerType: 'siswa' | 'guru';
  jenis: 'setor' | 'tarik' | 'autodebet_spp' | 'bagi_hasil' | 'belanja_koperasi';
  nominal: number;
  saldoSetelah: number;
  kategori: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm
  petugas: string;
  metode: string;
  nomorKwitansi: string;
  keterangan: string;
}

export type KategoriProdukKoperasi = 
  | 'Kitab & Buku'
  | 'Seragam & Atribut'
  | 'Alat Tulis'
  | 'Makanan & Minuman'
  | 'Perlengkapan Asrama'
  | 'Herbal & Kesehatan';

export interface ProdukKoperasi {
  id: string;
  barcode: string;
  nama: string;
  kategori: KategoriProdukKoperasi;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  minStok: number;
  satuan: string;
  fotoUrl: string;
  deskripsi?: string;
  terjualCount?: number;
}

export interface ItemKeranjangPos {
  produk: ProdukKoperasi;
  jumlah: number;
  diskonPersen: number;
  subtotal: number;
}

export interface TransaksiKoperasi {
  id: string;
  nomorNota: string;
  tanggal: string;
  waktu: string;
  kasir: string;
  pembeliTipe: 'santri' | 'guru' | 'wali' | 'umum';
  pembeliId?: string;
  pembeliNama: string;
  pembeliDetail?: string; // e.g. Kelas 9A
  items: {
    produkId: string;
    barcode: string;
    nama: string;
    harga: number;
    jumlah: number;
    satuan: string;
    subtotal: number;
  }[];
  totalItem: number;
  totalBelanja: number;
  diskonTotal: number;
  totalAkhir: number;
  metodeBayar: 'saldo_santri' | 'tunai' | 'qris' | 'transfer';
  nominalBayar: number;
  kembalian: number;
  rekeningTabunganId?: string;
  status: 'selesai' | 'dibatalkan';
  catatan?: string;
}

/**
 * Google Sheets & Drive API Integration Service
 * Madrasah Digital Smart
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
  createdTime?: string;
  owners?: Array<{ displayName?: string; emailAddress?: string; photoLink?: string }>;
  iconLink?: string;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface SpreadsheetDetails {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: SheetTabInfo[];
}

export interface MadrasahExportPayload {
  madrasahInfo: {
    nama: string;
    nsm: string;
    npsn: string;
    alamat: string;
    kepalaMadrasah: string;
    tahunAjaran: string;
    semester: string;
  };
  siswaList: Array<{
    nisn: string;
    nis: string;
    nama: string;
    kelas: string;
    jenisKelamin: string;
    namaWali: string;
    teleponWali: string;
    status: string;
    alamat: string;
  }>;
  guruList: Array<{
    nip: string;
    nama: string;
    mapel: string;
    jabatan: string;
    noHp: string;
    status: string;
  }>;
  absensiList: Array<{
    id: string;
    siswaNama: string;
    kelas: string;
    tanggal: string;
    status: string;
    waktu: string;
    lokasi?: string;
  }>;
  nilaiList: Array<{
    id: string;
    siswaNama: string;
    mapel: string;
    kelas: string;
    semester: string;
    tugas: number;
    uts: number;
    uas: number;
    nilaiAkhir: number;
    predikat: string;
  }>;
  tahfidzList: Array<{
    id: string;
    siswaNama: string;
    surah: string;
    ayat: string;
    juz: number;
    tanggal: string;
    predikat: string;
    status: string;
  }>;
  tagihanList: Array<{
    id: string;
    siswaNama: string;
    kelas: string;
    jenisTagihan: string;
    bulan: string;
    nominal: number;
    status: string;
    tanggalBayar?: string;
  }>;
  tabunganList: Array<{
    id: string;
    noRekening: string;
    namaSantri: string;
    kelas: string;
    saldo: number;
    limitHarian: number;
    status: string;
  }>;
  mutabaahList: Array<{
    tanggal: string;
    subuh: boolean;
    dzuhur: boolean;
    ashar: boolean;
    maghrib: boolean;
    isya: boolean;
    dhuha: boolean;
    tahajjud: boolean;
    tilawahJuz: number;
    skor: number;
  }>;
  koperasiProdukList: Array<{
    sku: string;
    nama: string;
    kategori: string;
    hargaBeli: number;
    hargaJual: number;
    stok: number;
    terjual: number;
  }>;
}

/**
 * Robust fetch wrapper with exponential backoff for Google APIs
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      
      // If 503, 500, or 429, retry
      if ((response.status === 503 || response.status === 500 || response.status === 429) && attempt < retries) {
        console.warn(`Attempt ${attempt} failed with status ${response.status}. Retrying in ${backoff * attempt}ms...`);
        await new Promise(res => setTimeout(res, backoff * attempt));
        continue;
      }
      return response;
    } catch (err: any) {
      if (attempt < retries) {
        console.warn(`Attempt ${attempt} network error: ${err.message}. Retrying in ${backoff * attempt}ms...`);
        await new Promise(res => setTimeout(res, backoff * attempt));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Google API request failed after retries.');
}

/**
 * List spreadsheets from user's Google Drive
 */
export async function listDriveSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent("files(id,name,webViewLink,modifiedTime,createdTime,owners,iconLink)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=30&orderBy=modifiedTime%20desc`;
    
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}: Gagal memuat file Google Drive.`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error: any) {
    console.error('Drive API error:', error);
    throw error;
  }
}

/**
 * Fetch spreadsheet metadata & tabs
 */
export async function getSpreadsheetDetails(accessToken: string, spreadsheetId: string): Promise<SpreadsheetDetails> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}: Gagal membaca spreadsheet.`);
    }

    const data = await response.json();
    const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId ?? 0,
      title: s.properties?.title || 'Sheet',
      index: s.properties?.index ?? 0,
      rowCount: s.properties?.gridProperties?.rowCount,
      columnCount: s.properties?.gridProperties?.columnCount,
    }));

    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title || 'Spreadsheet Tanpa Judul',
      spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheets,
    };
  } catch (error: any) {
    console.error('Sheets Details API error:', error);
    throw error;
  }
}

/**
 * Read range values from a Google Spreadsheet
 */
export async function readSpreadsheetRange(accessToken: string, spreadsheetId: string, range: string): Promise<any[][]> {
  try {
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}: Gagal membaca range spreadsheet.`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error: any) {
    console.error('Read Sheet Values API error:', error);
    throw error;
  }
}

/**
 * Build multi-tab data structures for Madrasah export
 */
export function buildMadrasahSheetsData(payload: MadrasahExportPayload) {
  const tabs = [
    {
      title: 'Info Lembaga',
      headers: ['Parameter', 'Nilai / Keterangan'],
      rows: [
        ['Nama Madrasah', payload.madrasahInfo.nama],
        ['Nomor Statistik Madrasah (NSM)', payload.madrasahInfo.nsm],
        ['NPSN', payload.madrasahInfo.npsn],
        ['Alamat Lengkap', payload.madrasahInfo.alamat],
        ['Kepala Madrasah', payload.madrasahInfo.kepalaMadrasah],
        ['Tahun Pelajaran', payload.madrasahInfo.tahunAjaran],
        ['Semester', payload.madrasahInfo.semester],
        ['Waktu Sinkronisasi', new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })],
        ['Status Sinkronisasi', 'TERHUBUNG GOOGLE SHEETS CLOUD AKTIF'],
      ],
    },
    {
      title: 'Data Santri',
      headers: ['No', 'NISN', 'NIS', 'Nama Lengkap', 'Kelas', 'Jenis Kelamin', 'Nama Wali', 'Kontak Wali', 'Status', 'Alamat Domisili'],
      rows: payload.siswaList.map((s, idx) => [
        idx + 1,
        s.nisn,
        s.nis,
        s.nama,
        s.kelas,
        s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        s.namaWali,
        s.teleponWali,
        s.status,
        s.alamat,
      ]),
    },
    {
      title: 'Data Guru',
      headers: ['No', 'NIP / NUPTK', 'Nama Lengkap', 'Mata Pelajaran', 'Jabatan / Tugas', 'No. WhatsApp', 'Status Kepegawaian'],
      rows: payload.guruList.map((g, idx) => [
        idx + 1,
        g.nip,
        g.nama,
        g.mapel,
        g.jabatan,
        g.noHp,
        g.status,
      ]),
    },
    {
      title: 'Rekap Raport',
      headers: ['No', 'Nama Siswa', 'Mata Pelajaran', 'Kelas', 'Semester', 'Nilai Tugas', 'Nilai UTS', 'Nilai UAS', 'Nilai Akhir', 'Predikat Kemenag'],
      rows: payload.nilaiList.map((n, idx) => [
        idx + 1,
        n.siswaNama,
        n.mapel,
        n.kelas,
        n.semester,
        n.tugas,
        n.uts,
        n.uas,
        n.nilaiAkhir,
        n.predikat,
      ]),
    },
    {
      title: 'Presensi Digital',
      headers: ['No', 'Nama Santri/Siswa', 'Kelas', 'Tanggal', 'Waktu Masuk', 'Status Kehadiran', 'Geotagging Lokasi'],
      rows: payload.absensiList.map((a, idx) => [
        idx + 1,
        a.siswaNama,
        a.kelas,
        a.tanggal,
        a.waktu,
        a.status.toUpperCase(),
        a.lokasi || 'Madrasah Main Gate GPS',
      ]),
    },
    {
      title: 'Setoran Tahfidz',
      headers: ['No', 'Nama Santri', 'Surah Al-Qur\'an', 'Ayat', 'Juz', 'Tanggal Ujian', 'Predikat', 'Status Kelulusan'],
      rows: payload.tahfidzList.map((t, idx) => [
        idx + 1,
        t.siswaNama,
        t.surah,
        t.ayat,
        t.juz,
        t.tanggal,
        t.predikat,
        t.status,
      ]),
    },
    {
      title: 'SPP & Keuangan',
      headers: ['No', 'Nama Santri', 'Kelas', 'Jenis Tagihan', 'Bulan / Periode', 'Nominal (Rp)', 'Status Bayar', 'Tanggal Lunas'],
      rows: payload.tagihanList.map((tg, idx) => [
        idx + 1,
        tg.siswaNama,
        tg.kelas,
        tg.jenisTagihan,
        tg.bulan,
        tg.nominal,
        tg.status.toUpperCase(),
        tg.tanggalBayar || '-',
      ]),
    },
    {
      title: 'Tabungan Santri',
      headers: ['No', 'No. Rekening', 'Nama Santri / Pemilik', 'Kelas', 'Saldo Aktif (Rp)', 'Limit Belanja Harian (Rp)', 'Status Rekening'],
      rows: payload.tabunganList.map((tb, idx) => [
        idx + 1,
        tb.noRekening,
        tb.namaSantri,
        tb.kelas,
        tb.saldo,
        tb.limitHarian,
        tb.status.toUpperCase(),
      ]),
    },
    {
      title: 'Mutabaah Yaumiyyah',
      headers: ['No', 'Tanggal', 'Subuh (Jamaah)', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya', 'Dhuha', 'Tahajjud', 'Tilawah (Juz)', 'Skor Amalan (%)'],
      rows: payload.mutabaahList.map((m, idx) => [
        idx + 1,
        m.tanggal,
        m.subuh ? '✓ Ya' : '✗ Tidak',
        m.dzuhur ? '✓ Ya' : '✗ Tidak',
        m.ashar ? '✓ Ya' : '✗ Tidak',
        m.maghrib ? '✓ Ya' : '✗ Tidak',
        m.isya ? '✓ Ya' : '✗ Tidak',
        m.dhuha ? '✓ Ya' : '✗ Tidak',
        m.tahajjud ? '✓ Ya' : '✗ Tidak',
        `Juz ${m.tilawahJuz}`,
        `${m.skor}%`,
      ]),
    },
    {
      title: 'POS Koperasi',
      headers: ['No', 'SKU / Barcode', 'Nama Produk', 'Kategori', 'HPP Beli (Rp)', 'Harga Jual (Rp)', 'Stok Sisa', 'Total Terjual'],
      rows: payload.koperasiProdukList.map((kp, idx) => [
        idx + 1,
        kp.sku,
        kp.nama,
        kp.kategori,
        kp.hargaBeli,
        kp.hargaJual,
        kp.stok,
        kp.terjual,
      ]),
    },
  ];

  return tabs;
}

/**
 * Create a new Google Spreadsheet in Google Drive with simplified, resilient creation flow
 */
export async function createMadrasahSpreadsheet(
  accessToken: string,
  spreadsheetTitle: string,
  payload: MadrasahExportPayload
): Promise<SpreadsheetDetails> {
  try {
    const tabsData = buildMadrasahSheetsData(payload);

    // Step 1: Create clean spreadsheet with first tab
    const createBody = {
      properties: {
        title: spreadsheetTitle,
      },
      sheets: [
        {
          properties: {
            title: tabsData[0].title,
            index: 0,
          },
        },
      ],
    };

    const createRes = await fetchWithRetry('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${createRes.status}: Gagal membuat spreadsheet baru.`);
    }

    const createdSheet = await createRes.json();
    const spreadsheetId = createdSheet.spreadsheetId;

    // Step 2: Add remaining sheets in one batch request
    if (tabsData.length > 1) {
      const addSheetRequests = tabsData.slice(1).map((tab, idx) => ({
        addSheet: {
          properties: {
            title: tab.title,
            index: idx + 1,
          },
        },
      }));

      await fetchWithRetry(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: addSheetRequests }),
      }).catch(e => console.warn('Warning: Some tabs could not be added:', e));
    }

    // Step 3: Populate cell values
    const valueRanges = tabsData.map(tab => ({
      range: `'${tab.title}'!A1`,
      values: [tab.headers, ...tab.rows],
    }));

    await fetchWithRetry(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueRanges,
        }),
      }
    );

    return {
      spreadsheetId: spreadsheetId,
      title: createdSheet.properties?.title || spreadsheetTitle,
      spreadsheetUrl: createdSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      sheets: tabsData.map((tab, idx) => ({
        sheetId: idx,
        title: tab.title,
        index: idx,
        rowCount: tab.rows.length + 1,
        columnCount: tab.headers.length,
      })),
    };
  } catch (error: any) {
    console.error('Create Spreadsheet error:', error);
    throw error;
  }
}

/**
 * Sync / Overwrite data to an existing Google Spreadsheet
 */
export async function syncToExistingSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  payload: MadrasahExportPayload
): Promise<void> {
  try {
    const tabsData = buildMadrasahSheetsData(payload);

    // 1. Get current sheets to verify existing tabs
    const meta = await getSpreadsheetDetails(accessToken, spreadsheetId);
    const existingTitles = new Set(meta.sheets.map(s => s.title));

    // 2. Add missing sheets if needed
    const addSheetRequests = tabsData
      .filter(tab => !existingTitles.has(tab.title))
      .map((tab, idx) => ({
        addSheet: {
          properties: {
            title: tab.title,
            index: meta.sheets.length + idx,
          },
        },
      }));

    if (addSheetRequests.length > 0) {
      await fetchWithRetry(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: addSheetRequests }),
      }).catch(e => console.warn('Could not add missing sheet tabs:', e));
    }

    // 3. Clear existing ranges & write new values
    const valueRanges = tabsData.map(tab => ({
      range: `'${tab.title}'!A1:Z500`,
      values: [tab.headers, ...tab.rows],
    }));

    const updateValuesRes = await fetchWithRetry(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueRanges,
        }),
      }
    );

    if (!updateValuesRes.ok) {
      const err = await updateValuesRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Gagal menyinkronkan data ke Google Sheet.');
    }
  } catch (error: any) {
    console.error('Sync to Existing Spreadsheet error:', error);
    throw error;
  }
}

/**
 * Generate CSV string for direct offline download or quick import
 */
export function generateModuleCSV(headers: string[], rows: any[][]): string {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCsv).join(',');
  const rowLines = rows.map(r => r.map(escapeCsv).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

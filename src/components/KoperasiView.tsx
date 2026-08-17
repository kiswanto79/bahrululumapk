import React, { useState, useMemo } from 'react';
import { useMadrasah } from '../context/MadrasahContext';
import { 
  ProdukKoperasi, 
  TransaksiKoperasi, 
  ItemKeranjangPos, 
  KategoriProdukKoperasi 
} from '../types';
import { 
  Store, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Package, 
  TrendingUp, 
  Layers, 
  User, 
  Receipt, 
  ChevronRight, 
  X, 
  Send, 
  Banknote, 
  Tag, 
  SlidersHorizontal,
  Building2,
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';

const KATEGORI_LIST: KategoriProdukKoperasi[] = [
  'Kitab & Buku',
  'Seragam & Atribut',
  'Alat Tulis',
  'Makanan & Minuman',
  'Perlengkapan Asrama',
  'Herbal & Kesehatan'
];

export const KoperasiView: React.FC = () => {
  const { 
    madrasahInfo,
    siswaList, 
    guruList,
    tabunganAccounts,
    produkKoperasiList, 
    transaksiKoperasiList,
    addProdukKoperasi,
    updateProdukKoperasi,
    deleteProdukKoperasi,
    prosesTransaksiKoperasi,
    currentUser,
    activeRole,
    triggerConfetti
  } = useMadrasah();

  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'pos' | 'katalog' | 'riwayat' | 'laporan'>('pos');

  // POS State
  const [cart, setCart] = useState<ItemKeranjangPos[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Customer selection
  const [buyerType, setBuyerType] = useState<'santri' | 'guru' | 'wali' | 'umum'>('santri');
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(siswaList[0]?.id || 'sis-01');
  const [customBuyerName, setCustomBuyerName] = useState<string>('');
  
  // Discount & Payment
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'saldo_santri' | 'tunai' | 'qris' | 'transfer'>('saldo_santri');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [transactionNote, setTransactionNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Struk Modal & Reprint Modal
  const [receiptModalTrx, setReceiptModalTrx] = useState<TransaksiKoperasi | null>(null);

  // Product Add / Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState({
    barcode: '',
    nama: '',
    kategori: 'Kitab & Buku' as KategoriProdukKoperasi,
    hargaBeli: 0,
    hargaJual: 0,
    stok: 10,
    minStok: 5,
    satuan: 'pcs',
    fotoUrl: '',
    deskripsi: ''
  });

  // Barcode input simulator
  const [barcodeInput, setBarcodeInput] = useState('');

  // Selected buyer object
  const selectedSiswa = siswaList.find(s => s.id === selectedBuyerId) || siswaList[0];
  const selectedGuru = guruList.find(g => g.id === selectedBuyerId) || guruList[0];

  // Find linked Tabungan account for selected buyer
  const buyerTabunganAccount = useMemo(() => {
    if (buyerType === 'santri') {
      return tabunganAccounts.find(a => a.ownerId === selectedSiswa?.id && a.ownerType === 'siswa') ||
        tabunganAccounts.find(a => a.ownerNama.toLowerCase().includes(selectedSiswa?.nama.toLowerCase() || ''));
    }
    if (buyerType === 'guru') {
      return tabunganAccounts.find(a => a.ownerId === selectedGuru?.id && a.ownerType === 'guru') ||
        tabunganAccounts.find(a => a.ownerNama.toLowerCase().includes(selectedGuru?.nama.toLowerCase() || ''));
    }
    return null;
  }, [buyerType, selectedSiswa, selectedGuru, tabunganAccounts]);

  // Filtered product catalog
  const filteredProducts = useMemo(() => {
    return produkKoperasiList.filter(prod => {
      const matchCategory = selectedCategory === 'Semua' || prod.kategori === selectedCategory;
      const matchSearch = prod.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.barcode.includes(searchQuery) ||
        prod.kategori.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [produkKoperasiList, selectedCategory, searchQuery]);

  // Cart Totals
  const totalItemCount = cart.reduce((sum, item) => sum + item.jumlah, 0);
  const grossTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = Math.round((grossTotal * discountPercent) / 100);
  const netTotal = Math.max(0, grossTotal - discountAmount);
  const kembalian = paymentMethod === 'tunai' ? Math.max(0, cashGiven - netTotal) : 0;

  // Add product to Cart
  const handleAddToCart = (product: ProdukKoperasi) => {
    if (product.stok <= 0) {
      setStatusMessage({ type: 'error', text: `Stok "${product.nama}" habis!` });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.produk.id === product.id);
      if (existing) {
        if (existing.jumlah >= product.stok) {
          setStatusMessage({ type: 'error', text: `Jumlah melebihi sisa stok (${product.stok})` });
          setTimeout(() => setStatusMessage(null), 3000);
          return prev;
        }
        return prev.map(i => {
          if (i.produk.id === product.id) {
            const newQty = i.jumlah + 1;
            return {
              ...i,
              jumlah: newQty,
              subtotal: newQty * product.hargaJual
            };
          }
          return i;
        });
      } else {
        return [
          ...prev,
          {
            produk: product,
            jumlah: 1,
            diskonPersen: 0,
            subtotal: product.hargaJual
          }
        ];
      }
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.produk.id === productId) {
          const newQty = item.jumlah + delta;
          if (newQty <= 0) return null;
          if (newQty > item.produk.stok) {
            setStatusMessage({ type: 'error', text: `Stok maksimal hanya ${item.produk.stok}` });
            setTimeout(() => setStatusMessage(null), 3000);
            return item;
          }
          return {
            ...item,
            jumlah: newQty,
            subtotal: newQty * item.produk.hargaJual
          };
        }
        return item;
      }).filter(Boolean) as ItemKeranjangPos[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.produk.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setCashGiven(0);
    setTransactionNote('');
  };

  // Barcode quick add
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = produkKoperasiList.find(p => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim());
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      setStatusMessage({ type: 'error', text: `Produk dengan barcode "${barcodeInput}" tidak ditemukan!` });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Submit Transaction
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setStatusMessage({ type: 'error', text: 'Keranjang belanja masih kosong!' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (paymentMethod === 'tunai' && cashGiven < netTotal) {
      setStatusMessage({ type: 'error', text: `Uang tunai kurang Rp ${(netTotal - cashGiven).toLocaleString('id-ID')}` });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (paymentMethod === 'saldo_santri' && buyerTabunganAccount && buyerTabunganAccount.saldo < netTotal) {
      setStatusMessage({ 
        type: 'error', 
        text: `Saldo Tabungan Santri (${buyerTabunganAccount.nomorRekening}) tidak cukup. Saldo: Rp ${buyerTabunganAccount.saldo.toLocaleString('id-ID')}` 
      });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    setIsProcessing(true);

    const buyerName = buyerType === 'santri' 
      ? selectedSiswa?.nama 
      : buyerType === 'guru' 
      ? `${selectedGuru?.nama}, ${selectedGuru?.gelar}` 
      : customBuyerName || 'Pelanggan Umum Koperasi';

    const buyerDetail = buyerType === 'santri' 
      ? `${selectedSiswa?.kelas} &bull; NISN: ${selectedSiswa?.nisn}` 
      : buyerType === 'guru' 
      ? `${selectedGuru?.mapel} &bull; ${selectedGuru?.status}` 
      : 'Pembeli Umum / Wali';

    const itemsForTrx = cart.map(item => ({
      produkId: item.produk.id,
      barcode: item.produk.barcode,
      nama: item.produk.nama,
      harga: item.produk.hargaJual,
      jumlah: item.jumlah,
      satuan: item.produk.satuan,
      subtotal: item.subtotal
    }));

    const result = await prosesTransaksiKoperasi({
      tanggal: new Date().toISOString().split('T')[0],
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      kasir: currentUser.name || 'Siti Rohana (Kasir Koperasi)',
      pembeliTipe: buyerType,
      pembeliId: buyerType === 'santri' ? selectedSiswa?.id : buyerType === 'guru' ? selectedGuru?.id : undefined,
      pembeliNama: buyerName,
      pembeliDetail: buyerDetail,
      items: itemsForTrx,
      totalItem: totalItemCount,
      totalBelanja: grossTotal,
      diskonTotal: discountAmount,
      totalAkhir: netTotal,
      metodeBayar: paymentMethod,
      nominalBayar: paymentMethod === 'tunai' ? cashGiven : netTotal,
      kembalian: kembalian,
      rekeningTabunganId: buyerTabunganAccount?.id,
      status: 'selesai',
      catatan: transactionNote || (paymentMethod === 'saldo_santri' ? 'Debet Saldo Smart Card E-KTS' : undefined)
    });

    setIsProcessing(false);

    if (result.success && result.transaksi) {
      setReceiptModalTrx(result.transaksi);
      handleClearCart();
      triggerConfetti();
    } else {
      setStatusMessage({ type: 'error', text: result.message || 'Transaksi gagal diproses' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Save / Update Product in Catalog
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.nama.trim()) return;

    if (editingProductId) {
      await updateProdukKoperasi(editingProductId, productFormData);
    } else {
      await addProdukKoperasi({
        ...productFormData,
        barcode: productFormData.barcode || `${Math.floor(899000000 + Math.random() * 999999)}`,
        fotoUrl: productFormData.fotoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        terjualCount: 0
      });
    }

    setIsProductModalOpen(false);
    setEditingProductId(null);
    setProductFormData({
      barcode: '',
      nama: '',
      kategori: 'Kitab & Buku',
      hargaBeli: 0,
      hargaJual: 0,
      stok: 10,
      minStok: 5,
      satuan: 'pcs',
      fotoUrl: '',
      deskripsi: ''
    });
  };

  const handleOpenEditProduct = (prod: ProdukKoperasi) => {
    setEditingProductId(prod.id);
    setProductFormData({
      barcode: prod.barcode,
      nama: prod.nama,
      kategori: prod.kategori,
      hargaBeli: prod.hargaBeli,
      hargaJual: prod.hargaJual,
      stok: prod.stok,
      minStok: prod.minStok,
      satuan: prod.satuan,
      fotoUrl: prod.fotoUrl,
      deskripsi: prod.deskripsi || ''
    });
    setIsProductModalOpen(true);
  };

  // Analytics Stats
  const totalOmzet = transaksiKoperasiList.reduce((sum, t) => sum + (t.status === 'selesai' ? t.totalAkhir : 0), 0);
  const totalTransaksiCount = transaksiKoperasiList.filter(t => t.status === 'selesai').length;
  const totalProdukJenis = produkKoperasiList.length;
  const totalStokBarang = produkKoperasiList.reduce((sum, p) => sum + p.stok, 0);

  // Estimasi Laba Kotor
  const estimasiLabaKotor = useMemo(() => {
    let laba = 0;
    transaksiKoperasiList.filter(t => t.status === 'selesai').forEach(trx => {
      trx.items.forEach(item => {
        const prod = produkKoperasiList.find(p => p.id === item.produkId);
        if (prod) {
          const profitPerItem = (item.harga - prod.hargaBeli) * item.jumlah;
          laba += profitPerItem;
        }
      });
    });
    return Math.max(0, laba);
  }, [transaksiKoperasiList, produkKoperasiList]);

  return (
    <div className="space-y-5 pb-16 lg:pb-6">
      {/* Header Banner */}
      <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 via-emerald-500/30 to-teal-600/30 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
            <Store className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>POS Kasir & Koperasi Pesantren</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Al-Azhar Mart Syariah
              </span>
            </h2>
            <p className="text-xs text-slate-400">Kasir Point-of-Sale, Potong Saldo Tabungan Smart Card & Inventaris Kitab/Seragam</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 glass-panel-subtle rounded-2xl border border-white/10 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'pos', label: 'Terminal Kasir', icon: ShoppingCart },
            { id: 'katalog', label: 'Stok Produk', icon: Package },
            { id: 'riwayat', label: 'Riwayat Nota', icon: Receipt },
            { id: 'laporan', label: 'Laporan Omzet', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Status Message Toast */}
      {statusMessage && (
        <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'glass-panel-emerald border-emerald-400/40 text-emerald-200' 
            : 'bg-red-950/80 border-red-500/50 text-red-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TERMINAL POS KASIR (POINT OF SALE) */}
      {/* ============================================================ */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT 7 COLS: Product Catalog & Fast Search */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Barcode Fast Scanner */}
            <div className="glass-panel border border-white/10 rounded-2xl p-3.5 shadow-md flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama produk, kitab, atribut, ATK..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full glass-input pl-9 pr-3.5 py-2 rounded-xl text-white text-xs placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Barcode Quick Input */}
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5 sm:w-48">
                <input
                  type="text"
                  placeholder="Scan SKU / Barcode..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  title="Scan & Tambah Cepat"
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('Semua')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'Semua'
                    ? 'bg-emerald-600 text-white shadow-md border border-emerald-400/40'
                    : 'glass-panel-subtle text-slate-300 hover:text-white'
                }`}
              >
                Semua ({produkKoperasiList.length})
              </button>
              {KATEGORI_LIST.map(kat => {
                const count = produkKoperasiList.filter(p => p.kategori === kat).length;
                return (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => setSelectedCategory(kat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === kat
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'glass-panel-subtle text-slate-300 hover:text-white'
                    }`}
                  >
                    {kat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stok <= 0;
                const inCartQty = cart.find(i => i.produk.id === product.id)?.jumlah || 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`group relative glass-card border rounded-2xl p-2.5 flex flex-col justify-between transition-all cursor-pointer select-none ${
                      isOutOfStock 
                        ? 'opacity-50 grayscale border-white/5 cursor-not-allowed' 
                        : 'border-white/10 hover:border-amber-400/60 hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Image & Badges */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-900/80 mb-2">
                      <img
                        src={product.fotoUrl}
                        alt={product.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-950/80 text-amber-300 backdrop-blur-sm">
                        {product.kategori}
                      </span>
                      {product.stok <= product.minStok && !isOutOfStock && (
                        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/90 text-slate-950">
                          Sisa {product.stok}
                        </span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          Habis
                        </div>
                      )}
                      {inCartQty > 0 && (
                        <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border border-emerald-300">
                          {inCartQty}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                        {product.nama}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SKU: {product.barcode} &bull; Stok: <span className={product.stok <= product.minStok ? 'text-amber-400 font-bold' : 'text-slate-200'}>{product.stok} {product.satuan}</span>
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-amber-300">
                          Rp {product.hargaJual.toLocaleString('id-ID')}
                        </span>
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl border border-white/5 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-500" />
                  <p className="text-xs">Tidak ada produk yang cocok dengan pencarian.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: Checkout Terminal & Smart Card Debet */}
          <div className="lg:col-span-5 glass-panel border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 flex flex-col justify-between">
            {/* Customer Selector Box */}
            <div className="space-y-2.5 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Identitas Pembeli</span>
                </span>

                {/* Buyer Type Switcher */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-xl border border-white/5">
                  {(['santri', 'guru', 'umum'] as const).map(bt => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setBuyerType(bt)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                        buyerType === bt 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              {buyerType === 'santri' && (
                <div className="space-y-1.5">
                  <select
                    value={selectedBuyerId}
                    onChange={e => setSelectedBuyerId(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-semibold focus:outline-none"
                  >
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.nama} - {s.kelas} (NISN: {s.nisn})
                      </option>
                    ))}
                  </select>

                  {/* Smart Card Savings Info Badge */}
                  <div className="p-2.5 rounded-xl glass-panel-subtle border border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-[10px] text-slate-400">Saldo E-KTS Smart Card:</p>
                        <p className="font-mono font-bold text-emerald-300">
                          {buyerTabunganAccount ? `Rp ${buyerTabunganAccount.saldo.toLocaleString('id-ID')}` : 'Tidak Terdaftar'}
                        </p>
                      </div>
                    </div>
                    {buyerTabunganAccount && buyerTabunganAccount.limitHarianTarik > 0 && (
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        Limit: Rp {buyerTabunganAccount.limitHarianTarik.toLocaleString('id-ID')}/hr
                      </span>
                    )}
                  </div>
                </div>
              )}

              {buyerType === 'guru' && (
                <select
                  value={selectedBuyerId}
                  onChange={e => setSelectedBuyerId(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-semibold focus:outline-none"
                >
                  {guruList.map(g => (
                    <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                      {g.nama}, {g.gelar} - ({g.mapel})
                    </option>
                  ))}
                </select>
              )}

              {buyerType === 'umum' && (
                <input
                  type="text"
                  placeholder="Nama Pembeli Umum / Wali Santri..."
                  value={customBuyerName}
                  onChange={e => setCustomBuyerName(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                />
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto no-scrollbar pr-1">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Item Keranjang ({totalItemCount})</span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Kosongkan
                  </button>
                )}
              </div>

              {cart.map(item => (
                <div
                  key={item.produk.id}
                  className="p-2 rounded-xl glass-panel-subtle border border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{item.produk.nama}</p>
                    <p className="text-[10px] text-amber-300 font-mono">
                      @Rp {item.produk.hargaJual.toLocaleString('id-ID')} &bull; Sub: Rp {item.subtotal.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.produk.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white font-mono">{item.jumlah}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.produk.id, 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(item.produk.id)}
                      className="w-6 h-6 ml-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 text-slate-500" />
                  <p className="text-xs">Keranjang masih kosong</p>
                  <p className="text-[10px] text-slate-400">Pilih produk di sebelah kiri untuk menambah pesanan</p>
                </div>
              )}
            </div>

            {/* Payment Method Selector & Discount */}
            <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
              {/* Discount selection */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Diskon Santri/Khusus:</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        discountPercent === d 
                          ? 'bg-amber-500 text-slate-950 font-black' 
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {d === 0 ? '0%' : `${d}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-[11px] text-slate-300 block mb-1.5 font-medium">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'saldo_santri', label: 'Potong Saldo E-KTS', icon: CreditCard, color: 'text-emerald-300 border-emerald-400/40 glass-panel-emerald' },
                    { id: 'tunai', label: 'Tunai / Cash', icon: Banknote, color: 'text-amber-300 border-amber-400/40 glass-panel-amber' },
                    { id: 'qris', label: 'QRIS Baitul Maal', icon: QrCode, color: 'text-blue-300 border-blue-400/40 bg-blue-500/20' },
                    { id: 'transfer', label: 'Transfer BSI', icon: DollarSign, color: 'text-teal-300 border-teal-400/40 bg-teal-500/20' },
                  ].map(m => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any);
                          if (m.id === 'tunai' && cashGiven < netTotal) {
                            setCashGiven(netTotal);
                          }
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          isSel ? m.color : 'glass-panel-subtle border-white/5 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Input Field if Tunai */}
              {paymentMethod === 'tunai' && (
                <div className="p-3 rounded-2xl glass-panel-subtle border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">Nominal Uang Diterima:</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      Kembalian: Rp {kembalian.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={e => setCashGiven(Number(e.target.value))}
                    placeholder="Masukkan nominal uang..."
                    className="w-full glass-input px-3 py-1.5 rounded-xl text-white text-xs font-mono font-bold"
                  />
                  {/* Quick Cash Buttons */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {[netTotal, 10000, 20000, 50000, 100000, 200000].filter(v => v >= netTotal).slice(0, 4).map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashGiven(val)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 whitespace-nowrap"
                      >
                        {val === netTotal ? 'Uang Pas' : `Rp ${val.toLocaleString('id-ID')}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals Summary */}
              <div className="space-y-1 pt-2 border-t border-white/10 font-mono">
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Subtotal Belanja:</span>
                  <span>Rp {grossTotal.toLocaleString('id-ID')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 text-xs">
                    <span>Diskon ({discountPercent}%):</span>
                    <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-white text-sm font-bold pt-1">
                  <span>Total Tagihan:</span>
                  <span className="text-amber-300 text-base font-black">
                    Rp {netTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Action Checkout Button */}
              <button
                type="button"
                disabled={cart.length === 0 || isProcessing}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Memproses Transaksi...' : `Bayar Sekarang &bull; Rp ${netTotal.toLocaleString('id-ID')}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. KATALOG & STOK PRODUK (INVENTORY) */}
      {/* ============================================================ */}
      {activeTab === 'katalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel border border-white/10 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white">Inventaris & Manajemen Stok Koperasi</h3>
              <p className="text-xs text-slate-400">Kelola master harga, SKU barcode, batas minimum stok dan kategori</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setProductFormData({
                  barcode: `${Math.floor(899000000 + Math.random() * 999999)}`,
                  nama: '',
                  kategori: 'Kitab & Buku',
                  hargaBeli: 0,
                  hargaJual: 0,
                  stok: 20,
                  minStok: 5,
                  satuan: 'pcs',
                  fotoUrl: '',
                  deskripsi: ''
                });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          {/* Table of Products */}
          <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-xl text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Produk</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 font-mono">Barcode</th>
                    <th className="py-3 px-3 text-right">Harga Beli (HPP)</th>
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-center">Stok</th>
                    <th className="py-3 px-3 text-center">Terjual</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {produkKoperasiList.map(prod => {
                    const isLowStock = prod.stok <= prod.minStok;
                    return (
                      <tr key={prod.id} className="hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={prod.fotoUrl} alt={prod.nama} className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" />
                            <div>
                              <p className="font-bold text-white">{prod.nama}</p>
                              {prod.deskripsi && <p className="text-[10px] text-slate-400 line-clamp-1">{prod.deskripsi}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300">
                            {prod.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{prod.barcode}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400">Rp {prod.hargaBeli.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">Rp {prod.hargaJual.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            prod.stok === 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            isLowStock ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {prod.stok} {prod.satuan}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-300">
                          {prod.terjualCount || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-semibold transition-all"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus produk "${prod.nama}" dari inventaris?`)) {
                                  deleteProdukKoperasi(prod.id);
                                }
                              }}
                              className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. RIWAYAT NOTA & PENJUALAN */}
      {/* ============================================================ */}
      {activeTab === 'riwayat' && (
        <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-xl text-white">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Riwayat Transaksi Penjualan Koperasi</h3>
              <p className="text-xs text-slate-400">Total {transaksiKoperasiList.length} transaksi tercatat di database kasir</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              Total Omzet: Rp {totalOmzet.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-3">Tanggal / Waktu</th>
                  <th className="py-3 px-3">Pembeli</th>
                  <th className="py-3 px-3">Rincian Item</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3 text-right">Total Akhir</th>
                  <th className="py-3 px-4 text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {transaksiKoperasiList.map(trx => (
                  <tr key={trx.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{trx.nomorNota}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {trx.tanggal} &bull; {trx.waktu}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{trx.pembeliNama}</p>
                      <p className="text-[10px] text-slate-400">{trx.pembeliDetail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-semibold">{trx.totalItem} Item</span>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {trx.items.map(i => `${i.nama} (${i.jumlah})`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        trx.metodeBayar === 'saldo_santri' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        trx.metodeBayar === 'tunai' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        trx.metodeBayar === 'qris' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-teal-500/20 text-teal-300'
                      }`}>
                        {trx.metodeBayar.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-amber-300">
                      Rp {trx.totalAkhir.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setReceiptModalTrx(trx)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1 mx-auto transition-all"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. LAPORAN OMZET & LABA SYARIAH */}
      {/* ============================================================ */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl glass-panel-emerald border border-emerald-400/40 text-white">
              <span className="text-xs text-emerald-300 font-medium">Total Omzet Penjualan</span>
              <p className="text-2xl font-black mt-1 text-emerald-300 font-mono">
                Rp {totalOmzet.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Akumulasi seluruh transaksi</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel-amber border border-amber-400/40 text-white">
              <span className="text-xs text-amber-300 font-medium">Estimasi Laba Kotor (Gross)</span>
              <p className="text-2xl font-black mt-1 text-amber-400 font-mono">
                Rp {estimasiLabaKotor.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Margin Harga Jual - HPP</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-blue-500/40 text-white">
              <span className="text-xs text-blue-300 font-medium">Total Transaksi Selesai</span>
              <p className="text-2xl font-black mt-1 text-blue-400 font-mono">
                {totalTransaksiCount} Nota
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Struk tervalidasi sistem</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-teal-500/40 text-white">
              <span className="text-xs text-teal-300 font-medium">Total Master Produk</span>
              <p className="text-2xl font-black mt-1 text-teal-400 font-mono">
                {totalProdukJenis} SKU ({totalStokBarang} Stok)
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Tersedia di etalase koperasi</p>
            </div>
          </div>

          {/* Top Selling Products List */}
          <div className="glass-panel border border-white/10 rounded-3xl p-5 shadow-xl text-white">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Produk Terlaris Koperasi (Top Best Sellers)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...produkKoperasiList].sort((a, b) => (b.terjualCount || 0) - (a.terjualCount || 0)).slice(0, 6).map((prod, idx) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <img src={prod.fotoUrl} alt={prod.nama} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{prod.nama}</p>
                      <p className="text-[10px] text-amber-300">{prod.kategori} &bull; Rp {prod.hargaJual.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">{prod.terjualCount || 0} Terjual</span>
                    <p className="text-[10px] text-slate-400">Sisa {prod.stok} {prod.satuan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: THERMAL RECEIPT STRUK (58mm / 80mm) */}
      {/* ============================================================ */}
      {receiptModalTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm glass-panel border border-white/20 rounded-3xl p-5 shadow-2xl space-y-4 text-white relative">
            <button
              onClick={() => setReceiptModalTrx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Thermal Printable Area */}
            <div id="thermal-receipt-container" className="bg-white text-slate-900 rounded-2xl p-4 font-mono text-[11px] space-y-3 shadow-inner">
              {/* Receipt Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
                <p className="font-black text-sm uppercase tracking-wider">KOPERASI SANTRI AL-AZHAR</p>
                <p className="text-[10px] text-slate-600">Unit Usaha & Mart Pesantren Syariah</p>
                <p className="text-[9px] text-slate-500">{madrasahInfo.telepon} &bull; {madrasahInfo.kota}</p>
              </div>

              {/* Metadata */}
              <div className="space-y-0.5 text-[10px] text-slate-700 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{receiptModalTrx.nomorNota}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{receiptModalTrx.tanggal} {receiptModalTrx.waktu}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{receiptModalTrx.kasir}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold">{receiptModalTrx.pembeliNama}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2">
                {receiptModalTrx.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-semibold text-slate-900 truncate">{it.nama}</div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{it.jumlah} x Rp {it.harga.toLocaleString('id-ID')}</span>
                      <span className="font-bold text-slate-900">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {receiptModalTrx.totalBelanja.toLocaleString('id-ID')}</span>
                </div>
                {receiptModalTrx.diskonTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon:</span>
                    <span>- Rp {receiptModalTrx.diskonTotal.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>Rp {receiptModalTrx.totalAkhir.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700">
                  <span>Metode:</span>
                  <span className="font-bold uppercase">{receiptModalTrx.metodeBayar.replace('_', ' ')}</span>
                </div>
                {receiptModalTrx.metodeBayar === 'tunai' && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-700">
                      <span>Tunai Diterima:</span>
                      <span>Rp {receiptModalTrx.nominalBayar.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-700">
                      <span>Kembalian:</span>
                      <span>Rp {receiptModalTrx.kembalian.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Quote */}
              <div className="text-center pt-2 border-t border-dashed border-slate-400 space-y-0.5 text-[9px] text-slate-600">
                <p className="font-bold">جَزَاكُمُ اللهُ خَيْرًا كَثِيْرًا</p>
                <p>Terima kasih telah berbelanja di Koperasi Pesantren</p>
                <p className="text-[8px] text-slate-400">Barang yang dibeli berkah & bermanfaat</p>
              </div>
            </div>

            {/* Print & Share Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Nota / Struk</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptModalTrx(null)}
                className="px-4 py-2.5 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-300 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: TAMBAH / EDIT PRODUK KOPERASI */}
      {/* ============================================================ */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg glass-panel border border-white/20 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>{editingProductId ? 'Edit Data Produk Koperasi' : 'Tambah Produk Baru ke Etalase'}</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Nama Produk / Kitab / Barang *</label>
                <input
                  type="text"
                  required
                  value={productFormData.nama}
                  onChange={e => setProductFormData(p => ({ ...p, nama: e.target.value }))}
                  placeholder="Contoh: Kitab Fathul Qorib Al-Mujib"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Kategori Produk</label>
                  <select
                    value={productFormData.kategori}
                    onChange={e => setProductFormData(p => ({ ...p, kategori: e.target.value as any }))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-semibold focus:outline-none"
                  >
                    {KATEGORI_LIST.map(k => (
                      <option key={k} value={k} className="bg-slate-900 text-white">{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">SKU / Barcode EAN</label>
                  <input
                    type="text"
                    value={productFormData.barcode}
                    onChange={e => setProductFormData(p => ({ ...p, barcode: e.target.value }))}
                    placeholder="899100101"
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Harga Beli / HPP (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productFormData.hargaBeli}
                    onChange={e => setProductFormData(p => ({ ...p, hargaBeli: Number(e.target.value) }))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productFormData.hargaJual}
                    onChange={e => setProductFormData(p => ({ ...p, hargaJual: Number(e.target.value) }))}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs font-mono font-bold text-amber-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min={0}
                    value={productFormData.stok}
                    onChange={e => setProductFormData(p => ({ ...p, stok: Number(e.target.value) }))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Min. Stok Alert</label>
                  <input
                    type="number"
                    min={0}
                    value={productFormData.minStok}
                    onChange={e => setProductFormData(p => ({ ...p, minStok: Number(e.target.value) }))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={productFormData.satuan}
                    onChange={e => setProductFormData(p => ({ ...p, satuan: e.target.value }))}
                    placeholder="pcs / buku / buah"
                    className="w-full glass-input px-3 py-2 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">URL Foto Produk (Opsional)</label>
                <input
                  type="url"
                  value={productFormData.fotoUrl}
                  onChange={e => setProductFormData(p => ({ ...p, fotoUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={productFormData.deskripsi}
                  onChange={e => setProductFormData(p => ({ ...p, deskripsi: e.target.value }))}
                  placeholder="Keterangan bahan, penerbit, jilid..."
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel-subtle hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold shadow-lg"
                >
                  {editingProductId ? 'Simpan Perubahan' : 'Tambahkan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

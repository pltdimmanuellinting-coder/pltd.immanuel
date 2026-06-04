import React, { useState } from 'react';
import { ChevronLeft, Search, FileText, CheckCircle2, Circle, Edit3, X, Save, Trash2, Lock, Unlock, Loader2, Download, FileJson } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TagihanDetail, TagihanPeriod } from '../types';
import PageHeader from './PageHeader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TagihanPage({ onBack, role }: { onBack: () => void, role: string }) {
  const { 
    tagihanPeriods, tagihanDetails, setTagihanDetails, 
    tarifs, showToast, deleteTagihanPeriod, saveTagihanDetail 
  } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TagihanPeriod | null>(null);
  const [search, setSearch] = useState('');
  
  const [editingDetail, setEditingDetail] = useState<TagihanDetail | null>(null);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null);

  const handleDeletePeriodClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPeriodToDelete(id);
  };

  const confirmDeletePeriod = async () => {
    if (!periodToDelete) return;
    setIsDeleting(periodToDelete);
    try {
      await deleteTagihanPeriod(periodToDelete);
      showToast('Periode tagihan berhasil dihapus');
    } catch (err: any) {
      console.error('Delete error details:', err);
      showToast(`Gagal menghapus: ${err.message || 'Kesalahan sistem'}`, 'error');
    } finally {
      setIsDeleting(null);
      setPeriodToDelete(null);
    }
  };

  if (!selectedPeriod) {
    return (
      <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
        <PageHeader title="TAGIHAN" onBack={onBack} />

        <div className="p-4 space-y-4 pb-32 overflow-y-auto flex-1 bg-white">
          {tagihanPeriods.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada tagihan yang digenerate.</p>
            </div>
          ) : (
            tagihanPeriods.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedPeriod(p)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">Tagihan {months[p.month]} {p.year}</h3>
                  <p className="text-xs text-slate-500 mt-1">Total {p.totalDays} Malam</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-sm font-black text-blue-700">Rp {p.totalAmount.toLocaleString('id-ID')}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Generate: {new Date(p.generatedDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  {role === 'Operator' && (
                    <button 
                      onClick={(e) => handleDeletePeriodClick(p.id, e)}
                      disabled={isDeleting === p.id}
                      className={`p-2 rounded-xl transition-all ${isDeleting === p.id ? 'text-slate-300' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                    >
                      {isDeleting === p.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {periodToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Periode Tagihan?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Peringatan: Anda akan menghapus seluruh data tagihan dan riwayat pada periode ini secara permanen. Lanjutkan?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPeriodToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors"
                  disabled={!!isDeleting}
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeletePeriod}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
                  disabled={!!isDeleting}
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const periodDetails = tagihanDetails.filter(d => d.periodId === selectedPeriod.id);
  
  const filteredDetails = periodDetails.filter(d => 
    d.snapshotPelangganName.toLowerCase().includes(search.toLowerCase()) || 
    d.pelangganId.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleLunas = async (id: string, currentStatus: string) => {
    const detail = tagihanDetails.find(d => d.id === id);
    if (detail) {
      await saveTagihanDetail({ ...detail, status: currentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas' });
    }
  };

  const handleToggleLock = async (id: string, currentLockStatus?: boolean) => {
    const detail = tagihanDetails.find(d => d.id === id);
    if (detail) {
      await saveTagihanDetail({ ...detail, isLocked: !currentLockStatus });
      showToast(currentLockStatus ? 'Data berhasil dibuka kuncinya' : 'Data berhasil dikunci permanen');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDetail) {
      await saveTagihanDetail(editingDetail);
      setEditingDetail(null);
      showToast('Perubahan berhasil disimpan');
    }
  };

  const exportBillToPDF = async () => {
    if (!selectedPeriod || periodDetails.length === 0) return;
    
    // Create a temporary hidden element for capture
    const element = document.createElement('div');
    element.style.padding = '20px';
    element.style.background = 'white';
    element.style.width = '800px';
    element.innerHTML = `
      <div style="font-family: sans-serif;">
        <h1 style="color: #1d4ed8; margin: 0;">DAFTAR TAGIHAN LISTRIK</h1>
        <h2 style="color: #64748b; margin: 5px 0 20px 0;">Periode ${months[selectedPeriod.month]} ${selectedPeriod.year}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Nama</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Jalur</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Pemakaian</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Total Tagihan</th>
              <th style="padding: 10px; border: 1px solid #e2e8f0;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${periodDetails.map(d => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${d.snapshotPelangganName}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${d.snapshotJalurName}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${d.pemakaianHari} Mlm</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">Rp ${d.totalTagihan.toLocaleString('id-ID')}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">${d.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: right; color: #94a3b8; font-size: 10px;">
          Dicetak pada: ${new Date().toLocaleString('id-ID')}
        </div>
      </div>
    `;
    document.body.appendChild(element);

    try {
      showToast('Menyiapkan file PDF...', 'success');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`tagihan_${months[selectedPeriod.month]}_${selectedPeriod.year}.pdf`);
      showToast('Unduh PDF Berhasil');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat PDF', 'error');
    } finally {
      document.body.removeChild(element);
    }
  };

  const exportBillToCSV = () => {
    if (!selectedPeriod || periodDetails.length === 0) return;
    
    const headers = ['ID Pelanggan', 'Nama Pelanggan', 'Jalur', 'Tarif', 'Harga Tarif', 'Pemakaian (Mlm)', 'Total Tagihan', 'Kolektor', 'Status', 'Catatan'];
    const rows = periodDetails.map(d => [
      d.pelangganId,
      d.snapshotPelangganName,
      d.snapshotJalurName,
      d.snapshotTarifName,
      d.snapshotTarifPrice,
      d.pemakaianHari,
      d.totalTagihan,
      d.kolektorName || '',
      d.status,
      d.catatan
    ].map(field => `"${field}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tagihan_${months[selectedPeriod.month]}_${selectedPeriod.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data tagihan berhasil diekspor ke CSV');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
      <PageHeader 
        title={`${months[selectedPeriod.month]} ${selectedPeriod.year}`} 
        onBack={() => setSelectedPeriod(null)} 
      />

      <div className="shrink-0 bg-blue-700 px-4 pb-4">
        <div className="flex items-center gap-2">
          <div className="relative z-10 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari pelanggan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-medium"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={exportBillToPDF}
              title="Ekspor PDF"
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
            >
              <FileJson size={20} />
            </button>
            <button 
              onClick={exportBillToCSV}
              title="Ekspor CSV"
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {filteredDetails.map(d => (
          <div key={d.id} className={`bg-white rounded-xl p-4 shadow-sm border ${d.status === 'Lunas' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'} transition-all relative overflow-hidden`}>
            {d.status === 'Lunas' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
            
            <div className="flex justify-between items-start mb-2 pl-2 gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-2">
                  {d.snapshotPelangganName}
                  {d.isLocked && <Lock size={12} className="text-red-500" />}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">ID: {d.pelangganId} • Jalur: {d.snapshotJalurName}</p>
                {d.snapshotPelangganAlamat && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{d.snapshotPelangganAlamat}</p>}
                
                {d.kolektorName && <p className="text-[10px] text-orange-600 font-bold flex mt-1 bg-orange-50 w-max px-2 py-0.5 rounded">Kolektor: {d.kolektorName}</p>}
              </div>
              
              <button 
                onClick={() => handleToggleLunas(d.id, d.status)}
                disabled={d.isLocked && role !== 'Operator'}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${d.status === 'Lunas' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'} ${d.isLocked && role !== 'Operator' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {d.status === 'Lunas' ? <CheckCircle2 size={24} className="mb-1" /> : <Circle size={24} className="mb-1" />}
                <span className="text-[10px] font-black uppercase text-center leading-none">{d.status}</span>
              </button>
            </div>

            <div className="bg-white rounded-xl p-3 mt-3 border border-slate-100 ml-2">
              <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-2">
                <span className="text-slate-600 text-xs font-bold">{d.snapshotTarifName}</span>
                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Rp {d.snapshotTarifPrice.toLocaleString('id-ID')} / mlm</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between py-1">
                 <span>Total Bln: {d.totalHariSebulan} mlm</span>
                 <span>Mati Listrik: {d.hariMatiListrik} mlm</span>
              </div>
              <div className="text-[10px] text-slate-700 font-bold flex justify-between pb-2 border-b border-slate-200">
                 <span>Operasi Bersih:</span>
                 <span>{d.pemakaianHari} Malam</span>
              </div>
              <div className="flex justify-between items-end pt-2 mt-1">
                <div className="flex-1">
                  {d.status === 'Belum Lunas' && d.catatan && (
                    <div className="text-[10px] text-red-600 font-medium bg-red-50 p-1.5 rounded mr-2 line-clamp-2">
                      Catatan: {d.catatan}
                    </div>
                  )}
                  {d.status === 'Lunas' && d.catatan && (
                    <div className="text-[10px] text-emerald-600 font-medium bg-emerald-50 p-1.5 rounded mr-2 line-clamp-2">
                      Catatan: {d.catatan}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Total Tagihan</div>
                  <div className="font-black text-blue-700 text-lg leading-none">Rp {d.totalTagihan.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>

            <div className="mt-2 ml-2 flex justify-between gap-2">
               {role === 'Operator' ? (
                 <button 
                   onClick={() => handleToggleLock(d.id, d.isLocked)}
                   className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-colors ${d.isLocked ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'}`}
                 >
                   {d.isLocked ? <><Unlock size={14} /> Buka Kunci</> : <><Lock size={14} /> Kunci Data</>}
                 </button>
               ) : <div/>}

               {!(d.isLocked && role !== 'Operator') && (
                 <button 
                   onClick={() => setEditingDetail(d)}
                   className="flex-1 text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1 hover:text-blue-600 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                 >
                   <Edit3 size={14} /> Edit Data
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      {editingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="font-bold text-slate-800 text-sm tracking-wider">Sesuaikan Tagihan</h2>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{editingDetail.snapshotPelangganName}</p>
              </div>
              <button type="button" onClick={() => setEditingDetail(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[70vh]">
              <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold mb-1 block">Tarif (Rp / Malam)</label>
                <select 
                  value={editingDetail.snapshotTarifName} 
                  onChange={e => {
                    const chosen = tarifs.find(t => t.name === e.target.value);
                    if(chosen) {
                      setEditingDetail({
                        ...editingDetail, 
                        snapshotTarifName: chosen.name, 
                        snapshotTarifPrice: chosen.price,
                        totalTagihan: chosen.price * editingDetail.pemakaianHari
                      });
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium font-mono"
                >
                  <option value={editingDetail.snapshotTarifName}>{editingDetail.snapshotTarifName} (Bawaan Generasi)</option>
                  {tarifs.map(t => (
                    t.name !== editingDetail.snapshotTarifName && <option key={t.id} value={t.name}>{t.name} (Rp {t.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold mb-1 block">Total Tagihan Bersih (Rp)</label>
                <input 
                  type="number" 
                  required 
                  value={editingDetail.totalTagihan} 
                  onChange={e => setEditingDetail({...editingDetail, totalTagihan: Number(e.target.value)})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-bold mb-1 block">Catatan Tambahan / Kekurangan</label>
                <textarea 
                  value={editingDetail.catatan} 
                  onChange={e => setEditingDetail({...editingDetail, catatan: e.target.value})}
                  placeholder="Misal: Kurang bayar Rp 5.000 bulan lalu"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium rows-3"
                ></textarea>
              </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors flex justify-center items-center gap-2">
                  <Save size={18} />
                  Simpan Penyesuaian
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

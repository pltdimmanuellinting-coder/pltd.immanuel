import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Users, Wallet, Route, UserSquare2, X, Trash2, Edit2, Save, Power, PowerOff, Download } from 'lucide-react';
import { Pelanggan, Tarif, Jalur, Kolektor } from '../types';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';

export default function PelangganPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'pelanggan' | 'tarif' | 'jalur' | 'kolektor'>('pelanggan');

  const {
    pelanggans, setPelanggans,
    tarifs, setTarifs,
    jalurs, setJalurs,
    kolektors, setKolektors,
    showToast,
    savePelanggan, deletePelanggan,
    saveTarif, deleteTarif,
    saveJalur, deleteJalur,
    saveKolektor, deleteKolektor
  } = useAppContext();

  const [modal, setModal] = useState<{isOpen: boolean; mode: 'view'|'edit'|'add'; data: any}>({isOpen: false, mode: 'view', data: null});

  const handleAdd = () => {
    setModal({ isOpen: true, mode: 'add', data: { status: 'Aktif' } });
  };

  const closeModal = () => setModal({isOpen: false, mode: 'view', data: null});

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      if (activeTab === 'pelanggan') await deletePelanggan(id);
      if (activeTab === 'tarif') await deleteTarif(id);
      if (activeTab === 'jalur') await deleteJalur(id);
      if (activeTab === 'kolektor') await deleteKolektor(id);
      showToast('Data berhasil dihapus');
      closeModal();
    }
  };

  const generatePelangganId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randChars = Array.from({length: 5}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const countStr = (pelanggans.length + 1).toString().padStart(3, '0');
    return `PLTDIM-${randChars}${countStr}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAdd = modal.mode === 'add';
    const data = { ...modal.data }; // Clone to avoid direct mutation issues
    
    try {
      if (activeTab === 'pelanggan') {
        if (isAdd) {
          data.id = generatePelangganId();
          const baseUsername = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'user';
          if (!data.username) data.username = `${baseUsername}@pelanggan`;
          if (!data.password) data.password = Math.floor(1000 + Math.random() * 9000).toString();
        }
        await savePelanggan(data as Pelanggan);
      } else if (activeTab === 'tarif') {
        if (isAdd) data.id = 't' + Date.now();
        await saveTarif(data as Tarif);
      } else if (activeTab === 'jalur') {
        if (isAdd) data.id = 'j' + Date.now();
        await saveJalur(data as Jalur);
      } else if (activeTab === 'kolektor') {
         if (isAdd) {
           data.id = 'k' + Date.now();
           const baseUsername = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'kolektor';
           if (!data.username) data.username = `${baseUsername}@kolektor`;
           if (!data.password) data.password = Math.floor(1000 + Math.random() * 9000).toString();
         }
         await saveKolektor(data as Kolektor);
      }
      showToast(`Data berhasil ${isAdd ? 'ditambahkan' : 'diperbarui'}`);
      closeModal();
    } catch (err) {
      console.error('Failed to save:', err);
      showToast('Gagal menyimpan data ke database', 'error');
    }
  };

  const sortedPelanggans = useMemo(() => {
    return [...pelanggans].sort((a, b) => {
       // First by status (Active first)
       if (a.status === 'Aktif' && b.status !== 'Aktif') return -1;
       if (a.status !== 'Aktif' && b.status === 'Aktif') return 1;
       // Then by createdAt (Older first)
       return (a.createdAt || 0) - (b.createdAt || 0);
    });
  }, [pelanggans]);

  const sortedTarifs = useMemo(() => [...tarifs].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [tarifs]);
  const sortedJalurs = useMemo(() => [...jalurs].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [jalurs]);
  const sortedKolektors = useMemo(() => [...kolektors].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)), [kolektors]);

  const getCombinedAlamat = (p: Pelanggan, j?: Jalur) => {
    if (p.alamat) return p.alamat;
    if (j?.alamat) return j.alamat;
    return <span className="italic text-slate-400">Tidak ada alamat</span>;
  };

  const exportToCSV = () => {
    if (pelanggans.length === 0) return showToast('Tidak ada data untuk diekspor', 'error');
    
    const headers = ['ID', 'Nama', 'Alamat', 'Jalur', 'Tarif', 'Username', 'Password', 'Status'];
    const rows = pelanggans.map(p => {
      const t = tarifs.find(exT => exT.id === p.tarifId);
      const j = jalurs.find(exJ => exJ.id === p.jalurId);
      return [
        p.id,
        p.name,
        p.alamat || j?.alamat || '',
        j?.name || '',
        t?.name || '',
        p.username || '',
        p.password || '',
        p.status
      ].map(field => `"${field}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_pelanggan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data berhasil diekspor ke CSV');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
      <PageHeader title="DATA PELANGGAN" onBack={onBack} />
      
      {/* Pill Style Tabs */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex rounded-2xl bg-slate-100 p-1 shadow-inner h-11">
            {[
              { id: 'pelanggan', label: 'PELANGGAN' },
              { id: 'jalur', label: 'JALUR' },
              { id: 'tarif', label: 'TARIF' },
              { id: 'kolektor', label: 'KOLEKTOR' }
            ].map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-1 py-2 text-[8px] font-black rounded-xl transition-all ${activeTab === tab.id ? 'bg-white shadow-md text-blue-700 font-black' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button 
            onClick={exportToCSV}
            title="Ekspor CSV"
            className="w-11 h-11 bg-white border border-slate-200 text-slate-600 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-32 flex-1 overflow-y-auto">
        {activeTab === 'pelanggan' && (
          sortedPelanggans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Users size={48} className="opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest">Belum ada data pelanggan</p>
              <button onClick={handleAdd} className="mt-2 text-blue-600 font-bold text-xs uppercase underline">Tambah Sekarang</button>
            </div>
          ) : sortedPelanggans.map((p, index) => {
            const t = tarifs.find(t => t.id === p.tarifId);
            const j = jalurs.find(j => j.id === p.jalurId);
            const active = p.status === 'Aktif';
            return (
              <div key={p.id} onClick={() => setModal({isOpen: true, mode: 'view', data: p})} className={`cursor-pointer bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden group hover:border-blue-300 transition-colors ${!active ? 'opacity-60 saturate-50' : ''}`}>
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${active ? 'bg-blue-500 group-hover:bg-blue-600' : 'bg-slate-400 group-hover:bg-slate-500'}`}></div>
                <div className="absolute top-3 right-3 text-slate-200 font-black text-xl group-hover:text-blue-100 transition-colors">
                  #{index + 1}
                </div>
                <div className="flex justify-between items-start pl-2 pr-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-2">
                      {p.name}
                      {!active && <span className="bg-slate-100 text-slate-500 text-[10px] uppercase px-1.5 py-0.5 rounded font-black">Nonaktif</span>}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">ID: {p.id}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{j?.name || 'No Jalur'}</span>
                </div>
                <div className="px-2 text-xs text-slate-600 mb-1 line-clamp-1">{getCombinedAlamat(p, j)}</div>
                <div className="bg-blue-50/50 rounded-xl p-3 text-sm flex justify-between items-center ml-2 border border-blue-100/50">
                  <span className="text-slate-600 text-xs font-medium">{t?.name || 'No Tarif'}</span>
                  <span className="font-bold text-blue-700 text-xs shadow-sm bg-white px-2 py-1 rounded-md border border-blue-100">Rp {(t?.price || 0).toLocaleString('id-ID')} / Malam</span>
                </div>
              </div>
            );
          })
        )}

        {activeTab === 'tarif' && (
          sortedTarifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Wallet size={48} className="opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest">Belum ada data tarif</p>
              <button onClick={handleAdd} className="mt-2 text-blue-600 font-bold text-xs uppercase underline">Tambah Sekarang</button>
            </div>
          ) : sortedTarifs.map((t, index) => (
            <div key={t.id} onClick={() => setModal({isOpen: true, mode: 'view', data: t})} className="cursor-pointer bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex justify-between items-center group hover:border-blue-300 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:bg-emerald-600 transition-colors"></div>
              <div className="flex items-center gap-3 pl-2">
                <span className="text-slate-200 font-black text-lg w-6 group-hover:text-emerald-100 transition-colors">#{index + 1}</span>
                <h3 className="font-bold text-slate-800 text-sm">{t.name}</h3>
              </div>
              <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm border border-blue-100">Rp {(t.price).toLocaleString('id-ID')}</span>
            </div>
          ))
        )}

        {activeTab === 'jalur' && (
          sortedJalurs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Route size={48} className="opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest">Belum ada data jalur</p>
              <button onClick={handleAdd} className="mt-2 text-blue-600 font-bold text-xs uppercase underline">Tambah Sekarang</button>
            </div>
          ) : sortedJalurs.map((j, index) => (
            <div key={j.id} onClick={() => setModal({isOpen: true, mode: 'view', data: j})} className="cursor-pointer bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-300 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 group-hover:bg-purple-600 transition-colors"></div>
              <div className="flex items-center gap-3 pl-2">
                <span className="text-slate-200 font-black text-lg w-6 group-hover:text-purple-100 transition-colors">#{index + 1}</span>
                <h3 className="font-bold text-slate-800 text-sm">{j.name}</h3>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md font-medium uppercase border border-slate-200">ID: {j.id}</span>
            </div>
          ))
        )}

        {activeTab === 'kolektor' && (
          sortedKolektors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <UserSquare2 size={48} className="opacity-20" />
              <p className="font-bold text-xs uppercase tracking-widest">Belum ada data kolektor</p>
              <button onClick={handleAdd} className="mt-2 text-blue-600 font-bold text-xs uppercase underline">Tambah Sekarang</button>
            </div>
          ) : sortedKolektors.map((k, index) => (
            <div key={k.id} onClick={() => setModal({isOpen: true, mode: 'view', data: k})} className="cursor-pointer bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 group hover:border-blue-300 transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:bg-orange-600 transition-colors"></div>
              <div className="absolute top-3 right-3 text-slate-200 font-black text-xl group-hover:text-orange-100 transition-colors">#{index + 1}</div>
              <div className="pl-2">
                <h3 className="font-bold text-slate-800 text-sm mb-2">{k.name}</h3>
                <div className="flex flex-wrap gap-2 pr-6">
                  {(k.jalurIds || []).map(jid => {
                    const jal = jalurs.find(j => j.id === jid);
                    return (
                      <span key={jid} className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {jal?.name || jid}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  User: {k.username || '-'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleAdd}
        className="fixed bottom-[104px] right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-30"
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                {modal.mode === 'add' ? 'Tambah ' : modal.mode === 'edit' ? 'Edit ' : 'Detail '}
                {activeTab}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 bg-white">
              {modal.mode === 'view' ? (
                <div className="space-y-4">
                  {activeTab === 'pelanggan' && (
                    <>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Status</label>
                        <div className={`font-semibold text-xs px-2 py-1 rounded inline-block ${modal.data.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{modal.data.status}</div>
                      </div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nama</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.name}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Alamat Pribadi</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.alamat || <span className="italic opacity-50">Mengikuti alamat Jalur</span>}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Jalur</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{jalurs.find(j => j.id === modal.data.jalurId)?.name || modal.data.jalurId}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tarif</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{tarifs.find(t => t.id === modal.data.tarifId)?.name || modal.data.tarifId}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Username</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.username || '-'}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Password</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.password || '-'}</div></div>
                    </>
                  )}
                  {activeTab === 'tarif' && (
                    <>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nama Tarif</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.name}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Harga</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">Rp {modal.data.price?.toLocaleString('id-ID')}</div></div>
                    </>
                  )}
                  {activeTab === 'jalur' && (
                    <>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nama Jalur</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.name}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Alamat Regional Jalur</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.alamat || '-'}</div></div>
                    </>
                  )}
                  {activeTab === 'kolektor' && (
                    <>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nama Kolektor</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.name}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Jalur Dikelola</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(modal.data.jalurIds || []).map((jid: string) => (
                            <span key={jid} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">{jalurs.find(j => j.id === jid)?.name || jid}</span>
                          ))}
                        </div>
                      </div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Username Login</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.username || '-'}</div></div>
                      <div><label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Password</label><div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">{modal.data.password || '-'}</div></div>
                    </>
                  )}
                </div>
              ) : (
                <form id="modal-form" onSubmit={handleSave} className="space-y-4">
                  {activeTab === 'pelanggan' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Status Pelanggan</label>
                        <select required value={modal.data.status || 'Aktif'} onChange={(e) => setModal({...modal, data: {...modal.data, status: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-bold text-slate-700">
                          <option value="Aktif">🟢 Aktif</option>
                          <option value="Nonaktif">🔴 Nonaktif</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Pelanggan</label>
                        <input required value={modal.data.name || ''} onChange={(e) => setModal({...modal, data: {...modal.data, name: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Alamat / Keterangan (Kosong = Ikut Jalur)</label>
                        <textarea value={modal.data.alamat || ''} onChange={(e) => setModal({...modal, data: {...modal.data, alamat: e.target.value}})} placeholder="Isi alamat spesifik atau biarkan kosong" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium rows-2"></textarea>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Jalur</label>
                        <select required value={modal.data.jalurId || ''} onChange={(e) => setModal({...modal, data: {...modal.data, jalurId: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium">
                          <option value="">Pilih Jalur...</option>
                          {jalurs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Tarif</label>
                        <select required value={modal.data.tarifId || ''} onChange={(e) => setModal({...modal, data: {...modal.data, tarifId: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium">
                          <option value="">Pilih Tarif...</option>
                          {tarifs.map(t => <option key={t.id} value={t.id}>{t.name} (Rp {t.price})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Username Login</label>
                        <input value={modal.data.username || ''} onChange={(e) => setModal({...modal, data: {...modal.data, username: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Password Login</label>
                        <input type="text" value={modal.data.password || ''} onChange={(e) => setModal({...modal, data: {...modal.data, password: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                    </>
                  )}

                  {activeTab === 'tarif' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Tarif</label>
                        <input required value={modal.data.name || ''} onChange={(e) => setModal({...modal, data: {...modal.data, name: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Harga (Rp)</label>
                        <input type="number" required value={modal.data.price || ''} onChange={(e) => setModal({...modal, data: {...modal.data, price: Number(e.target.value)}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                    </>
                  )}

                  {activeTab === 'jalur' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Jalur</label>
                        <input required value={modal.data.name || ''} onChange={(e) => setModal({...modal, data: {...modal.data, name: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Alamat Regional / Deskripsi Lokasi</label>
                        <textarea value={modal.data.alamat || ''} onChange={(e) => setModal({...modal, data: {...modal.data, alamat: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"></textarea>
                      </div>
                    </>
                  )}

                  {activeTab === 'kolektor' && (
                    <>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Kolektor</label>
                        <input required value={modal.data.name || ''} onChange={(e) => setModal({...modal, data: {...modal.data, name: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-2 block">Jalur yang Dikelola</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto px-1 py-1">
                          {jalurs.map(j => (
                            <label key={j.id} className="flex items-center gap-3 text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={modal.data.jalurIds?.includes(j.id) || false}
                                onChange={(e) => {
                                  const gids = modal.data.jalurIds || [];
                                  if (e.target.checked) setModal({...modal, data: {...modal.data, jalurIds: [...gids, j.id]}});
                                  else setModal({...modal, data: {...modal.data, jalurIds: gids.filter((id: string) => id !== j.id)}});
                                }}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                              />
                              <span className="font-semibold text-slate-700">{j.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Username Login</label>
                        <input required value={modal.data.username || ''} onChange={(e) => setModal({...modal, data: {...modal.data, username: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-bold mb-1 block">Password Login</label>
                        <input type="text" required value={modal.data.password || ''} onChange={(e) => setModal({...modal, data: {...modal.data, password: e.target.value}})} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
              {modal.mode === 'view' && (
                <>
                  <button onClick={() => handleDelete(modal.data.id)} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                    <Trash2 size={18} /> Hapus
                  </button>
                  <button onClick={() => setModal({...modal, mode: 'edit'})} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-colors">
                    <Edit2 size={18} /> Edit
                  </button>
                </>
              )}
              {(modal.mode === 'edit' || modal.mode === 'add') && (
                <>
                  <button onClick={() => { modal.mode === 'add' ? closeModal() : setModal({...modal, mode: 'view'}) }} className="flex-1 bg-white text-slate-700 font-bold py-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors">
                    Batal
                  </button>
                  <button form="modal-form" type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-colors">
                    <Save size={18} /> Simpan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

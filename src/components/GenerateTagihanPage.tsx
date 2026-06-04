import React, { useState, useMemo } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, FileOutput, Calculator, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TagihanDetail } from '../types';
import PageHeader from './PageHeader';

export default function GenerateTagihanPage({ onBack }: { onBack: () => void }) {
  const { 
    pelanggans, tarifs, jalurs, kolektors, tagihanPeriods, 
    saveTagihanPeriod, saveTagihanDetail, deleteTagihanPeriod, showToast 
  } = useAppContext();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [matiListrik, setMatiListrik] = useState<Record<string, number>>({});

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleMatiListrikChange = (jalurId: string, days: number) => {
    setMatiListrik(prev => ({
      ...prev,
      [jalurId]: days
    }));
  };

  const calculateDays = () => {
    const start = new Date(selectedYear, selectedMonth, 5);
    const end = new Date(selectedMonth === 11 ? selectedYear + 1 : selectedYear, (selectedMonth + 1) % 12, 4);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return totalDays;
  };

  const totalDays = useMemo(() => calculateDays(), [selectedMonth, selectedYear]);

  const handleGenerate = async () => {
    const existing = tagihanPeriods.find(p => p.month === selectedMonth && p.year === selectedYear);
    if (existing) {
      if(!window.confirm('Tagihan periode ini sudah ada. Menimpa akan menghapus data lama. Lanjutkan?')) {
        return;
      }
      setIsGenerating(true);
      await deleteTagihanPeriod(existing.id);
    } else {
      setIsGenerating(true);
    }

    try {
      const periodId = 'tp-' + Date.now();
      let computedTotalAmount = 0;
      const detailsToSave: TagihanDetail[] = [];

      pelanggans.filter(p => p.status === 'Aktif').forEach((p, idx) => {
        const tarif = tarifs.find(t => t.id === p.tarifId);
        const jalur = jalurs.find(j => j.id === p.jalurId);
        const price = tarif?.price || 0;
        const daysOff = matiListrik[p.jalurId] || 0;
        const pemakaianHari = Math.max(0, totalDays - daysOff);
        const totalTagihan = pemakaianHari * price;
        computedTotalAmount += totalTagihan;
        const matchedKolektor = kolektors.find(k => k.jalurIds.includes(p.jalurId));

        detailsToSave.push({
          id: 'td-' + periodId + '-' + idx,
          periodId: periodId,
          pelangganId: p.id,
          snapshotPelangganName: p.name,
          snapshotPelangganAlamat: p.alamat || '',
          snapshotPelangganUsername: p.username || '',
          snapshotPelangganPassword: p.password || '',
          snapshotJalurName: jalur?.name || 'Unknown',
          snapshotTarifName: tarif?.name || 'Unknown',
          snapshotTarifPrice: price,
          kolektorId: matchedKolektor ? matchedKolektor.id : null,
          kolektorName: matchedKolektor ? matchedKolektor.name : null,
          pemakaianHari: pemakaianHari,
          totalHariSebulan: totalDays,
          hariMatiListrik: daysOff,
          totalTagihan: totalTagihan,
          catatan: '',
          status: 'Belum Lunas',
          isLocked: false
        });
      });

      await saveTagihanPeriod({
        id: periodId,
        month: selectedMonth,
        year: selectedYear,
        totalDays: totalDays,
        totalAmount: computedTotalAmount,
        generatedDate: new Date().toISOString()
      });

      for (const detail of detailsToSave) {
        await saveTagihanDetail(detail);
      }

      showToast(`Tagihan Periode ${months[selectedMonth]} ${selectedYear} sukses.`);
      onBack();
    } catch (e) {
      showToast('Gagal generate', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
      <PageHeader title="GENERATE TAGIHAN" onBack={onBack} />

      <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-3">
        {/* Period Selection */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 shrink-0">
          <h2 className="text-[10px] font-black text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-tight">
            <CalendarIcon size={12} className="text-blue-600" />
            Periode Penagihan
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none">
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="mt-2 bg-blue-50 rounded-lg p-2 border border-blue-100 flex items-center justify-between text-[9px]">
            <div className="text-blue-800 leading-tight">
              Rentang: <strong className="font-black">5 {months[selectedMonth].substring(0,3)} - 4 {months[(selectedMonth + 1) % 12].substring(0,3)}</strong>
            </div>
            <div className="text-center bg-white px-2 py-0.5 rounded border border-blue-100 font-black text-blue-700 text-xs">
              {totalDays} Malam
            </div>
          </div>
        </div>

        {/* Mati Listrik Input */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
          <h2 className="text-[10px] font-black text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-tight shrink-0">
            <Calculator size={12} className="text-red-500" />
            Pengurangan Mati Listrik per Jalur
          </h2>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {jalurs.map(j => {
              const daysOff = matiListrik[j.id] || 0;
              return (
                <div key={j.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div className="flex-1 truncate">
                    <h3 className="text-[10px] font-bold text-slate-800">{j.name}</h3>
                    <p className="text-[8px] text-slate-500">Ops: {Math.max(0, totalDays - daysOff)} Malam</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input type="number" min="0" max={totalDays} value={daysOff} onChange={(e) => handleMatiListrikChange(j.id, Number(e.target.value))} className="w-10 bg-white border border-slate-200 rounded text-center font-bold text-[11px] py-0.5 outline-none" />
                    <span className="text-[8px] font-semibold text-slate-400">mlm</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm shrink-0 ${isGenerating ? 'bg-slate-300 text-slate-500' : 'bg-blue-600 text-white shadow-blue-200'}`}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <><FileOutput size={18} /> GENERATE TAGIHAN</>}
        </button>
      </div>
    </div>
  );
}

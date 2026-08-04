import React from 'react';
import { ClipboardList, History, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function CollectorDashboard({ onNavigate }: { onNavigate: (tab: any, period?: any) => void }) {
  const { currentUser, tagihanDetails, tagihanPeriods } = useAppContext();
  
  // Stats for collector
  const myTagihans = tagihanDetails.filter(d => d.kolektorId === currentUser?.id);
  const totalTagihan = myTagihans.length;
  const lunasCount = myTagihans.filter(d => d.status === 'Lunas').length;
  const pendingCount = totalTagihan - lunasCount;
  const collectionRate = totalTagihan > 0 ? Math.round((lunasCount / totalTagihan) * 100) : 0;

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
            <ClipboardList size={18} />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalTagihan}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase">Total Tagihan</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-2">
            <CheckCircle size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-600">{lunasCount}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase">Sudah Bayar</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-4">Progress Koleksi</h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-black">{collectionRate}%</span>
          <span className="text-xs font-bold text-indigo-100 uppercase">{lunasCount} / {totalTagihan} Pelanggan</span>
        </div>
        <div className="w-full bg-indigo-900/30 rounded-full h-3 border border-white/5 overflow-hidden">
          <div className="bg-white h-full transition-all duration-1000" style={{ width: `${collectionRate}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-600 rounded-full" />
          Menu Kolektor
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              // Sort periods descending by year then month to find the latest monthly period generated
              const latestPeriod = tagihanPeriods && tagihanPeriods.length > 0
                ? [...tagihanPeriods].sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  })[0]
                : null;
              onNavigate('tagihan_latest', latestPeriod);
            }}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:bg-blue-50/10 transition-all group active:scale-[0.98] h-full"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
               <ClipboardList size={24} />
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-slate-800 uppercase block leading-tight">Tagihan</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">Bulan Terakhir</span>
            </div>
          </button>

          <button 
            onClick={() => {
              onNavigate('tagihan_history');
            }}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:bg-emerald-50/10 transition-all group active:scale-[0.98] h-full"
          >
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
               <History size={24} />
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-slate-800 uppercase block leading-tight">Riwayat Tagihan</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 block">List Generate</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Area Penugasan Anda</h3>
        <div className="space-y-3">
           {(currentUser?.jalurIds || []).map((jid: string) => (
             <div key={jid} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400">
                   <MapPin size={16} />
                </div>
                <div className="text-xs font-black text-slate-700 uppercase">Jalur {jid}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

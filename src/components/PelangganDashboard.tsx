import React from 'react';
import { History, CreditCard, Zap, Activity, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function PelangganDashboard({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { currentUser, tagihanDetails, tarifs } = useAppContext();
  
  const myTagihans = tagihanDetails.filter(d => d.pelangganId === currentUser?.id).sort((a,b) => b.id.localeCompare(a.id));
  const activeBill = myTagihans.find(d => d.status === 'Belum Lunas');
  const myTarif = tarifs.find(t => t.id === currentUser?.tarifId);

  return (
    <div className="p-4 space-y-6">
      {/* Current Greeting */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Pelanggan</h2>
          <div className="text-2xl font-black mb-4">Halo, {currentUser?.name || 'User'}</div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 border-dashed flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Tarif Terpasang</div>
              <div className="text-sm font-black">{myTarif?.name || '-'}</div>
            </div>
            <div className="text-right">
               <div className="text-[10px] font-bold text-slate-400 uppercase">Nominal</div>
               <div className="text-sm font-black text-blue-400">Rp {myTarif?.price.toLocaleString('id-ID') || 0} / mlm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Card */}
      {activeBill && (
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-200 shadow-xl shadow-amber-900/5">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                 <CreditCard size={24} />
              </div>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100 italic">TAGIHAN AKTIF</div>
           </div>
           
           <h3 className="text-sm font-black text-slate-800 uppercase mb-1">Tagihan Belum Lunas</h3>
           <p className="text-xs text-slate-500 mb-6 font-medium">Bulan {activeBill.snapshotJalurName} (Generate System)</p>
           
           <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="text-[10px] font-black text-slate-400 uppercase">Total Yang Harus Dibayar</div>
              <div className="text-xl font-black text-blue-700">Rp {activeBill.totalTagihan.toLocaleString('id-ID')}</div>
           </div>

           <button 
             onClick={() => onNavigate('tagihan')}
             className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 uppercase tracking-tighter text-sm hover:bg-blue-700 transition-all active:scale-95"
           >
             Lihat Rincian Tagihan
           </button>
        </div>
      )}

      {/* Quick Access */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-600 rounded-full" />
          Menu Pelanggan
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('tagihan')}
            className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all"
          >
            <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
               <History size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase">Riwayat</span>
          </button>

          <button 
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-300 transition-all"
          >
            <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
               <Activity size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-700 uppercase">Statistik</span>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
         <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Info size={20} />
         </div>
         <div>
            <h4 className="text-[11px] font-black text-blue-800 uppercase mb-1">Informasi Pemakaian</h4>
            <p className="text-[10px] text-blue-600 leading-relaxed font-medium">Tagihan Anda dihitung berdasarkan jumlah malam beroperasi dikalikan tarif per malam yang disepakati.</p>
         </div>
      </div>
    </div>
  );
}

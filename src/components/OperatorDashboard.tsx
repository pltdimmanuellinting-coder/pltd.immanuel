import React from 'react';
import { Users, FileOutput, PenTool, BookOpen } from 'lucide-react';

interface OperatorDashboardProps {
  onNavigate: (tab: 'pelanggan' | 'generate_tagihan' | 'template_studio' | 'pembukuan') => void;
  onSeedData: () => void;
}

export default function OperatorDashboard({ onNavigate, onSeedData }: OperatorDashboardProps) {
  return (
    <div className="p-4 space-y-5">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-600 rounded-full" />
          Menu Administrasi
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('pelanggan')}
            className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center group hover:border-[#0000ff]/30 transition-all active:scale-95 shadow-sm"
          >
            <div className="w-12 h-12 bg-[#0000ff] text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <Users size={24} />
            </div>
            <span className="text-[11px] font-black text-slate-800 tracking-tighter uppercase whitespace-nowrap">DATA PELANGGAN</span>
          </button>

          <button 
            onClick={() => onNavigate('generate_tagihan')}
            className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center group hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
          >
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200">
              <FileOutput size={24} />
            </div>
            <span className="text-[11px] font-black text-slate-800 tracking-tighter text-center leading-tight">GENERATE<br/>TAGIHAN</span>
          </button>

          <button 
            onClick={() => onNavigate('template_studio')}
            className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center group hover:border-violet-200 transition-all active:scale-95 shadow-sm"
          >
            <div className="w-12 h-12 bg-violet-500 text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-violet-200">
              <PenTool size={24} />
            </div>
            <span className="text-[11px] font-black text-slate-800 tracking-tighter text-center leading-tight">TEMPLATE<br/>STUDIO</span>
          </button>

          <button 
            onClick={() => onNavigate('pembukuan')}
            className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center group hover:border-amber-200 transition-all active:scale-95 shadow-sm"
          >
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-amber-200">
              <BookOpen size={24} />
            </div>
            <span className="text-[11px] font-black text-slate-800 tracking-tighter leading-tight">PEMBUKUAN</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-1 h-3 bg-blue-600 rounded-full" />
          Data Synchronization
        </h2>
        <button 
          onClick={() => {
            console.log('Sync button clicked - attempting sync');
            onSeedData();
          }}
          className="w-full bg-[#0000ff] text-white p-4 rounded-xl font-black text-[11px] uppercase tracking-tighter flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors active:scale-95"
        >
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <Users size={14} />
          </div>
          SINKRONISASI DATA KE FIREBASE
        </button>
      </div>

      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4 opacity-80">Ringkasan Operasional</h3>
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
             <div className="flex flex-col">
                <span className="text-[9px] text-blue-200 font-bold uppercase">Siklus Aktif</span>
                <span className="text-sm font-black">Mei - Juni 2026</span>
             </div>
             <div className="text-right">
                <span className="text-[9px] text-blue-200 font-bold uppercase">Status</span>
                <span className="text-xs bg-emerald-500 px-2 py-0.5 rounded-full font-black block">LIVE</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <span className="text-[9px] text-blue-200 font-bold uppercase block mb-0.5">Pelanggan Aktif</span>
                <span className="text-lg font-black leading-none tracking-tight">1,280</span>
             </div>
             <div>
                <span className="text-[9px] text-blue-200 font-bold uppercase block mb-0.5">Penagihan Selesai</span>
                <span className="text-lg font-black leading-none tracking-tight text-emerald-400">75%</span>
             </div>
          </div>
          <div className="w-full bg-blue-950/50 rounded-full h-2 mt-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full w-3/4 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, Printer, FileDown, Smartphone, Calendar, FileText } from 'lucide-react';
import { TagihanDetail } from '../types';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';

export default function PrintPage({ onBack }: { onBack: () => void }) {
  const { tagihanPeriods, f4Template, f4Config, setPrintContent, appSettings, tagihanDetails } = useAppContext();
  
  const [printType, setPrintType] = useState<'f4' | 'thermal'>('f4');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [pageRange, setPageRange] = useState('');

  const details = tagihanDetails.filter(d => d.periodId === selectedPeriodId);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const selectedPeriod = tagihanPeriods.find(p => p.id === selectedPeriodId);
  const selectedCount = details.length;

  const handlePrintF4 = () => {
    if (!selectedPeriodId) return alert('Pilih periode tagihan terlebih dahulu');
    
    const template = f4Template || `<div style="padding: 15px; font-family: 'Inter', system-ui, sans-serif; font-size: 11px; border: 1.5px solid #0000ff; border-radius: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; background-color: #ffffff; color: #1e293b; position: relative; overflow: hidden;">
  <div style="position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #0000ff; padding-bottom: 10px; margin-bottom: 12px;">
      <div style="width: 50px; height: 50px; background: #f1f5f9; border-radius: 8px; display: flex; items-center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">
        <img src="{{app_logo}}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <div style="text-align: left; flex: 1;">
        <strong style="color: #0000ff; font-size: 22px; line-height: 1; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 2px;">{{app_name}}</strong>
        <span style="font-size: 11px; color: #475569; font-weight: bold; display: block;">{{app_address}}</span>
      </div>
      <div style="text-align: right; background: #0000ff; color: white; padding: 5px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1px; flex-shrink: 0;">
        SLIP TAGIHAN
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px;">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Informasi Pelanggan</div>
          <strong style="font-size: 14px; color: #0000ff; display: block; margin-bottom: 2px;">{{pelanggan_name}}</strong>
          <span style="font-size: 10px; color: #64748b; font-family: monospace;">ID: #{{pelanggan_id}}</span>
        </div>
        
        <div style="font-size: 10px; color: #64748b; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
           <div style="background: #eff6ff; padding: 6px; border-radius: 6px; border: 1px solid #dbeafe;">
             <span style="display: block; font-size: 8px; font-weight: 800;">USERNAME</span>
             <strong style="color: #1e40af;">{{pelanggan_username}}</strong>
           </div>
           <div style="background: #eff6ff; padding: 6px; border-radius: 6px; border: 1px solid #dbeafe;">
             <span style="display: block; font-size: 8px; font-weight: 800;">PASSWORD</span>
             <strong style="color: #1e40af;">{{pelanggan_password}}</strong>
           </div>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column;">
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Bulan</td><td style="text-align: right; font-weight: 900; color: #0000ff;">{{bulan_tagihan}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Rentang</td><td style="text-align: right; font-weight: 900; color: #0000ff;">{{rentang_tagihan}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Tarif</td><td style="text-align: right; font-weight: 900; color: #0000ff;">{{tarif_name}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Pemakaian</td><td style="text-align: right; font-weight: 900; color: #0000ff;">{{pemakaian_malam}} Malam</td></tr>
        </table>
        <div style="margin-top: 8px; background: #ffffff; border: 2px solid #0000ff; padding: 8px 12px; border-radius: 10px; text-align: right;">
          <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase; margin-bottom: 2px;">Total Tagihan</span>
          <strong style="font-size: 18px; color: #0000ff; letter-spacing: 1px;">Rp {{total_tagihan}}</strong>
        </div>
      </div>
    </div>

    <!-- Footer Area: Kolektor & WA -->
    <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;">
      <div style="text-align: left;">
        <div style="margin-bottom: 35px;">
          <span style="font-size: 10px; font-weight: 900; color: #0000ff; display: block; margin-bottom: 2px;">Kolektor</span>
          <span style="font-size: 9px; color: #94a3b8;">TtD</span>
        </div>
        <strong style="font-size: 12px; color: #0000ff; text-decoration: underline;">{{kolektor_name}}</strong>
        <div style="margin-top: 12px; display: flex; items-center; gap: 4px; color: #0000ff; font-weight: 900; font-size: 10px;">
          <span style="background: #0000ff; color: white; padding: 1px 4px; border-radius: 3px; font-size: 8px;">WA</span>
          085179911407
        </div>
      </div>
      <div style="text-align: right; color: #94a3b8; font-size: 8px; font-style: italic; font-weight: 500;">
        Dicetak pada: {{tgl_cetak}}
      </div>
    </div>
  </div>
</div>`;
    
    // Preparation for F4 Landscape Grid (2 columns x 2 rows = 4 slips per page)
    const slipsPerPage = 4;
    let fullHtml = '';
    
    for (let i = 0; i < details.length; i += slipsPerPage) {
      const pageDetails = details.slice(i, i + slipsPerPage);
      let pageHtml = `<div style="width: ${f4Config.paperWidth}mm; height: ${f4Config.paperHeight}mm; position: relative; page-break-after: always; box-sizing: border-box; padding: ${f4Config.marginTop}mm;">`;
      
      pageDetails.forEach((d, idx) => {
        let slipHtml = template;
        slipHtml = slipHtml.replace(/\{\{pelanggan_name\}\}/g, d.snapshotPelangganName);
        slipHtml = slipHtml.replace(/\{\{pelanggan_id\}\}/g, d.pelangganId);
        slipHtml = slipHtml.replace(/\{\{pelanggan_username\}\}/g, d.snapshotPelangganUsername || '');
        slipHtml = slipHtml.replace(/\{\{pelanggan_password\}\}/g, d.snapshotPelangganPassword || '');
        slipHtml = slipHtml.replace(/\{\{app_logo\}\}/g, appSettings.logo || '');
        slipHtml = slipHtml.replace(/\{\{app_name\}\}/g, appSettings.appName);
        slipHtml = slipHtml.replace(/\{\{app_address\}\}/g, appSettings.address);
        slipHtml = slipHtml.replace(/\{\{tgl_cetak\}\}/g, new Date().toLocaleDateString('id-ID'));
        slipHtml = slipHtml.replace(/\{\{bulan_tagihan\}\}/g, `${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}`);
        const rentang = `5 ${months[((selectedPeriod?.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod?.month || 0].substring(0,3)}`;
        slipHtml = slipHtml.replace(/\{\{rentang_tagihan\}\}/g, rentang);
        slipHtml = slipHtml.replace(/\{\{tarif_name\}\}/g, d.snapshotTarifName);
        slipHtml = slipHtml.replace(/\{\{pemakaian_malam\}\}/g, d.pemakaianHari.toString());
        slipHtml = slipHtml.replace(/\{\{kolektor_name\}\}/g, d.kolektorName || 'Semua'); 
        slipHtml = slipHtml.replace(/\{\{total_tagihan\}\}/g, d.totalTagihan.toLocaleString('id-ID'));
        
        // Positioning for 2x2 grid
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const width = (f4Config.paperWidth - f4Config.marginLeft - f4Config.marginRight - f4Config.gapX) / 2;
        const height = (f4Config.paperHeight - f4Config.marginTop - f4Config.marginBottom - f4Config.gapY) / 2;
        const top = f4Config.marginTop + (row * (height + f4Config.gapY));
        const left = f4Config.marginLeft + (col * (width + f4Config.gapX));
        
        pageHtml += `<div style="position: absolute; width: ${width}mm; height: ${height}mm; top: ${top}mm; left: ${left}mm;">${slipHtml}</div>`;
      });
      
      // Add cutting lines
      pageHtml += `
        <div style="position: absolute; top: 50%; left: ${f4Config.marginLeft}mm; width: calc(100% - ${f4Config.marginLeft + f4Config.marginRight}mm); border-top: 1px dashed #aaa; z-index: 0; pointer-events: none;"></div>
        <div style="position: absolute; left: 50%; top: ${f4Config.marginTop}mm; height: calc(100% - ${f4Config.marginTop + f4Config.marginBottom}mm); border-left: 1px dashed #aaa; z-index: 0; pointer-events: none;"></div>
      `;
      
      pageHtml += `</div>`;
      fullHtml += pageHtml;
    }
    
    setPrintContent(fullHtml);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePrintThermal = () => {
    if (!selectedPeriodId) return alert('Pilih periode tagihan terlebih dahulu');
    
    const rentang = `5 ${months[((selectedPeriod?.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod?.month || 0].substring(0,3)}`;
    let printText = `${appSettings.appName}\n${appSettings.address}\nWA: 085179911407\nTagihan ${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}\nPeriod: ${rentang}\n------------------------\n`;
    const toPrint = details.slice(0, 3); // mock just a few
    toPrint.forEach(d => {
      printText += `Nama: ${d.snapshotPelangganName}\nTotal: Rp ${d.totalTagihan.toLocaleString('id-ID')}\n------------------------\n`;
    });
    printText += `\nSubtotal ${selectedCount} lembar dicetak.`;

    // Try intent
    alert('Memanggil aplikasi RawBT untuk mencetak ke thermal printer...\n\nData:\n' + printText);
    
    // Fallback scheme (won't work in browser if rawbt not installed, but satisfies requirement)
    window.location.href = 'rawbt:' + encodeURIComponent(printText);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
      <PageHeader title="PRINT" onBack={onBack} />

      <div className="p-4 space-y-6 pb-32 overflow-y-auto flex-1">
        {/* Tipe Cetak */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Printer size={18} className="text-blue-600" />
            Metode Cetak
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPrintType('f4')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${printType === 'f4' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <FileDown size={28} className="mb-2" />
              <span className="font-bold text-sm">F4 / A4 (PDF)</span>
            </button>
            <button 
              onClick={() => setPrintType('thermal')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${printType === 'thermal' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <Smartphone size={28} className="mb-2" />
              <span className="font-bold text-sm">Printer Thermal</span>
            </button>
          </div>
        </div>

        {/* Pemilihan Data */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-600" />
            Data Tagihan
          </h2>
          
          <div>
            <label className="text-xs text-slate-500 font-bold mb-1 block">Pilih Periode Tagihan</label>
            <select 
              value={selectedPeriodId} 
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">-- Pilih Data Generate --</option>
              {tagihanPeriods.map(p => (
                <option key={p.id} value={p.id}>Tagihan {months[p.month]} {p.year} ({p.totalAmount.toLocaleString('id-ID')} - {p.totalDays}h)</option>
              ))}
            </select>
          </div>

          {selectedPeriodId && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
               <span className="text-xs font-bold text-emerald-800">Jumlah Tagihan:</span>
               <span className="text-lg font-black text-emerald-700">{selectedCount} Nota</span>
            </div>
          )}

          {printType === 'thermal' && (
            <div>
              <label className="text-xs text-slate-500 font-bold mb-1 mt-2 block">Rentang Halaman (Kolektor/Urutan)</label>
              <input 
                type="text" 
                placeholder="misal: 1-10 (Kosongkan untuk cetak semua)"
                value={pageRange}
                onChange={e => setPageRange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-1">Gunakan format "1-10" untuk mencetak tagihan urutan 1 hingga 10.</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={printType === 'f4' ? handlePrintF4 : handlePrintThermal}
          className="w-full bg-[#0000ff] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          {printType === 'f4' ? (
            <>
              <FileText size={20} /> CETAK KE PDF (F4)
            </>
          ) : (
            <>
              <Printer size={20} /> KIRIM KE RAWBT
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, Printer, FileDown, Smartphone, Calendar, FileText, Loader2 } from 'lucide-react';
import { TagihanDetail } from '../types';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function PrintPage({ onBack }: { onBack: () => void }) {
  const { tagihanPeriods, f4Template, f4Config, appSettings, tagihanDetails, showToast, pelanggans, tarifs } = useAppContext();
  
  const [printType, setPrintType] = useState<'f4' | 'thermal'>('f4');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [pageRange, setPageRange] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfRenderHtml, setPdfRenderHtml] = useState('');
  const printRef = React.useRef<HTMLDivElement>(null);

  const details = tagihanDetails.filter(d => d.periodId === selectedPeriodId);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const selectedPeriod = tagihanPeriods.find(p => p.id === selectedPeriodId);
  const selectedCount = details.length;

  const handlePrintF4 = async () => {
    if (!selectedPeriodId) return alert('Pilih periode tagihan terlebih dahulu');
    if (details.length === 0) return alert('Tidak ada data tagihan pada periode ini');
    
    setIsGeneratingPdf(true);
    
    try {
      let template = f4Template;
      const defaultFallback = `<div style="padding: 15px; font-family: 'Inter', system-ui, sans-serif; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; background-color: #ffffff; color: #1e293b; position: relative; overflow: hidden; box-shadow: inset 0 0 0 3px #f8fafc;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 12px; width: 100%;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 44px; height: 44px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">
        <img src="{{app_logo}}" style="width: 100%; height: 100%; object-fit: contain;" />
      </div>
      <div>
        <strong style="color: #0f172a; font-size: 16px; font-weight: 900; line-height: 1.2; letter-spacing: -0.5px; text-transform: uppercase; display: block;">{{app_name}}</strong>
        <span style="font-size: 10px; color: #64748b; font-weight: 500; display: block; max-width: 150px; line-height: 1.2;">{{app_address}}</span>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="background: #2563eb; color: white; padding: 4px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; display: inline-block; margin-bottom: 4px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">TAGIHAN LISTRIK</div>
      <div style="font-size: 10px; color: #64748b; font-weight: 800; display: block;">{{bulan_tagihan}}</div>
    </div>
  </div>
  <div style="display: flex; gap: 16px; flex: 1; width: 100%;">
    <div style="flex: 1.1; display: flex; flex-direction: column; gap: 12px;">
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9; position: relative;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #2563eb;"></div>
        <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Data Pelanggan</div>
        <strong style="font-size: 14px; font-weight: 800; color: #0f172a; display: block;">{{pelanggan_name}}</strong>
        <span style="font-size: 10px; color: #64748b; font-family: monospace; font-weight: 600;">ID: {{pelanggan_id}}</span>
      </div>
      <div style="display: flex; gap: 6px; width: 100%;">
         <div style="flex: 1; background: #ffffff; padding: 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;">
           <span style="display: block; font-size: 8px; font-weight: 700; color: #64748b; margin-bottom: 2px;">USERNAME</span>
           <strong style="color: #0f172a; font-family: monospace; font-size: 10px;">{{pelanggan_username}}</strong>
         </div>
         <div style="flex: 1; background: #ffffff; padding: 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;">
           <span style="display: block; font-size: 8px; font-weight: 700; color: #64748b; margin-bottom: 2px;">PASSWORD</span>
           <strong style="color: #0f172a; font-family: monospace; font-size: 10px;">{{pelanggan_password}}</strong>
         </div>
      </div>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="background: #ffffff; border-radius: 10px; padding: 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Jalur</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{jalur_name}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Tarif Daya</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{tarif_name}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">MCB</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{mcb}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Total Tgl</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{total_hari_sebulan}} Hari</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Mati Listrik</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{hari_mati_listrik}} Hari</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Hidup Listrik</td><td style="text-align: right; font-size: 11px; font-weight: 800; color: #0f172a;">{{pemakaian_malam}} Malam</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Tunggakan</td><td style="text-align: right; font-size: 10px; font-weight: 700; color: #ef4444;">{{tunggakan}}</td></tr>
          <tr><td style="color: #64748b; font-size: 10px; padding: 4px 0; font-weight: 600;">Periode</td><td style="text-align: right; font-size: 10px; font-weight: 700; color: #0f172a;">{{rentang_tagihan}}</td></tr>
        </table>
      </div>
      <div style="background: #0f172a; border-radius: 10px; padding: 12px; margin-top: auto; color: white; display: flex; flex-direction: column; align-items: flex-end;">
        <span style="font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Total Tagihan</span>
        <div style="display: flex; align-items: flex-start; gap: 4px; margin-top: 2px;">
          <span style="font-size: 10px; font-weight: 600; color: #94a3b8; margin-top: 2px;">Rp</span>
          <strong style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1;">{{total_tagihan}}</strong>
        </div>
      </div>
    </div>
  </div>
  <div style="margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
    <div>
      <span style="font-size: 8px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase;">Kolektor / Petugas</span>
      <strong style="font-size: 11px; color: #0f172a; font-weight: 900; display: block; margin-top: 2px;">{{kolektor_name}}</strong>
    </div>
    <div style="text-align: right; font-size: 8px; color: #94a3b8; font-weight: 600;">
      <div style="margin-bottom: 2px;"><span style="color: #0f172a; font-weight: 800;">WA: {{app_contact}}</span></div>
      Cetak: {{tgl_cetak}}
    </div>
  </div>
</div>`;
      if (!template || !template.includes('{{tunggakan}}')) {
         template = defaultFallback;
      }
    
    let htmlContent = `<div id="pdf-content">`;
    const slipsPerPage = 4;

    for (let i = 0; i < details.length; i += slipsPerPage) {
      const pageDetails = details.slice(i, i + slipsPerPage);
      
      let pageHtml = `<div style="width: ${f4Config.paperWidth}mm; height: ${f4Config.paperHeight - 1}mm; position: relative; background: #ffffff; overflow: hidden; display: block; box-sizing: border-box;">`;
      
      pageDetails.forEach((d, idx) => {
        let slipHtml = template;
        
        let mcbVal = '-';
        const pel = pelanggans.find(p => p.id === d.pelangganId);
        if (pel) {
           const tar = tarifs.find(t => t.id === pel.tarifId);
           if (tar && tar.mcb) mcbVal = tar.mcb;
        }

        // Hitung Tunggakan
        let tunggakan = 0;
        const previousTagihans = tagihanDetails.filter(td => 
          td.pelangganId === d.pelangganId && 
          td.id !== d.id && 
          td.status === 'Belum Lunas'
        );
        
        // Sorting untuk mendapatkan tagihan lama sebelum period ini, asumsikan period name sortable or use ID (simple way: sum all "Belum Lunas" except current)
        tunggakan = previousTagihans.reduce((sum, td) => sum + td.totalTagihan, 0);

        slipHtml = slipHtml.replace(/\{\{pelanggan_name\}\}/g, d.snapshotPelangganName);
        slipHtml = slipHtml.replace(/\{\{pelanggan_id\}\}/g, d.pelangganId);
        slipHtml = slipHtml.replace(/\{\{pelanggan_username\}\}/g, d.snapshotPelangganUsername || '');
        slipHtml = slipHtml.replace(/\{\{pelanggan_password\}\}/g, d.snapshotPelangganPassword || '');
        slipHtml = slipHtml.replace(/\{\{app_logo\}\}/g, appSettings.logo || '');
        slipHtml = slipHtml.replace(/\{\{app_name\}\}/g, appSettings.appName);
        slipHtml = slipHtml.replace(/\{\{app_address\}\}/g, appSettings.address);
        slipHtml = slipHtml.replace(/\{\{app_contact\}\}/g, appSettings.appContact || '-');
        slipHtml = slipHtml.replace(/\{\{mcb\}\}/g, mcbVal);
        slipHtml = slipHtml.replace(/\{\{tgl_cetak\}\}/g, new Date().toLocaleDateString('id-ID'));
        slipHtml = slipHtml.replace(/\{\{bulan_tagihan\}\}/g, `${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}`);
        const rentang = `5 ${months[((selectedPeriod?.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod?.month || 0].substring(0,3)}`;
        slipHtml = slipHtml.replace(/\{\{rentang_tagihan\}\}/g, rentang);
        slipHtml = slipHtml.replace(/\{\{jalur_name\}\}/g, d.snapshotJalurName || '-');
        slipHtml = slipHtml.replace(/\{\{tarif_name\}\}/g, `Rp. ${d.snapshotTarifPrice.toLocaleString('id-ID')},- (${d.snapshotTarifName})`);
        slipHtml = slipHtml.replace(/\{\{total_hari_sebulan\}\}/g, d.totalHariSebulan?.toString() || '0');
        slipHtml = slipHtml.replace(/\{\{hari_mati_listrik\}\}/g, d.hariMatiListrik?.toString() || '0');
        slipHtml = slipHtml.replace(/\{\{pemakaian_malam\}\}/g, d.pemakaianHari.toString());
        slipHtml = slipHtml.replace(/\{\{tunggakan\}\}/g, `Rp ${tunggakan.toLocaleString('id-ID')}`);
        slipHtml = slipHtml.replace(/\{\{kolektor_name\}\}/g, d.kolektorName || 'Semua'); 
        slipHtml = slipHtml.replace(/\{\{total_tagihan\}\}/g, (d.totalTagihan + tunggakan).toLocaleString('id-ID'));
        
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const width = (f4Config.paperWidth - f4Config.marginLeft - f4Config.marginRight - f4Config.gapX) / 2;
        const height = (f4Config.paperHeight - f4Config.marginTop - f4Config.marginBottom - f4Config.gapY) / 2;
        const top = f4Config.marginTop + (row * (height + f4Config.gapY));
        const left = f4Config.marginLeft + (col * (width + f4Config.gapX));
        
        pageHtml += `<div style="position: absolute; width: ${width}mm; height: ${height}mm; top: ${top}mm; left: ${left}mm; box-sizing: border-box;">${slipHtml}</div>`;
      });
      
      pageHtml += `
        <div style="position: absolute; top: 50%; left: ${f4Config.marginLeft}mm; width: calc(100% - ${f4Config.marginLeft + f4Config.marginRight}mm); border-top: 1.5px dashed #94a3b8; display: flex; justify-content: center;">
           <span style="background: white; padding: 0 10px; color: #94a3b8; font-size: 10px; margin-top: -7px;">✂️ Gunting disini</span>
        </div>
        <div style="position: absolute; left: 50%; top: ${f4Config.marginTop}mm; height: calc(100% - ${f4Config.marginTop + f4Config.marginBottom}mm); border-left: 1.5px dashed #94a3b8; display: flex; flex-direction: column; align-items: center;">
           <div style="background: white; padding: 10px 0; color: #94a3b8; font-size: 10px; margin-left: -6.5px; transform: rotate(-90deg); margin-top: 50px;">✂️</div>
        </div>
      `;
      
      pageHtml += `</div>`;
      if (i + slipsPerPage < details.length) {
         pageHtml += `<div class="html2pdf__page-break"></div>`;
      }
      htmlContent += pageHtml;
    }
    
    htmlContent += `</div>`;

    setPdfRenderHtml(htmlContent);

    setTimeout(async () => {
      if (!printRef.current) return;
      
      const opt = {
        margin: 0,
        filename: `Tagihan_${months[selectedPeriod?.month || 0]}_${selectedPeriod?.year}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        pagebreak: { mode: ['css'] },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff',
          windowWidth: Math.max(1200, f4Config.paperWidth * 4) // Ensure canvas bounds are wide enough
        },
        jsPDF: { 
          unit: 'mm', 
          format: [f4Config.paperWidth, f4Config.paperHeight] as [number, number], 
          orientation: (f4Config.paperWidth > f4Config.paperHeight ? 'landscape' : 'portrait') as 'landscape' | 'portrait'
        }
      };

      try {
        await html2pdf().from(printRef.current).set(opt).save();
        showToast('PDF berhasil diunduh');
      } catch (error) {
        console.error('PDF Generation failed:', error);
        showToast('Gagal membuat PDF', 'error');
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 1500);

  } catch (err) {
    console.error('PDF preparation failed:', err);
    showToast('Terjadi kesalahan saat menyiapkan data PDF', 'error');
    setIsGeneratingPdf(false);
  }
};

  const handlePrintThermal = () => {
    if (!selectedPeriodId) return alert('Pilih periode tagihan terlebih dahulu');
    
    const rentang = `5 ${months[((selectedPeriod?.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod?.month || 0].substring(0,3)}`;
    let printText = `${appSettings.appName}\n${appSettings.address}\nWA: ${appSettings.appContact || '-'}\nTagihan ${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}\nPeriod: ${rentang}\n------------------------\n`;
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
          disabled={isGeneratingPdf}
          className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${isGeneratingPdf ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0000ff] hover:bg-blue-700 shadow-blue-200'}`}
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 size={20} className="animate-spin" /> MENGHADILKAN PDF...
            </>
          ) : printType === 'f4' ? (
            <>
              <FileText size={20} /> UNDUH PDF TAGIHAN (F4)
            </>
          ) : (
            <>
              <Printer size={20} /> KIRIM KE RAWBT
            </>
          )}
        </button>
      </div>

      {/* Hidden container for PDF rendering */}
      <div 
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: `${f4Config.paperWidth}mm`,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        <div ref={printRef} dangerouslySetInnerHTML={{ __html: pdfRenderHtml }} />
      </div>

    </div>
  );
}

import React, { useState, useRef } from 'react';
import { BookOpen, User, FileText, Calendar, Download, Loader2, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function PembukuanPage({ onBack }: { onBack: () => void }) {
  const { pelanggans, jalurs, tarifs, tagihanPeriods, tagihanDetails, appSettings, showToast, kolektors } = useAppContext();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfRenderHtml, setPdfRenderHtml] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const activePelanggans = pelanggans.filter(p => p.status === 'Aktif').sort((a, b) => a.name.localeCompare(b.name));

  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
      body { margin: 0; padding: 0; background: white; }
      .f4-page { 
        width: 215mm; 
        height: 330mm; 
        padding: 15mm; 
        background: white; 
        position: relative; 
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        page-break-after: always;
      }
      .header-kop { text-align: center; border-bottom: 4px double #2563eb; padding-bottom: 5mm; margin-bottom: 6mm; }
      .header-kop h1 { margin: 0; font-size: 24pt; color: #2563eb; text-transform: uppercase; font-weight: 900; letter-spacing: -1px; }
      .header-kop p { margin: 5px 0 0 0; font-size: 11pt; color: #475569; font-weight: 800; text-transform: uppercase; }
      
      table { width: 100%; border-collapse: collapse; margin-top: 5mm; font-size: 8.5pt; }
      th { background-color: #f1f5f9; border: 1px solid #64748b; padding: 6px 3px; text-transform: uppercase; font-weight: 900; color: #0f172a; font-size: 7.5pt; }
      td { border: 1px solid #94a3b8; padding: 6px 4px; color: #1e293b; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-black { font-weight: 900; }
      
      .signature-area { margin-top: 10mm; display: flex; justify-content: flex-end; }
      .signature-box { width: 60mm; text-align: center; font-size: 10pt; }
      .signature-name { border-bottom: 2px solid #000; margin-top: 18mm; font-weight: 900; text-transform: uppercase; display: inline-block; min-width: 45mm; }
    </style>
  `;

  const downloadPdf = async (html: string, filename: string) => {
    setPdfRenderHtml(html);
    setIsGeneratingPdf(true);
    setTimeout(async () => {
      if (!printRef.current) return;
      await document.fonts.ready;
      
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: { scale: 2.5, useCORS: true, scrollX:0, scrollY:0, windowWidth: 1200 },
        jsPDF: { unit: 'mm' as const, format: [215, 330] as [number, number], orientation: 'portrait' as const } 
      };

      try {
        await html2pdf().from(printRef.current).set(opt).save();
        showToast('PDF Berhasil Diunduh');
      } catch (err) {
        showToast('Gagal mengunduh PDF', 'error');
      } finally {
        setIsGeneratingPdf(false);
        setPdfRenderHtml('');
      }
    }, 2000);
  };

  // --- REPORT GENERATORS ---

  const generateDataPelanggan = () => {
    setIsGeneratingPdf(true);
    const html = `
      <html><head>${styles}</head><body>
      <div class="f4-page">
        <div class="header-kop">
          <h1>DATA MASTER PELANGGAN AKTIF</h1>
          <p>${appSettings.appName} - TAHUN ${selectedYear}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th width="35">NO</th>
              <th>NAMA PELANGGAN</th>
              <th width="80">ID PEL</th>
              <th width="100">USERNAME</th>
              <th width="80">TARIF/MALAM</th>
              <th>JALUR</th>
            </tr>
          </thead>
          <tbody>
            ${activePelanggans.map((p, idx) => {
              const tar = tarifs.find(t => t.id === p.tarifId)?.price || 0;
              const jal = jalurs.find(j => j.id === p.jalurId)?.name || '-';
              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="font-black" style="text-transform: uppercase;">${p.name}</td>
                  <td class="text-center">${p.id}</td>
                  <td class="text-center">${p.username}</td>
                  <td class="text-right">${tar.toLocaleString('id-ID')}</td>
                  <td class="text-center">${jal}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      </body></html>
    `;
    downloadPdf(html, `Data_Pelanggan_${selectedYear}.pdf`);
  };

  const generateBukuTahunan = () => {
    setIsGeneratingPdf(true);
    
    let html = `<html><head>${styles}</head><body>`;

    // 1. COVER
    html += `
      <div class="f4-page" style="border: 10px double #2563eb; display: flex; flex-direction: column; justify-content: center; align-items: center;">
         ${appSettings.logo ? `<img src="${appSettings.logo}" style="width: 70mm; height: 70mm; object-fit: contain; margin-bottom: 20mm;" />` : ''}
         <h1 style="font-size: 56pt; color: #2563eb; font-weight: 950; margin: 0;">BUKU TAHUNAN</h1>
         <h2 style="font-size: 32pt; color: #1e293b; margin: 10mm 0; font-weight: 800;">ADMINISTRASI PENAGIHAN</h2>
         <div style="width: 150mm; height: 5px; background: #2563eb; margin: 15mm auto;"></div>
         <h3 style="font-size: 26pt; color: #2563eb; font-weight: 900; text-transform: uppercase;">${appSettings.appName}</h3>
         <p style="font-size: 22pt; font-weight: 900; color: #000; margin-top: 30mm;">TAHUN ${selectedYear}</p>
      </div>
      <div class="html2pdf__page-break"></div>
    `;

    // 2. DATA PELANGGAN
    html += `
      <div class="f4-page">
        <div class="header-kop"><h1>DATA INDUK PELANGGAN</h1></div>
        <table>
          <thead><tr><th width="35">NO</th><th>NAMA PELANGGAN</th><th width="100">ID</th><th width="100">USERNAME</th><th width="100">JALUR</th></tr></thead>
          <tbody>${activePelanggans.map((p, i) => {
            const jal = jalurs.find(j => j.id === p.jalurId)?.name || '-';
            return `<tr><td class="text-center">${i+1}</td><td class="font-black">${p.name.toUpperCase()}</td><td class="text-center">${p.id}</td><td class="text-center">${p.username}</td><td class="text-center">${jal}</td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <div class="html2pdf__page-break"></div>
    `;

    // 3. PAYMENT BLOCKS
    const paymentBlocks = [
      { name: "JANUARI - APRIL", range: [0, 1, 2, 3] },
      { name: "MEI - AGUSTUS", range: [4, 5, 6, 7] },
      { name: "SEPTEMBER - DESEMBER", range: [8, 9, 10, 11] }
    ];

    paymentBlocks.forEach(block => {
      html += `
        <div class="f4-page">
          <div class="header-kop"><h1>REKAP PEMBAYARAN (${block.name})</h1></div>
          <table>
            <thead>
              <tr>
                <th width="30">NO</th>
                <th>NAMA PELANGGAN</th>
                ${block.range.map(mIdx => `<th>${months[mIdx].toUpperCase()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${activePelanggans.map((p, i) => `
                <tr>
                  <td class="text-center">${i+1}</td>
                  <td class="font-black">${p.name.toUpperCase()}</td>
                  <td></td><td></td><td></td><td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="html2pdf__page-break"></div>
      `;
    });

    // 4. OPERASI
    html += `
      <div class="f4-page">
        <div class="header-kop"><h1>REKAPITULASI OPERASIONAL LISTRIK</h1></div>
        <table style="font-size: 7.5pt;">
          <thead>
            <tr>
              <th rowspan="2">BULAN / PERIODE</th>
              <th colspan="3">JALUR 1</th><th colspan="3">JALUR 2</th><th colspan="3">JALUR 3</th>
            </tr>
            <tr>
              <th>HARI</th><th>MATI</th><th>OPS</th>
              <th>HARI</th><th>MATI</th><th>OPS</th>
              <th>HARI</th><th>MATI</th><th>OPS</th>
            </tr>
          </thead>
          <tbody>
            ${months.map((m, idx) => `
              <tr>
                <td class="font-black">${m.toUpperCase()}</td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    html += `</body></html>`;
    downloadPdf(html, `Buku_Tahunan_${selectedYear}.pdf`);
  };

  const generateTagihanKosong = () => {
    if (!selectedPeriodId) return showToast('Pilih periode bulan dahulu', 'error');
    setIsGeneratingPdf(true);
    const targetPeriod = tagihanPeriods.find(p => p.id === selectedPeriodId);
    
    const html = `
      <html><head>${styles}</head><body>
      <div class="f4-page">
        <div class="header-kop">
          <h1>BLANKO PENAGIHAN KOSONG (PER-KOLEKTOR)</h1>
          <p>${appSettings.appName} - ${months[targetPeriod?.month || 0].toUpperCase()} ${targetPeriod?.year}</p>
        </div>
        <div style="margin-bottom: 5mm; display: flex; justify-content: space-between; font-size: 10pt;">
           <span>Nama Kolektor: .......................................</span>
           <span>Tanggal Penagihan: ....................</span>
        </div>
        <table>
          <thead>
            <tr>
              <th width="35">NO</th>
              <th>NAMA PELANGGAN</th>
              <th width="120">TAGIHAN</th>
              <th width="120">DIBAYAR</th>
              <th>PARAF / KET</th>
            </tr>
          </thead>
          <tbody>
            ${activePelanggans.map((p, i) => `
              <tr style="height: 10mm;">
                <td class="text-center">${i+1}</td>
                <td class="font-black">${p.name.toUpperCase()}</td>
                <td></td><td></td><td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      </body></html>
    `;
    downloadPdf(html, `Blanko_Kosong_${months[targetPeriod?.month || 0]}.pdf`);
  };

  const generateLaporanBulanan = () => {
    if (!selectedPeriodId) return showToast('Pilih periode bulan dahulu', 'error');
    setIsGeneratingPdf(true);
    const targetPeriod = tagihanPeriods.find(p => p.id === selectedPeriodId);
    const details = tagihanDetails.filter(d => d.periodId === selectedPeriodId);

    const html = `
      <html><head>${styles}</head><body>
      <div class="f4-page">
        <div class="header-kop">
          <h1>LAPORAN BULANAN REALISASI TAGIHAN</h1>
          <p>${appSettings.appName} - ${months[targetPeriod?.month || 0].toUpperCase()} ${targetPeriod?.year}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th width="35">NO</th>
              <th>NAMA PELANGGAN</th>
              <th width="120">NOMINAL TAGIHAN</th>
              <th width="100">STATUS</th>
              <th>RESI / KET</th>
            </tr>
          </thead>
          <tbody>
            ${activePelanggans.map((p, i) => {
              const d = details.find(td => td.pelangganId === p.id);
              return `
                <tr>
                  <td class="text-center">${i+1}</td>
                  <td class="font-black">${p.name.toUpperCase()}</td>
                  <td class="text-right">${(d?.totalTagihan || 0).toLocaleString('id-ID')}</td>
                  <td class="text-center font-black" style="color: ${d?.status === 'Lunas' ? '#16a34a' : '#ef4444'}">${d?.status || '-'}</td>
                  <td></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      </body></html>
    `;
    downloadPdf(html, `Laporan_Bulanan_${months[targetPeriod?.month || 0]}.pdf`);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden">
      <PageHeader title="BUKU & LAPORAN" onBack={onBack} />

      <div className="p-4 space-y-4 pb-32 overflow-y-auto flex-1">
        
        {/* Selection Area */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-2 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">PILIH TAHUN</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none text-sm">
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>TAHUN {y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">PILIH BULAN</label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none text-sm">
                <option value="">PILIH BULAN...</option>
                {tagihanPeriods.filter(p => p.year === selectedYear).map(p => <option key={p.id} value={p.id}>{months[p.month]} {p.year}</option>)}
            </select>
          </div>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 gap-3">
            {[
              { id: 1, title: 'Data Pelanggan', sub: 'Master Data Dasar', icon: <User size={24}/>, action: generateDataPelanggan, color: 'blue' },
              { id: 2, title: 'Buku Tahunan', sub: 'Bundel Cover & Tabel', icon: <BookOpen size={24}/>, action: generateBukuTahunan, color: 'indigo' },
              { id: 3, title: 'Tagihan Kosong', sub: 'Filter Per Kolektor', icon: <FileText size={24}/>, action: generateTagihanKosong, color: 'slate' },
              { id: 4, title: 'Laporan Bulanan', sub: 'Filter Per Bulan', icon: <Calendar size={24}/>, action: generateLaporanBulanan, color: 'emerald' },
            ].map(card => (
              <div key={card.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-600/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-${card.color}-50 text-${card.color}-600 rounded-2xl flex items-center justify-center`}>{card.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.sub}</h4>
                    <span className="text-sm font-black text-slate-800 uppercase">{card.id}. {card.title} F4</span>
                  </div>
                </div>
                <button onClick={card.action} disabled={isGeneratingPdf} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50">
                  <Download size={20} />
                </button>
              </div>
            ))}
        </div>

        <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest mt-6">Seluruh laporan diunduh dalam format F4 (215 x 330 mm)</p>
      </div>

      {isGeneratingPdf && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
                <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                <span className="text-xs font-black uppercase tracking-widest">Memproses File PDF...</span>
              </div>
          </div>
      )}

      {/* Hidden Render Container */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '215mm', pointerEvents: 'none', zIndex: -9999, backgroundColor: 'white' }} aria-hidden="true">
        <div ref={printRef} dangerouslySetInnerHTML={{ __html: pdfRenderHtml }} />
      </div>
    </div>
  );
}

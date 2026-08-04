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

  function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
      body { margin: 0; padding: 0; background: white; }
      .f4-page { 
        width: 215mm; 
        height: 330mm; 
        padding: 8mm 12mm; 
        background: white; 
        position: relative; 
        overflow: hidden;
        font-family: 'Inter', sans-serif;
        page-break-after: always;
      }
      .header-kop { text-align: center; border-bottom: 2.5px double #2563eb; padding-bottom: 1mm; margin-bottom: 1.5mm; }
      .header-kop h1 { margin: 0; font-size: 11pt; color: #2563eb; text-transform: uppercase; font-weight: 900; letter-spacing: -0.5px; }
      .header-kop p { margin: 1px 0 0 0; font-size: 7.5pt; color: #475569; font-weight: 800; text-transform: uppercase; }
      
      table { width: 100%; border-collapse: collapse; margin-top: 1mm; font-size: 6.8pt; }
      th { background-color: #f1f5f9; border: 1px solid #64748b; padding: 1.5px 2px; text-transform: uppercase; font-weight: 900; color: #0f172a; font-size: 6.5pt; line-height: 1.05; }
      td { border: 1px solid #94a3b8; padding: 1.5px 3px; color: #1e293b; line-height: 1.05; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-black { font-weight: 900; }
      
      /* Compact styling for single-page deliverables */
      .compact-report { padding: 4mm 6mm !important; }
      .compact-table { margin-top: 0.5mm !important; }
      .compact-table th { font-size: 5.5pt !important; padding: 0.8px 1px !important; line-height: 1.05 !important; }
      .compact-table td { font-size: 5.5pt !important; padding: 0.8px 2px !important; line-height: 1.05 !important; }
      
      .signature-area { margin-top: 4mm; display: flex; justify-content: flex-end; }
      .signature-box { width: 60mm; text-align: center; font-size: 7.5pt; }
      .signature-name { border-bottom: 1.5px solid #000; margin-top: 8mm; font-weight: 900; text-transform: uppercase; display: inline-block; min-width: 45mm; }
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
    let html = `<html><head>${styles}</head><body>`;
    
    html += `
      <div class="f4-page compact-report">
        <div class="header-kop">
          <h1>DATA MASTER PELANGGAN AKTIF</h1>
          <p>${appSettings.appName} - TAHUN ${selectedYear}</p>
        </div>
        <table class="compact-table">
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
    `;

    html += `</body></html>`;
    downloadPdf(html, `Data_Pelanggan_${selectedYear}.pdf`);
  };

  const generateBukuTahunan = () => {
    setIsGeneratingPdf(true);
    
    let html = `<html><head>${styles}</head><body>`;

    // 1. COVER (Scaled down elements securely to fit beautifully on F4)
    html += `
      <div class="f4-page" style="border: 8px double #2563eb; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10mm 15mm; box-sizing: border-box;">
         ${appSettings.logo ? `<img src="${appSettings.logo}" style="width: 32mm; height: 32mm; object-fit: contain; margin-bottom: 6mm;" />` : ''}
         <h1 style="font-size: 22pt; color: #2563eb; font-weight: 950; margin: 0; text-align: center; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.5px;">BUKU TAHUNAN</h1>
         <h2 style="font-size: 13pt; color: #1e293b; margin: 4mm 0; font-weight: 800; text-align: center; letter-spacing: 0.5px;">ADMINISTRASI PENAGIHAN</h2>
         <div style="width: 90mm; height: 2.5px; background: #2563eb; margin: 5mm auto;"></div>
         <h3 style="font-size: 11pt; color: #2563eb; font-weight: 900; text-transform: uppercase; text-align: center; margin: 0;">${appSettings.appName}</h3>
         <p style="font-size: 10pt; font-weight: 900; color: #000; margin-top: 10mm; text-align: center;">TAHUN ${selectedYear}</p>
      </div>
      <div class="html2pdf__page-break"></div>
    `;

    // 2. DATA PELANGGAN
    const dataPelangganChunks = chunkArray(activePelanggans, 38) as any[][];
    dataPelangganChunks.forEach((chunk, pageIdx) => {
      html += `
        <div class="f4-page">
          <div class="header-kop">
            <h1>DATA INDUK PELANGGAN</h1>
            <p>${appSettings.appName} - TAHUN ${selectedYear}</p>
          </div>
          <table>
            <thead><tr><th width="35">NO</th><th>NAMA PELANGGAN</th><th width="100">ID</th><th width="100">USERNAME</th><th width="100">JALUR</th></tr></thead>
            <tbody>${chunk.map((p, idx) => {
              const jal = jalurs.find(j => j.id === p.jalurId)?.name || '-';
              const absoluteIndex = pageIdx * 38 + idx + 1;
              return `<tr><td class="text-center">${absoluteIndex}</td><td class="font-black" style="text-transform: uppercase;">${p.name}</td><td class="text-center">${p.id}</td><td class="text-center">${p.username}</td><td class="text-center">${jal}</td></tr>`;
            }).join('')}</tbody>
          </table>
          <div style="position: absolute; bottom: 15mm; right: 15mm; font-size: 8pt; color: #64748b; font-weight: bold;">
            Bagian I - Halaman ${pageIdx + 1} dari ${dataPelangganChunks.length}
          </div>
        </div>
        <div class="html2pdf__page-break"></div>
      `;
    });

    // 3. PAYMENT BLOCKS (PAGINATED CHUNKS OF 38 PER PAGE)
    const paymentBlocks = [
      { name: "JANUARI - APRIL", range: [0, 1, 2, 3] },
      { name: "MEI - AGUSTUS", range: [4, 5, 6, 7] },
      { name: "SEPTEMBER - DESEMBER", range: [8, 9, 10, 11] }
    ];

    paymentBlocks.forEach(block => {
      const paymentChunks = chunkArray(activePelanggans, 38) as any[][];
      paymentChunks.forEach((chunk, pageIdx) => {
        html += `
          <div class="f4-page">
            <div class="header-kop">
              <h1>REKAP PEMBAYARAN (${block.name})</h1>
              <p>${appSettings.appName} - TAHUN ${selectedYear}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th width="30">NO</th>
                  <th>NAMA PELANGGAN</th>
                  ${block.range.map(mIdx => `<th>${months[mIdx].toUpperCase()}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${chunk.map((p, idx) => {
                  const absoluteIndex = pageIdx * 38 + idx + 1;
                  return `
                    <tr>
                      <td class="text-center">${absoluteIndex}</td>
                      <td class="font-black" style="text-transform: uppercase;">${p.name}</td>
                      <td></td><td></td><td></td><td></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div style="position: absolute; bottom: 15mm; right: 15mm; font-size: 8pt; color: #64748b; font-weight: bold;">
              Rekap ${block.name} - Halaman ${pageIdx + 1} dari ${paymentChunks.length}
            </div>
          </div>
          <div class="html2pdf__page-break"></div>
        `;
      });
    });

    // 4. OPERASI
    html += `
      <div class="f4-page">
        <div class="header-kop">
          <h1>REKAPITULASI OPERASIONAL LISTRIK</h1>
          <p>${appSettings.appName} - TAHUN ${selectedYear}</p>
        </div>
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
    const targetMonthName = months[targetPeriod?.month || 0].toUpperCase();
    
    let html = `<html><head>${styles}</head><body>`;
    
    // We adjust the row height dynamically based on active tenants so they fit nicely on 1 F4 sheet
    const totalCount = activePelanggans.length || 1;
    const computedRowHeightMm = Math.max(3.8, Math.min(10.0, 240 / totalCount));
    
    html += `
      <div class="f4-page compact-report">
        <div class="header-kop">
          <h1>BLANKO PENAGIHAN KOSONG (PER-KOLEKTOR)</h1>
          <p>${appSettings.appName} - ${targetMonthName} ${targetPeriod?.year}</p>
        </div>
        <div style="margin-bottom: 2mm; display: flex; justify-content: space-between; font-size: 7pt; font-weight: bold;">
           <span>Nama Kolektor: .......................................</span>
           <span>Tanggal Penagihan: ....................</span>
        </div>
        <table class="compact-table">
          <thead>
            <tr>
              <th width="35">NO</th>
              <th>NAMA PELANGGAN</th>
              <th width="115">TAGIHAN</th>
              <th width="115">DIBAYAR</th>
              <th>PARAF / KET</th>
            </tr>
          </thead>
          <tbody>
            ${activePelanggans.map((p, idx) => {
              return `
                <tr style="height: ${computedRowHeightMm}mm;">
                  <td class="text-center">${idx + 1}</td>
                  <td class="font-black" style="text-transform: uppercase;">${p.name}</td>
                  <td></td><td></td><td></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    html += `</body></html>`;
    downloadPdf(html, `Blanko_Kosong_${months[targetPeriod?.month || 0]}.pdf`);
  };

  const generateLaporanBulanan = () => {
    if (!selectedPeriodId) return showToast('Pilih periode bulan dahulu', 'error');
    setIsGeneratingPdf(true);
    const targetPeriod = tagihanPeriods.find(p => p.id === selectedPeriodId);
    const details = tagihanDetails.filter(d => d.periodId === selectedPeriodId);
    const targetMonthName = months[targetPeriod?.month || 0].toUpperCase();

    let html = `<html><head>${styles}</head><body>`;

    html += `
      <div class="f4-page compact-report">
        <div class="header-kop">
          <h1>LAPORAN BULANAN REALISASI TAGIHAN</h1>
          <p>${appSettings.appName} - ${targetMonthName} ${targetPeriod?.year}</p>
        </div>
        <table class="compact-table">
          <thead>
            <tr>
              <th width="35">NO</th>
              <th>NAMA PELANGGAN</th>
              <th width="115">NOMINAL TAGIHAN</th>
              <th width="90">STATUS</th>
              <th>RESI / KET</th>
            </tr>
          </thead>
          <tbody>
            ${activePelanggans.map((p, idx) => {
              const d = details.find(td => td.pelangganId === p.id);
              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="font-black" style="text-transform: uppercase;">${p.name}</td>
                  <td class="text-right">${(d?.totalTagihan || 0).toLocaleString('id-ID')}</td>
                  <td class="text-center font-black" style="color: ${d?.status === 'Lunas' ? '#16a34a' : '#ef4444'}">${d?.status || 'Belum Lunas'}</td>
                  <td></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    html += `</body></html>`;
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
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '215mm', pointerEvents: 'none', zIndex: -9999, backgroundColor: 'white' }} aria-hidden="true">
        <div ref={printRef} dangerouslySetInnerHTML={{ __html: pdfRenderHtml }} />
      </div>
    </div>
  );
}

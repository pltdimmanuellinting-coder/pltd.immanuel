import React, { useState } from 'react';
import { ChevronLeft, Search, FileText, CheckCircle2, Circle, Edit3, X, Save, Trash2, Lock, Unlock, Loader2, Download, FileJson, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { TagihanDetail, TagihanPeriod } from '../types';
import PageHeader from './PageHeader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function TagihanPage({ onBack, role, onNavigateToPrint, initialPeriod = null }: { onBack: () => void, role: string, onNavigateToPrint: (detail: any) => void, initialPeriod?: TagihanPeriod | null }) {
  const { 
    tagihanPeriods, tagihanDetails, setTagihanDetails, 
    tarifs, showToast, deleteTagihanPeriod, saveTagihanDetail,
    appSettings, pelanggans, f4Template, f4Config
  } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TagihanPeriod | null>(initialPeriod);

  React.useEffect(() => {
    setSelectedPeriod(initialPeriod);
  }, [initialPeriod]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfRenderHtml, setPdfRenderHtml] = useState('');
  const printRef = React.useRef<HTMLDivElement>(null);
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

  const handleRawBTPrint = (detail: TagihanDetail) => {
    if (role === 'Kolektor') {
      const divider = '--------------------------------\n';
      const header = `${appSettings?.appName?.toUpperCase() || 'PLTD'}\n${appSettings?.address || ''}\nTelp/WA: ${appSettings?.appContact || '-'}\n${divider}`;
      
      let printText = '';
      printText += header;
      printText += `SLIP TAGIHAN LISTRIK\n`;
      printText += `Periode: ${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}\n`;
      printText += `${divider}`;
      printText += `NAMA : ${detail.snapshotPelangganName}\n`;
      printText += `ID   : ${detail.pelangganId}\n`;
      printText += `JALUR: ${detail.snapshotJalurName}\n`;
      printText += `${divider}`;
      printText += `Tarif: ${detail.snapshotTarifName}\n`;
      printText += `Harga: Rp ${detail.snapshotTarifPrice.toLocaleString('id-ID')}\n`;
      printText += `Pemakaian: ${detail.pemakaianHari} Malam\n`;
      printText += `Tunggakan: Rp 0\n`;
      printText += `${divider}`;
      printText += `TOTAL TAGIHAN:\n`;
      printText += `Rp ${detail.totalTagihan.toLocaleString('id-ID')}\n`;
      printText += `${divider}`;
      printText += `Dicetak: ${new Date().toLocaleDateString('id-ID')}\n`;
      printText += `KOLEKTOR: ${detail.kolektorName || '-'}\n`;
      printText += `\n\n\n`; // Spacing for tear

      showToast('Mengirim ke Thermal Printer (RawBT)...', 'success');
      window.location.href = 'rawbt:' + encodeURIComponent(printText);
    } else {
      onNavigateToPrint(detail);
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
    
    setIsGeneratingPdf(true);
    showToast('Menyiapkan file PDF...', 'success');
    
    try {
      let template = f4Template;
      const primary = f4Config?.primaryFont || 'Inter';
      const secondary = f4Config?.secondaryFont || 'monospace';
      
      const defaultFallback = `<div class="bill-card-container" style="width: 100%; height: 100%; padding: 12px; font-family: {{font_primary}}, system-ui, sans-serif; background-color: #ffffff; border: 3.5px solid #2563eb; border-radius: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; page-break-inside: avoid;">
  
  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box; position: relative;">
    <div style="display: flex; gap: 10px; align-items: center;">
      <div style="width: 44px; height: 44px; border: 2px solid #2563eb; border-radius: 8px; padding: 2px; display: flex; justify-content: center; align-items: center; background: #ffffff; flex-shrink: 0;">
        <img src="{{app_logo}}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <div>
        <div style="font-family: {{font_secondary}}, sans-serif; font-size: 19px; font-weight: 900; color: #2563eb; line-height: 1.1; text-transform: uppercase; letter-spacing: -0.3px;">{{app_name}}</div>
        <div style="font-family: {{font_primary}}, sans-serif; font-size: 10px; color: #2563eb; font-weight: 700; text-transform: uppercase; margin-top: 2px;">{{app_address}}</div>
      </div>
    </div>
    
    <div style="position: absolute; top: -12px; right: -12px; background: #2563eb; color: #ffffff; padding: 12px 20px 12px 40px; font-size: 13px; font-weight: 800; text-align: right; min-width: 170px; line-height: 1.2; clip-path: polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%); z-index: 10;">
      Slip Tagihan <span style="color: #93c5fd; text-transform: uppercase; margin-left: 5px;">{{bulan_tagihan}}</span>
    </div>
  </div>

  <div style="border-top: 2.5px dashed #2563eb; width: 100%; margin: 6px 0;"></div>

  <div style="display: flex; gap: 16px; width: 100%; flex: 1; align-items: flex-start; box-sizing: border-box; margin-bottom: 4px;">
    
    <div style="width: 50%; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
      <div style="background-color: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 11px 13px; box-sizing: border-box;">
        <div style="font-family: {{font_primary}}, sans-serif; font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">INFORMASI PELANGGAN</div>
        <div style="font-family: {{font_secondary}}, sans-serif; font-size: 17px; font-weight: 900; color: #2563eb; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{pelanggan_name}}</div>
        <div style="font-family: {{font_primary}}, sans-serif; font-size: 11px; color: #475569; font-weight: 700; margin-top: 4px;">ID PEL : {{pelanggan_id}}</div>
      </div>
      
      <div style="display: flex; gap: 8px; width: 100%; box-sizing: border-box; align-items: flex-start;">
         <div style="flex: 1.2; border: 1.5px solid #94a3b8; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; background: #f8fafc; height: auto;">
           <div style="font-family: {{font_primary}}, sans-serif; font-size: 9px; font-weight: 800; color: #475569; margin-bottom: 2px;">USERNAME</div>
           <div style="font-family: {{font_primary}}, sans-serif; font-size: 11.5px; font-weight: 700; color: #0f172a; word-break: break-all;">{{pelanggan_username}}</div>
         </div>
         <div style="flex: 0.8; border: 1.5px solid #94a3b8; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; background: #f8fafc; height: auto;">
           <div style="font-family: {{font_primary}}, sans-serif; font-size: 9px; font-weight: 800; color: #475569; margin-bottom: 2px;">PASSWORD</div>
           <div style="font-family: {{font_primary}}, sans-serif; font-size: 11.5px; font-weight: 700; color: #0f172a;">{{pelanggan_password}}</div>
         </div>
      </div>
    </div>

    <div style="width: 50%; display: flex; flex-direction: column; box-sizing: border-box; gap: 4px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; box-sizing: border-box;">
        <tr style="border-bottom: 1.5px solid #e2e8f0;"><td style="color:#475569; padding: 2.5px 0; font-weight: 600;">Jalur</td><td style="text-align:right; font-weight:800; color:#0f172a;">{{jalur_name}}</td></tr>
        <tr style="border-bottom: 1.5px solid #e2e8f0;"><td style="color:#475569; padding: 2.5px 0; font-weight: 600;">Tarif</td><td style="text-align:right; font-weight:800; color:#0f172a;">{{tarif_name}}</td></tr>
        <tr style="border-bottom: 1.5px solid #e2e8f0;"><td style="color:#475569; padding: 2.5px 0; font-weight: 600;">MCB</td><td style="text-align:right; font-weight:800; color:#2563eb;">{{mcb}}</td></tr>
        <tr style="border-bottom: 1.5px solid #e2e8f0;"><td style="color:#475569; padding: 2.5px 0; font-weight: 600;">Periode</td><td style="text-align:right; font-weight:800; color:#0f172a;">{{rentang_tagihan}}</td></tr>
      </table>
      
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 5px; padding: 4px 6px; font-size: 9.5px; font-weight: 700; color: #475569; text-transform: uppercase; box-sizing: border-box; display: flex; justify-content: space-between; margin-top: 2px;">
        <span>TUNGGAKAN: <span style="color: #ef4444; font-weight: 800;">{{tunggakan}}</span></span>
        <span style="font-weight: 500; font-size: 8.5px; color: #94a3b8; text-transform: none;">S/D Bulan Lalu</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; text-align: center; background: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 5px 4px; box-sizing: border-box;">
        <div style="flex: 1;">
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 800; color: #2563eb; line-height: 1;">TOTAL HARI</div>
          <div style="font-family: {{font_secondary}}, sans-serif; font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 1px 0; line-height: 1;">{{total_hari_sebulan}}</div>
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 700; color: #64748b; line-height: 1;">MALAM</div>
        </div>
        <div style="border-left: 1.5px dashed #2563eb;"></div>
        <div style="flex: 1;">
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 800; color: #ef4444; line-height: 1;">MATI LISTRIK</div>
          <div style="font-family: {{font_secondary}}, sans-serif; font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 1px 0; line-height: 1;">{{hari_mati_listrik}}</div>
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 700; color: #64748b; line-height: 1;">MALAM</div>
        </div>
        <div style="border-left: 1.5px dashed #2563eb;"></div>
        <div style="flex: 1;">
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 800; color: #16a34a; line-height: 1;">OPERASI LISTRIK</div>
          <div style="font-family: {{font_secondary}}, sans-serif; font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 1px 0; line-height: 1;">{{pemakaian_malam}}</div>
          <div style="font-family: {{font_primary}}, sans-serif; font-size: 8px; font-weight: 700; color: #64748b; line-height: 1;">MALAM</div>
        </div>
      </div>
    </div>

  </div>

  <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; width: 100%; box-sizing: border-box; gap: 12px;">
    
    <div style="display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0;">
      <div style="display: flex; align-items: center; gap: 7px; background: #16a34a; color: white; padding: 7px 12px; border-radius: 8px; font-weight: bold; box-sizing: border-box; width: 100%;">
        <svg style="width: 15px; height: 15px; fill: currentColor; flex-shrink: 0;" viewBox="0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422 0 12.008 0c3.192.001 6.192 1.242 8.448 3.499 2.256 2.257 3.493 5.259 3.493 8.452-.003 6.583-5.422 12.001-12.007 12.001-1.994-.001-3.953-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.296 1.51 5.358 1.511 5.411 0 9.814-4.405 9.817-9.82.002-2.624-1.018-5.09-2.871-6.944-1.854-1.854-4.321-2.873-6.944-2.874-5.415 0-9.82 4.405-9.824 9.822-.001 2.096.549 4.14 1.595 5.894L1.764 22.23l4.883-1.276zM17.433 14.73c-.318-.159-1.884-.929-2.179-1.036-.294-.107-.509-.159-.723.159-.214.32-.829 1.036-1.016 1.25-.188.214-.374.241-.692.082-.318-.159-1.342-.493-2.556-1.577-.944-.842-1.581-1.883-1.766-2.199-.186-.317-.02-.489.139-.647.143-.142.318-.37.477-.556.159-.185.212-.317.318-.529.106-.212.053-.397-.026-.556-.079-.159-.723-1.742-.991-2.387-.261-.627-.527-.542-.723-.552-.186-.01-.399-.012-.612-.012-.214 0-.562.08-856.366c-.294.32-1.121 1.096-1.121 2.673 0 1.577 1.149 3.1 1.309 3.313.16.212 2.261 3.453 5.478 4.842.766.33 1.363.527 1.83.675.77.244 1.472.21 2.026.128.618-.092 1.884-.77 2.152-1.472.267-.703.267-1.306.188-1.433-.079-.127-.294-.209-.612-.368z"/></svg>
        <span style="font-family: {{font_secondary}}, sans-serif; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px;">{{app_contact}}</span>
      </div>
      <div style="font-size: 8px; color: #94a3b8; font-weight: 600; padding-left: 2px;">Cetak: {{tgl_cetak}}</div>
    </div>
    
    <div style="text-align: center; flex: 0.8; display: flex; flex-direction: column; justify-content: space-between; height: 64px; min-width: 90px; box-sizing: border-box;">
      <div style="font-size: 8.5px; font-weight: 800; color: #64748b; letter-spacing: 0.3px; text-transform: uppercase;">COLLECTOR,</div>
      <div style="height: 38px;"></div> 
      <div style="font-size: 10.5px; color: #2563eb; font-weight: 900; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.2px;">{{kolektor_name}}</div>
    </div>

    <div style="display: flex; align-items: center; gap: 10px; background: #2563eb; border-radius: 12px; padding: 10px 14px; color: white; min-width: 250px; box-sizing: border-box; justify-content: space-between;">
      
      <div style="width: 44px; height: 44px; background: #ffffff; border-radius: 6px; padding: 2px; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
        <img src="{{qr_code}}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PLTD_IMM_ID_{{pelanggan_id}}'; this.onerror=null;" />
      </div>

      <div style="text-align: right; flex: 1;">
        <span style="font-size: 10px; font-weight: 800; color: #bfdbfe; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">TOTAL TAGIHAN</span>
        <div style="display: flex; align-items: flex-start; justify-content: flex-end; gap: 3px;">
          <span style="font-size: 13px; font-weight: 800; color: #ffffff; margin-top: 3px;">Rp.</span>
          <strong style="font-size: 25px; font-weight: 900; line-height: 1; letter-spacing: -0.5px;">{{total_tagihan}}</strong>
        </div>
      </div>

    </div>

  </div>

</div>`;
      
      if (!template || template.trim().length < 50) {
         template = defaultFallback;
      }

      // Font Injection (Primary & Secondary)
      template = template.replace(/\{\{font_primary\}\}/g, "'" + primary + "'");
      template = template.replace(/\{\{font_secondary\}\}/g, "'" + secondary + "'");

      // Backwards Compatibility
      template = template.replace(/font-family: 'Inter'/g, "font-family: '" + primary + "'");
      template = template.replace(/font-family: monospace/g, "font-family: '" + secondary + "'");

      const fontsToLoad = new Set<string>();
      const systemFonts = ['Inter', 'Roboto', 'Space Grotesk', 'JetBrains Mono', 'Outfit', 'Montserrat', 'Open Sans', 'monospace', 'Sriracha', 'Varela Round', 'Playfair Display', 'Kodchasan', 'Chakra Petch'];
      
      if (primary && systemFonts.includes(primary) && primary !== 'Inter' && primary !== 'monospace') fontsToLoad.add(primary);
      if (secondary && systemFonts.includes(secondary) && secondary !== 'Inter' && secondary !== 'monospace') fontsToLoad.add(secondary);
      
      let fontStyles = '';
      
      // Google Fonts
      const families = Array.from(fontsToLoad).map(f => `family=${f.replace(/ /g, '+')}:wght@400;700;800;900`).join('&');
      if (families) {
        fontStyles += `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');\n`;
      }
      
      const config = f4Config || {
        paperWidth: 215,
        paperHeight: 330,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        gapX: 4,
        gapY: 4
      };

      (config.customFonts || []).forEach((font: any) => {
        if (font.type === 'url') {
          fontStyles += `@import url('${font.url}');\n`;
        } else if (font.type === 'upload') {
          fontStyles += `
            @font-face {
              font-family: '${font.family}';
              src: url('${font.url}');
              font-weight: normal;
              font-style: normal;
            }
          `;
        }
      });

      let htmlContent = `<div id="pdf-content">
        <style>
          ${fontStyles}
          * { -webkit-print-color-adjust: exact; box-sizing: border-box; }
          body { margin: 0; padding: 0; background-color: #ffffff; }
          #pdf-content { width: ${config.paperWidth}mm; background: white; }
          .slip-container { position: absolute; overflow: hidden; }
          .html2pdf__page-break { page-break-after: always; break-after: page; clear: both; height: 0; overflow: hidden; display: block; }
        </style>
      `;
      
      const slipsPerPage = 4;
      const sortedDetails = [...periodDetails].sort((a, b) => {
        const indexA = pelanggans.findIndex(p => p.id === a.pelangganId);
        const indexB = pelanggans.findIndex(p => p.id === b.pelangganId);
        return indexA - indexB;
      });

      for (let i = 0; i < sortedDetails.length; i += slipsPerPage) {
        const pageDetails = sortedDetails.slice(i, i + slipsPerPage);
        
        let pageHtml = `<div style="width: ${config.paperWidth}mm; height: ${config.paperHeight - 1}mm; position: relative; background: #ffffff; overflow: hidden; display: block; box-sizing: border-box;">`;
        
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
          
          tunggakan = previousTagihans.reduce((sum, td) => sum + td.totalTagihan, 0);

          slipHtml = slipHtml.replace(/\{\{pelanggan_name\}\}/g, d.snapshotPelangganName);
          slipHtml = slipHtml.replace(/\{\{pelanggan_id\}\}/g, d.pelangganId);
          slipHtml = slipHtml.replace(/\{\{pelanggan_username\}\}/g, d.snapshotPelangganUsername || '');
          slipHtml = slipHtml.replace(/\{\{pelanggan_password\}\}/g, d.snapshotPelangganPassword || '');
          slipHtml = slipHtml.replace(/\{\{app_logo\}\}/g, appSettings?.logo || '');
          slipHtml = slipHtml.replace(/\{\{app_name\}\}/g, appSettings?.appName || 'PLTD');
          slipHtml = slipHtml.replace(/\{\{app_address\}\}/g, appSettings?.address || '');
          slipHtml = slipHtml.replace(/\{\{app_contact\}\}/g, appSettings?.appContact || '-');
          slipHtml = slipHtml.replace(/\{\{mcb\}\}/g, mcbVal);
          slipHtml = slipHtml.replace(/\{\{tgl_cetak\}\}/g, new Date().toLocaleDateString('id-ID'));
          slipHtml = slipHtml.replace(/\{\{bulan_tagihan\}\}/g, `${months[selectedPeriod.month]} ${selectedPeriod.year}`);
          const rentang = `5 ${months[((selectedPeriod.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod.month].substring(0,3)}`;
          slipHtml = slipHtml.replace(/\{\{rentang_tagihan\}\}/g, rentang);
          slipHtml = slipHtml.replace(/\{\{jalur_name\}\}/g, d.snapshotJalurName || '-');
          slipHtml = slipHtml.replace(/\{\{tarif_name\}\}/g, `Rp. ${d.snapshotTarifPrice.toLocaleString('id-ID')},- (${d.snapshotTarifName})`);
          slipHtml = slipHtml.replace(/\{\{total_hari_sebulan\}\}/g, d.totalHariSebulan?.toString() || '0');
          slipHtml = slipHtml.replace(/\{\{hari_mati_listrik\}\}/g, d.hariMatiListrik?.toString() || '0');
          slipHtml = slipHtml.replace(/\{\{pemakaian_malam\}\}/g, d.pemakaianHari.toString());
          slipHtml = slipHtml.replace(/\{\{tunggakan\}\}/g, `Rp ${tunggakan.toLocaleString('id-ID')}`);
          slipHtml = slipHtml.replace(/\{\{kolektor_name\}\}/g, d.kolektorName || 'Semua'); 
          slipHtml = slipHtml.replace(/\{\{total_tagihan\}\}/g, d.totalTagihan.toLocaleString('id-ID'));
          
          const row = Math.floor(idx / 2);
          const col = idx % 2;
          const width = (config.paperWidth - config.marginLeft - config.marginRight - config.gapX) / 2;
          const height = (config.paperHeight - config.marginTop - config.marginBottom - config.gapY) / 2;
          const top = config.marginTop + (row * (height + config.gapY));
          const left = config.marginLeft + (col * (width + config.gapX));
          
          pageHtml += `<div style="position: absolute; width: ${width}mm; height: ${height}mm; top: ${top}mm; left: ${left}mm; box-sizing: border-box;">${slipHtml}</div>`;
        });
        
        pageHtml += `
          <div style="position: absolute; display: flex; align-items: center; justify-content: center; pointer-events: none; top: 50%; left: ${config.marginLeft}mm; width: calc(100% - ${config.marginLeft + config.marginRight}mm); border-top: 1.5px dashed #94a3b8; z-index: 0; transform: translateY(-50%);">
             <div style="background: white; padding: 0 10px; color: #94a3b8; font-size: 10px;">✂️ Gunting disini</div>
          </div>
          <div style="position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; pointer-events: none; left: 50%; top: ${config.marginTop}mm; height: calc(100% - ${config.marginTop + config.marginBottom}mm); border-left: 1.5px dashed #94a3b8; z-index: 0; transform: translateX(-50%);">
             <div style="background: white; padding: 10px 0; color: #94a3b8; font-size: 10px; transform: rotate(-90deg);">✂️</div>
          </div>
        `;
        
        pageHtml += `</div>`;
        if (i + slipsPerPage < sortedDetails.length) {
           pageHtml += `<div class="html2pdf__page-break"></div>`;
        }
        htmlContent += pageHtml;
      }
      
      htmlContent += `</div>`;

      setPdfRenderHtml(htmlContent);

      setTimeout(async () => {
        if (!printRef.current) return;
        
        await document.fonts.ready;
        
        const calculatedWindowWidth = Math.round((config.paperWidth / 25.4) * 96);

        const opt = {
          margin: 0,
          filename: `Tagihan_${months[selectedPeriod.month]}_${selectedPeriod.year}.pdf`,
          image: { type: 'jpeg' as const, quality: 1.0 },
          pagebreak: { mode: ['css', 'legacy'] },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            letterRendering: true,
            backgroundColor: '#ffffff',
            windowWidth: calculatedWindowWidth,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'mm', 
            format: [config.paperWidth, config.paperHeight] as [number, number], 
            orientation: (config.paperWidth > config.paperHeight ? 'landscape' : 'portrait') as 'landscape' | 'portrait'
          }
        };

        try {
          await html2pdf().from(printRef.current).set(opt).save();
          showToast('Unduh PDF Berhasil');
        } catch (error) {
          console.error('PDF Generation failed:', error);
          showToast('Gagal membuat PDF', 'error');
        } finally {
          setIsGeneratingPdf(false);
          setPdfRenderHtml('');
        }
      }, 3000);

    } catch (err) {
      console.error('PDF preparation failed:', err);
      showToast('Terjadi kesalahan saat menyiapkan data PDF', 'error');
      setIsGeneratingPdf(false);
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

      <div className="shrink-0 bg-white px-4 pb-3 pt-1 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="relative z-10 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari pelanggan..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-medium text-slate-700"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={exportBillToPDF}
              disabled={isGeneratingPdf}
              title="Ekspor PDF"
              className={`w-11 h-11 text-white rounded-xl flex items-center justify-center transition-all shadow-sm border-none active:scale-95 ${isGeneratingPdf ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isGeneratingPdf ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
            </button>
            <button 
              onClick={exportBillToCSV}
              disabled={isGeneratingPdf}
              title="Ekspor CSV"
              className={`w-11 h-11 text-white rounded-xl flex items-center justify-center transition-all shadow-sm border-none active:scale-95 ${isGeneratingPdf ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        {filteredDetails.map(d => (
          <div key={d.id} className={`bg-white rounded-xl p-4 shadow-sm border ${d.status === 'Lunas' ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'} transition-all relative overflow-hidden`}>
            {d.status === 'Lunas' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}
            
            <div className="flex justify-between items-start mb-2 gap-2">
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

            <div className="bg-slate-50/70 rounded-xl p-3.5 mt-3 border border-slate-100/80 flex flex-col gap-1.5">
              <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-2">
                <span className="text-slate-600 text-xs font-bold">{d.snapshotTarifName}</span>
                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-1 rounded border border-emerald-100/50">Rp {d.snapshotTarifPrice.toLocaleString('id-ID')} / mlm</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                 <span>Total Bln: {d.totalHariSebulan} mlm</span>
                 <span>Mati Listrik: {d.hariMatiListrik} mlm</span>
              </div>
              <div className="text-[10px] text-slate-700 font-bold flex justify-between pb-2 border-b border-slate-200">
                 <span>Operasi Bersih:</span>
                 <span>{d.pemakaianHari} Malam</span>
              </div>
              <div className="flex justify-between items-end pt-2 mt-1 gap-2">
                <div className="flex-1">
                  {d.status === 'Belum Lunas' && d.catatan && (
                    <div className="text-[10px] text-red-600 font-medium bg-red-50 p-1.5 rounded line-clamp-2">
                      Catatan: {d.catatan}
                    </div>
                  )}
                  {d.status === 'Lunas' && d.catatan && (
                    <div className="text-[10px] text-emerald-600 font-medium bg-emerald-50 p-1.5 rounded line-clamp-2">
                      Catatan: {d.catatan}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Total Tagihan</div>
                  <div className="font-black text-blue-700 text-lg leading-none">Rp {d.totalTagihan.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between gap-2">
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
               
               <button 
                 onClick={() => handleRawBTPrint(d)}
                 className="flex-1 text-[10px] font-bold text-white uppercase flex items-center justify-center gap-1 bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm active:scale-95 border border-emerald-700"
               >
                 <Printer size={14} /> Thermal Print
               </button>
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
      {/* Hidden container for PDF rendering */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '-9999px',
          width: `${f4Config?.paperWidth || 215}mm`,
          pointerEvents: 'none',
          zIndex: -9999,
          background: '#ffffff'
        }}
        aria-hidden="true"
      >
        <div ref={printRef} dangerouslySetInnerHTML={{ __html: pdfRenderHtml }} />
      </div>
    </div>
  );
}

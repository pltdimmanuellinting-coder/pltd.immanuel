import React, { useState } from 'react';
import { ChevronLeft, Printer, FileDown, Smartphone, Calendar, FileText, Loader2 } from 'lucide-react';
import { TagihanDetail } from '../types';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function PrintPage({ onBack, selectedBill }: { onBack: () => void, selectedBill?: any }) {
  const { tagihanPeriods, f4Template, f4Config, appSettings, tagihanDetails, showToast, pelanggans, tarifs } = useAppContext();
  
  const [printType, setPrintType] = useState<'f4' | 'thermal'>(selectedBill ? 'thermal' : 'f4');
  const [selectedPeriodId, setSelectedPeriodId] = useState(selectedBill?.periodId || '');
  const [printSingle, setPrintSingle] = useState(!!selectedBill);
  const [pageRange, setPageRange] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfRenderHtml, setPdfRenderHtml] = useState('');
  const printRef = React.useRef<HTMLDivElement>(null);

  // Auto-init if detail provided
  React.useEffect(() => {
    if (selectedBill) {
      setPrintType('thermal');
      setSelectedPeriodId(selectedBill.periodId);
      setPrintSingle(true);
    }
  }, [selectedBill]);

  const allDetails = tagihanDetails
    .filter(d => d.periodId === selectedPeriodId)
    .sort((a, b) => {
      const indexA = pelanggans.findIndex(p => p.id === a.pelangganId);
      const indexB = pelanggans.findIndex(p => p.id === b.pelangganId);
      return indexA - indexB;
    });

  const details = (selectedBill && printSingle) ? [selectedBill] : allDetails;

  const fontOptions = [
    { name: 'Default (Inter)', value: 'Inter' },
    { name: 'Space Grotesk', value: 'Space Grotesk' },
    { name: 'Outfit', value: 'Outfit' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono' },
    { name: 'monospace', value: 'monospace' },
  ];

  React.useEffect(() => {
    const fontsToLoad = new Set<string>();
    const googleFontOptions = fontOptions.map(f => f.value);
    
    if (f4Config.primaryFont && googleFontOptions.includes(f4Config.primaryFont) && f4Config.primaryFont !== 'Inter' && f4Config.primaryFont !== 'monospace') {
      fontsToLoad.add(f4Config.primaryFont);
    }
    if (f4Config.secondaryFont && googleFontOptions.includes(f4Config.secondaryFont) && f4Config.secondaryFont !== 'Inter' && f4Config.secondaryFont !== 'monospace') {
      fontsToLoad.add(f4Config.secondaryFont);
    }
    
    const existingStyle = document.getElementById('print-fonts-style');
    if (existingStyle) existingStyle.remove();
    const existingLink = document.getElementById('print-fonts-link');
    if (existingLink) existingLink.remove();

    // 1. Handle Google Fonts
    const urlFont = f4Config.customFonts?.find((f: any) => f.type === 'url');
    if (urlFont?.family) fontsToLoad.add(urlFont.family);

    if (fontsToLoad.size > 0 || urlFont?.url) {
      const link = document.createElement('link');
      link.id = 'print-fonts-link';
      link.rel = 'stylesheet';
      
      const families = Array.from(fontsToLoad).map(f => `family=${f.replace(/ /g, '+')}:wght@400;700;800;900`).join('&');
      let gUrl = families ? `https://fonts.googleapis.com/css2?${families}&display=swap` : '';
      
      if (urlFont?.url && !urlFont.url.includes('family=')) {
         const extraLink = document.createElement('link');
         extraLink.rel = 'stylesheet';
         extraLink.href = urlFont.url;
         document.head.appendChild(extraLink);
      }

      if (gUrl) {
        link.href = gUrl;
        document.head.appendChild(link);
      }
    }

    // 2. Handle Base64 Uploaded Fonts
    const uploadedFonts = f4Config.customFonts?.filter((f: any) => f.type === 'upload') || [];
    if (uploadedFonts.length > 0) {
      const style = document.createElement('style');
      style.id = 'print-fonts-style';
      let fontFaceRules = '';
      uploadedFonts.forEach((font: any) => {
        fontFaceRules += `
          @font-face {
            font-family: '${font.family}';
            src: url('${font.url}');
            font-weight: normal;
            font-style: normal;
          }
        `;
      });
      style.textContent = fontFaceRules;
      document.head.appendChild(style);
    }
    
    // Cleanup on unmount
    return () => {
       const es = document.getElementById('print-fonts-style');
       if (es) es.remove();
       const el = document.getElementById('print-fonts-link');
       if (el) el.remove();
    }
  }, [f4Config.primaryFont, f4Config.secondaryFont, f4Config.customFonts]);

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
      const primary = f4Config.primaryFont || 'Inter';
      const secondary = f4Config.secondaryFont || 'monospace';
      
      const defaultFallback = `<div class="bill-card-container" style="width: 100%; height: 100%; padding: 12px; font-family: {{font_primary}}, system-ui, sans-serif; background-color: #ffffff; border: 3.5px solid #2563eb; border-radius: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; position: relative;">
  
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
    
    <div style="background-color: #2563eb; color: #ffffff; padding: 9px 40px 9px 36px; font-size: 13px; font-weight: 800; text-align: right; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); min-width: 170px; box-sizing: border-box;">
      Slip Tagihan <span style="color: #93c5fd; text-transform: uppercase;">{{bulan_tagihan}}</span>
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
      
      if (!template || template.trim() === '') {
         template = defaultFallback;
      }

      // Font Injection (Primary & Secondary)
      template = template.replace(/\{\{font_primary\}\}/g, `'${primary}'`);
      template = template.replace(/\{\{font_secondary\}\}/g, `'${secondary}'`);

      // Backwards Compatibility
      template = template.replace(/font-family: 'Inter'/g, `font-family: '${primary}'`);
      template = template.replace(/font-family: monospace/g, `font-family: '${secondary}'`);
    
    // Build font stylesheet (Google & Base64 Uploads)
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
    
    // Custom URL or Uploaded Fonts
    (f4Config.customFonts || []).forEach((font: any) => {
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
        @page { size: ${f4Config.paperWidth}mm ${f4Config.paperHeight}mm; margin: 0; }
        * { -webkit-print-color-adjust: exact; box-sizing: border-box; }
        body { margin: 0; padding: 0; background-color: #ffffff; }
        .slip-grid { 
           display: grid; 
           grid-template-columns: repeat(2, 1fr); 
           grid-template-rows: repeat(2, 1fr);
           gap: ${Math.max(0, f4Config.gapY)}mm ${Math.max(0, f4Config.gapX)}mm;
           width: ${f4Config.paperWidth}mm;
           height: ${f4Config.paperHeight}mm;
           padding: ${f4Config.marginTop}mm ${f4Config.marginRight}mm ${f4Config.marginBottom}mm ${f4Config.marginLeft}mm;
           box-sizing: border-box;
           position: relative;
        }
        .slip-grid::after {
            content: '';
            position: absolute;
            top: 50%;
            left: ${Math.max(0, f4Config.marginLeft)}mm;
            right: ${Math.max(0, f4Config.marginRight)}mm;
            border-top: 1px dashed #64748b;
        }
        .slip-grid::before {
            content: '';
            position: absolute;
            left: 50%;
            top: ${Math.max(0, f4Config.marginTop)}mm;
            bottom: ${Math.max(0, f4Config.marginBottom)}mm;
            border-left: 1px dashed #64748b;
        }
        .slip-item { overflow: hidden; width: 100%; height: 100%; position: relative; padding: 4px; }
      </style>
    `;
    const slipsPerPage = 4;

    for (let i = 0; i < details.length; i += slipsPerPage) {
      const pageDetails = details.slice(i, i + slipsPerPage);
      
      const isLastPage = (i + slipsPerPage) >= details.length;
      htmlContent += `<div class="slip-grid" style="${isLastPage ? 'page-break-after: auto;' : 'page-break-after: always;'}">`;
      
      for (let j = 0; j < slipsPerPage; j++) {
         const d = pageDetails[j];
         if (d) {
            let slipHtml = template;
            
            let mcbVal = '-';
            const pel = pelanggans.find(p => p.id === d.pelangganId);
            if (pel) {
               const tar = tarifs.find(t => t.id === pel.tarifId);
               if (tar && tar.mcb) mcbVal = tar.mcb;
            }

            // Hitung Tunggakan
            const previousTagihans = tagihanDetails.filter(td => 
              td.pelangganId === d.pelangganId && 
              td.id !== d.id && 
              td.status === 'Belum Lunas'
            );
            
            const tunggakan = previousTagihans.reduce((sum, td) => sum + td.totalTagihan, 0);

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
            slipHtml = slipHtml.replace(/\{\{total_tagihan\}\}/g, d.totalTagihan.toLocaleString('id-ID'));
            
            htmlContent += `<div class="slip-item">${slipHtml}</div>`;
         } else {
            // Fill empty cells to maintain grid layout
            htmlContent += `<div class="slip-item"></div>`;
         }
      }
      
      htmlContent += `</div>`;
    }
    
    htmlContent += `</div>`;

    setPdfRenderHtml(htmlContent);

    setTimeout(async () => {
      if (!printRef.current) return;
      
      // Wait for all fonts to finish loading to ensure they render in PDF
      await document.fonts.ready;
      
      const calculatedWindowWidth = Math.round((f4Config.paperWidth / 25.4) * 96);

      const opt = {
        margin: 0,
        filename: `Tagihan_${months[selectedPeriod?.month || 0]}_${selectedPeriod?.year}.pdf`,
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
        setPdfRenderHtml('');
      }
    }, 3000);

  } catch (err) {
    console.error('PDF preparation failed:', err);
    showToast('Terjadi kesalahan saat menyiapkan data PDF', 'error');
    setIsGeneratingPdf(false);
  }
};

  const handlePrintThermal = () => {
    if (!selectedPeriodId) return alert('Pilih periode tagihan terlebih dahulu');
    if (details.length === 0) return alert('Tidak ada data tagihan untuk dicetak');
    
    let printText = '';
    const divider = '--------------------------------\n';
    const header = `${appSettings.appName.toUpperCase()}\n${appSettings.address}\nTelp/WA: ${appSettings.appContact || '-'}\n${divider}`;
    
    details.forEach(d => {
      const rentang = `5 ${months[((selectedPeriod?.month ?? 0) + 11) % 12].substring(0,3)} - 4 ${months[selectedPeriod?.month || 0].substring(0,3)}`;
      
      printText += header;
      printText += `SLIP TAGIHAN LISTRIK\n`;
      printText += `Periode: ${months[selectedPeriod?.month || 0]} ${selectedPeriod?.year}\n`;
      printText += `${divider}`;
      printText += `NAMA : ${d.snapshotPelangganName}\n`;
      printText += `ID   : ${d.pelangganId}\n`;
      printText += `JALUR: ${d.snapshotJalurName}\n`;
      printText += `${divider}`;
      printText += `Tarif: ${d.snapshotTarifName}\n`;
      printText += `Harga: Rp ${d.snapshotTarifPrice.toLocaleString('id-ID')}\n`;
      printText += `Pemakaian: ${d.pemakaianHari} Malam\n`;
      printText += `Tunggakan: Rp 0\n`;
      printText += `${divider}`;
      printText += `TOTAL TAGIHAN:\n`;
      printText += `Rp ${d.totalTagihan.toLocaleString('id-ID')}\n`;
      printText += `${divider}`;
      printText += `Dicetak: ${new Date().toLocaleDateString('id-ID')}\n`;
      printText += `KOLEKTOR: ${d.kolektorName || '-'}\n`;
      printText += `\n\n\n`; // Spacing for tear
    });

    // Alert for debug in preview
    alert('Mencetak ke Thermal Printer via RawBT...');
    
    // Trigger RawBT
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
              onChange={(e) => {
                setSelectedPeriodId(e.target.value);
                setPrintSingle(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">-- Pilih Data Generate --</option>
              {tagihanPeriods.map(p => (
                <option key={p.id} value={p.id}>Tagihan {months[p.month]} {p.year} ({p.totalAmount.toLocaleString('id-ID')} - {p.totalDays}h)</option>
              ))}
            </select>
          </div>

          {selectedBill && (
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button 
                type="button"
                onClick={() => setPrintSingle(true)}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all line-clamp-1 ${printSingle ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Slip {selectedBill.snapshotPelangganName}
              </button>
              <button 
                type="button"
                onClick={() => setPrintSingle(false)}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all line-clamp-1 ${!printSingle ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Semua ({allDetails.length})
              </button>
            </div>
          )}

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
          top: 0,
          left: '-9999px',
          width: `${f4Config.paperWidth}mm`,
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

import React, { useState } from 'react';
import { ChevronLeft, Printer, Settings2, Columns, Code, Eye, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PageHeader from './PageHeader';

export default function TemplateStudioPage({ onBack }: { onBack: () => void }) {
  const { appSettings, showToast, f4Template, setF4Template, f4Config, setF4Config, savePrintSettings } = useAppContext();
  const [activeCanvas, setActiveCanvas] = useState<'F4' | 'Thermal'>('F4');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  
  // Real F4 Dimensions in mm (330 x 215 for Landscape)
  const [config, setConfig] = useState(f4Config);

  const handleConfigChange = (key: string, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleOrientationToggle = () => {
    setConfig(prev => ({
      ...prev,
      paperWidth: prev.paperHeight,
      paperHeight: prev.paperWidth
    }));
  };

  const fontOptions = [
    { name: 'Default (Inter)', value: 'Inter' },
    { name: 'Space Grotesk', value: 'Space Grotesk' },
    { name: 'Outfit', value: 'Outfit' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono' },
    { name: 'monospace', value: 'monospace' },
  ];

  const thermalWidths = [58, 80];
  const [thermalWidth, setThermalWidth] = useState(58);

  // Calculations for F4 grid
  const [zoomF4, setZoomF4] = useState(0.3);

  const availableWidth = config.paperWidth - config.marginLeft - config.marginRight - config.gapX;
  const availableHeight = config.paperHeight - config.marginTop - config.marginBottom - config.gapY;
  
  const slipWidth = availableWidth / 2;
  const slipHeight = availableHeight / 2;

  const defaultHtml = `<div class="bill-card-container" style="width: 100%; height: 100%; padding: 12px; font-family: {{font_primary}}, system-ui, sans-serif; background-color: #ffffff; border: 3.5px solid #2563eb; border-radius: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative; page-break-inside: avoid;">
  
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
    <div style="display: flex; align-items: center; gap: 7px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 7px 12px; border-radius: 8px; font-weight: bold; box-shadow: 0 2px 4px rgba(22,163,74,0.15); box-sizing: border-box; width: 100%;">
      <svg style="width: 15px; height: 15px; fill: currentColor; flex-shrink: 0;" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.419 5.422 0 12.008 0c3.192.001 6.192 1.242 8.448 3.499 2.256 2.257 3.493 5.259 3.493 8.452-.003 6.583-5.422 12.001-12.007 12.001-1.994-.001-3.953-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.296 1.51 5.358 1.511 5.411 0 9.814-4.405 9.817-9.82.002-2.624-1.018-5.09-2.871-6.944-1.854-1.854-4.321-2.873-6.944-2.874-5.415 0-9.82 4.405-9.824 9.822-.001 2.096.549 4.14 1.595 5.894L1.764 22.23l4.883-1.276zM17.433 14.73c-.318-.159-1.884-.929-2.179-1.036-.294-.107-.509-.159-.723.159-.214.32-.829 1.036-1.016 1.25-.188.214-.374.241-.692.082-.318-.159-1.342-.493-2.556-1.577-.944-.842-1.581-1.883-1.766-2.199-.186-.317-.02-.489.139-.647.143-.142.318-.37.477-.556.159-.185.212-.317.318-.529.106-.212.053-.397-.026-.556-.079-.159-.723-1.742-.991-2.387-.261-.627-.527-.542-.723-.552-.186-.01-.399-.012-.612-.012-.214 0-.562.08-856.366c-.294.32-1.121 1.096-1.121 2.673 0 1.577 1.149 3.1 1.309 3.313.16.212 2.261 3.453 5.478 4.842.766.33 1.363.527 1.83.675.77.244 1.472.21 2.026.128.618-.092 1.884-.77 2.152-1.472.267-.703.267-1.306.188-1.433-.079-.127-.294-.209-.612-.368z"/></svg>
      <span style="font-family: {{font_secondary}}, sans-serif; font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px;">{{app_contact}}</span>
      </div>
      <div style="font-size: 8px; color: #94a3b8; font-weight: 600; padding-left: 2px;">Cetak: {{tgl_cetak}}</div>
    </div>
    
    <div style="text-align: center; flex: 0.8; display: flex; flex-direction: column; justify-content: space-between; height: 64px; min-width: 90px; box-sizing: border-box;">
      <div style="font-size: 8.5px; font-weight: 800; color: #64748b; letter-spacing: 0.3px; text-transform: uppercase;">COLLECTOR,</div>
      <div style="height: 38px;"></div> 
      <div style="font-size: 10.5px; color: #2563eb; font-weight: 900; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.2px;">{{kolektor_name}}</div>
    </div>

    <div style="display: flex; align-items: center; gap: 10px; background: #2563eb; border-radius: 12px; padding: 10px 14px; color: white; min-width: 250px; box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3); box-sizing: border-box; justify-content: space-between;">
      
      <div style="width: 44px; height: 44px; background: #ffffff; border-radius: 6px; padding: 2px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; box-shadow: inset 0 0 2px rgba(0,0,0,0.2);">
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

  const [htmlCodeF4, setHtmlCodeF4] = useState(f4Template || defaultHtml);
  const [htmlCodeThermal, setHtmlCodeThermal] = useState(defaultHtml);

  // Update local editor state when global state loads from Firestore
  React.useEffect(() => {
    if (f4Template) setHtmlCodeF4(f4Template);
  }, [f4Template]);

  React.useEffect(() => {
    if (f4Config) setConfig(f4Config);
  }, [JSON.stringify(f4Config)]);

  // Mock template parser for a preview
  const parseTemplate = (code: string) => {
    let res = code;
    
    const primary = config.primaryFont || 'Inter';
    const secondary = config.secondaryFont || 'monospace';
    
    // Inject fonts
    res = res.replace(/\{\{font_primary\}\}/g, `'${primary}'`);
    res = res.replace(/\{\{font_secondary\}\}/g, `'${secondary}'`);

    // Backwards compatibility for old templates
    res = res.replace(/font-family: 'Inter'/g, `font-family: '${primary}'`);
    res = res.replace(/font-family: monospace/g, `font-family: '${secondary}'`);

    res = res.replace(/\{\{app_name\}\}/g, appSettings.appName);
    res = res.replace(/\{\{app_address\}\}/g, appSettings.address);
    res = res.replace(/\{\{app_contact\}\}/g, appSettings.appContact || '-');
    res = res.replace(/\{\{app_logo\}\}/g, appSettings.logo || '');
    res = res.replace(/\{\{pelanggan_name\}\}/g, 'Budi Santoso');
    res = res.replace(/\{\{pelanggan_id\}\}/g, 'PLTDIM-ABC1001');
    res = res.replace(/\{\{pelanggan_username\}\}/g, 'budi@pelanggan');
    res = res.replace(/\{\{pelanggan_password\}\}/g, '1234');
    res = res.replace(/\{\{kolektor_name\}\}/g, 'Bpk Rudi');
    res = res.replace(/\{\{bulan_tagihan\}\}/g, 'Mei 2026');
    res = res.replace(/\{\{rentang_tagihan\}\}/g, '5 Apr - 4 Mei');
    res = res.replace(/\{\{tgl_cetak\}\}/g, '04/06/2026');
    res = res.replace(/\{\{jalur_name\}\}/g, 'Lipat Gunting');
    res = res.replace(/\{\{tarif_name\}\}/g, 'Rp. 8.000,- (LAMPU)');
    res = res.replace(/\{\{mcb\}\}/g, '2A');
    res = res.replace(/\{\{total_hari_sebulan\}\}/g, '31');
    res = res.replace(/\{\{hari_mati_listrik\}\}/g, '0');
    res = res.replace(/\{\{pemakaian_malam\}\}/g, '31');
    res = res.replace(/\{\{total_tagihan\}\}/g, '217.000');
    res = res.replace(/\{\{tunggakan\}\}/g, '0');
    return res;
  };

  const handleSave = () => {
    if (activeCanvas === 'F4') {
      setF4Template(htmlCodeF4);
      setF4Config(config);
      savePrintSettings(htmlCodeF4, config);
    }
    showToast('Template Berhasil Disimpan');
  };

   // Font loading utility for the preview
  React.useEffect(() => {
    const fontsToLoad = new Set<string>();
    const googleFontOptions = fontOptions.map(f => f.value);
    
    if (config.primaryFont && googleFontOptions.includes(config.primaryFont) && config.primaryFont !== 'Inter' && config.primaryFont !== 'monospace') {
      fontsToLoad.add(config.primaryFont);
    }
    if (config.secondaryFont && googleFontOptions.includes(config.secondaryFont) && config.secondaryFont !== 'Inter' && config.secondaryFont !== 'monospace') {
      fontsToLoad.add(config.secondaryFont);
    }
    
    const existingStyle = document.getElementById('template-fonts-style');
    if (existingStyle) existingStyle.remove();
    const existingLink = document.getElementById('template-fonts-link');
    if (existingLink) existingLink.remove();

    // 1. Handle Google Fonts
    const urlFont = config.customFonts?.find(f => f.type === 'url');
    if (urlFont?.family) fontsToLoad.add(urlFont.family);

    if (fontsToLoad.size > 0 || urlFont?.url) {
      const link = document.createElement('link');
      link.id = 'template-fonts-link';
      link.rel = 'stylesheet';
      
      const families = Array.from(fontsToLoad).map(f => `family=${f.replace(/ /g, '+')}:wght@400;700;800;900`).join('&');
      let gUrl = families ? `https://fonts.googleapis.com/css2?${families}&display=swap` : '';
      
      if (urlFont?.url && !urlFont.url.includes('family=')) {
         // If it's a direct CSS link provided in URL box
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
    const uploadedFonts = config.customFonts?.filter(f => f.type === 'upload') || [];
    if (uploadedFonts.length > 0) {
      const style = document.createElement('style');
      style.id = 'template-fonts-style';
      let fontFaceRules = '';
      uploadedFonts.forEach(font => {
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
  }, [config.primaryFont, config.secondaryFont, config.customFonts]);

  return (
    <div className="flex flex-col h-full bg-white relative pb-10">
      <PageHeader 
        title="TEMPLATE STUDIO" 
        onBack={onBack} 
        rightAction={
          <div className="flex gap-2">
            <button onClick={() => {
              if(window.confirm('Reset template F4 ke versi modern default?')) {
                setHtmlCodeF4(defaultHtml);
                setF4Template(defaultHtml);
                savePrintSettings(defaultHtml, config);
                showToast('Template di-reset');
              }
            }} className="text-slate-500 font-bold p-2 px-3 text-[10px] bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase flex items-center justify-center">
              Reset
            </button>
            <button onClick={handleSave} className="text-white font-black p-2 px-4 text-[10px] bg-emerald-500 rounded-xl flex items-center gap-2 hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all uppercase">
              <Save size={16} /> Simpan
            </button>
          </div>
        }
      />

      <div className="p-4 flex flex-col pt-4 pb-20 space-y-4">
        {/* Canvas Selector */}
        <div className="flex rounded-xl bg-slate-200 p-1">
          <button 
            onClick={() => setActiveCanvas('F4')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeCanvas === 'F4' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            A4 / F4 (Kertas)
          </button>
          <button 
            onClick={() => setActiveCanvas('Thermal')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeCanvas === 'Thermal' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Thermal
          </button>
        </div>

        {/* View Mode Toggle under main tabs */}
        <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden text-xs font-bold divide-x shadow-sm">
           <button 
             onClick={() => setViewMode('preview')} 
             className={`flex-1 py-2 flex justify-center items-center gap-2 ${viewMode === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <Eye size={16} /> Live Preview
           </button>
           <button 
             onClick={() => setViewMode('editor')} 
             className={`flex-1 py-2 flex justify-center items-center gap-2 ${viewMode === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
           >
             <Code size={16} /> HTML Editor
           </button>
        </div>

        {activeCanvas === 'F4' ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
             <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
               <h3 className="text-sm font-bold text-slate-800">Pengaturan Kertas Panel</h3>
               <div className="flex gap-2">
                 <select 
                   className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-600 hover:bg-slate-200 outline-none"
                   value={config.paperWidth > config.paperHeight ? (config.paperWidth === 330 ? 'F4' : 'A4') : (config.paperHeight === 330 ? 'F4' : 'A4')}
                   onChange={(e) => {
                     const isLandscape = config.paperWidth > config.paperHeight;
                     if (e.target.value === 'A4') {
                       setConfig(prev => ({ ...prev, paperWidth: isLandscape ? 297 : 210, paperHeight: isLandscape ? 210 : 297 }));
                     } else {
                       setConfig(prev => ({ ...prev, paperWidth: isLandscape ? 330 : 215, paperHeight: isLandscape ? 215 : 330 }));
                     }
                   }}
                 >
                   <option value="F4">Size: F4</option>
                   <option value="A4">Size: A4</option>
                 </select>
                 <button onClick={handleOrientationToggle} className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-600 hover:bg-slate-200">Ubah Orientasi</button>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-medium mb-1">Margin Lembar (mm)</label>
                  <input 
                    type="number"
                    value={config.marginLeft}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleConfigChange('marginLeft', v);
                      handleConfigChange('marginRight', v);
                      handleConfigChange('marginTop', v);
                      handleConfigChange('marginBottom', v);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-medium mb-1">Gap Tengah (mm)</label>
                  <input 
                    type="number"
                    value={config.gapX}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleConfigChange('gapX', v);
                      handleConfigChange('gapY', v);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-medium mb-1">Font Utama (Main)</label>
                  <select 
                    value={config.primaryFont || 'Inter'}
                    onChange={(e) => setConfig(prev => ({ ...prev, primaryFont: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                  >
                    <optgroup label="System Fonts">
                      {fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    </optgroup>
                    {config.customFonts?.filter(f => f.type === 'upload').length > 0 && (
                      <optgroup label="Uploaded Fonts">
                        {config.customFonts.filter(f => f.type === 'upload').map(f => (
                          <option key={f.family} value={f.family}>{f.family} (Uploaded)</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-medium mb-1">Font Kedua (Mono/Secondary)</label>
                  <select 
                    value={config.secondaryFont || 'monospace'}
                    onChange={(e) => setConfig(prev => ({ ...prev, secondaryFont: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                  >
                    <optgroup label="System Fonts">
                      {fontOptions.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                    </optgroup>
                    {config.customFonts?.filter(f => f.type === 'upload').length > 0 && (
                      <optgroup label="Uploaded Fonts">
                        {config.customFonts.filter(f => f.type === 'upload').map(f => (
                          <option key={f.family} value={f.family}>{f.family} (Uploaded)</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
             </div>
             
             <div className="space-y-3 pt-1">
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Custom Font URL (Google Fonts Link)</label>
                  <input 
                    type="text"
                    placeholder="https://fonts.googleapis.com/css2?family=Sriracha&display=swap"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-blue-600 transition-all"
                    value={config.customFonts?.find(f => f.type === 'url')?.url || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      const familyMatch = url.match(/family=([^&:]+)/);
                      const family = familyMatch ? decodeURIComponent(familyMatch[1]).split(':')[0].replace(/\+/g, ' ') : '';
                      
                      setConfig(prev => {
                        const otherFonts = (prev.customFonts || []).filter(f => f.type !== 'url');
                        return {
                          ...prev,
                          customFonts: [...otherFonts, { family, url, type: 'url' }]
                        };
                      });
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">Upload Font File (.ttf, .otf, .woff)</label>
                  <div className="flex gap-2">
                    <input 
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      className="hidden"
                      id="font-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            const family = file.name.split('.')[0].replace(/[-_]/g, ' ');
                            
                            setConfig(prev => {
                              const otherFonts = (prev.customFonts || []).filter(f => f.family !== family);
                              return {
                                ...prev,
                                customFonts: [...otherFonts, { family, url: base64, type: 'upload' }]
                              };
                            });
                            showToast(`Font ${family} berhasil diunggah`);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="font-upload"
                      className="flex-1 bg-slate-100 border border-dashed border-slate-300 rounded-lg py-2 text-center text-[10px] font-bold text-slate-500 cursor-pointer hover:bg-slate-200 transition-all"
                    >
                      Klik untuk Unggah Font
                    </label>
                    {(config.customFonts || []).some(f => f.type === 'upload') && (
                      <button 
                        onClick={() => setConfig(prev => ({ ...prev, customFonts: (prev.customFonts || []).filter(f => f.type !== 'upload') }))}
                        className="bg-red-50 text-red-500 border border-red-100 rounded-lg px-3 py-2 text-[10px] font-bold"
                      >
                        Hapus Semua Unggahan
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(config.customFonts || []).filter(f => f.type === 'upload').map(f => (
                      <span key={f.family} className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                        {f.family}
                      </span>
                    ))}
                  </div>
                </div>
             </div>
             
             <div className="mt-2 text-center bg-blue-50 border border-blue-100 rounded p-2 flex justify-around">
                <div>
                   <span className="block text-[10px] text-blue-500 font-bold">Ukuran Lembar</span>
                   <span className="text-xs font-black text-blue-800">{config.paperWidth} x {config.paperHeight} mm</span>
                </div>
                <div>
                   <span className="block text-[10px] text-blue-500 font-bold">Dimensi 1 Form</span>
                   <span className="text-xs font-black text-blue-800">{slipWidth.toFixed(1)} x {slipHeight.toFixed(1)} mm</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-800">Ukuran Thermal</h3>
             <select 
               value={thermalWidth} 
               onChange={e => setThermalWidth(Number(e.target.value))}
               className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold outline-none"
             >
                {thermalWidths.map(w => <option key={w} value={w}>{w} mm</option>)}
             </select>
          </div>
        )}

        {/* The Workspace Area */}
        <div className="flex-1 flex flex-col pt-2 min-h-[400px]">
          {viewMode === 'preview' ? (
             <div className="bg-slate-200 rounded-xl border-4 border-slate-300 flex-1 flex flex-col items-center justify-center p-4 overflow-hidden relative group">
               <span className="absolute top-2 left-2 text-[10px] uppercase font-black text-slate-400 opacity-60 z-10">Live Preview</span>
               {activeCanvas === 'F4' && (
                 <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setZoomF4(prev => Math.max(0.1, prev - 0.05))} className="bg-white text-slate-700 w-8 h-8 rounded-lg shadow font-bold text-lg hover:bg-blue-50 transition-colors">-</button>
                   <button onClick={() => setZoomF4(prev => Math.min(1, prev + 0.05))} className="bg-white text-slate-700 w-8 h-8 rounded-lg shadow font-bold text-lg hover:bg-blue-50 transition-colors">+</button>
                 </div>
               )}
               {activeCanvas === 'F4' ? (
                  <div className="w-full relative flex justify-center items-start overflow-auto" style={{ height: '350px' }}>
                    <div 
                      className="bg-white shadow-lg overflow-hidden shrink-0 origin-top"
                      style={{
                        width: `${config.paperWidth}mm`,
                        height: `${config.paperHeight}mm`,
                        paddingTop: `${config.marginTop}mm`,
                        paddingBottom: `${config.marginBottom}mm`,
                        paddingLeft: `${config.marginLeft}mm`,
                        paddingRight: `${config.marginRight}mm`,
                        position: 'relative',
                        transform: `scale(${zoomF4})`, // Custom scale
                        transformOrigin: 'top center'
                      }}
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="absolute bg-white overflow-hidden"
                          style={{
                            width: `${slipWidth}mm`,
                            height: `${slipHeight}mm`,
                            top: i > 2 ? `${config.marginTop + slipHeight + config.gapY}mm` : `${config.marginTop}mm`,
                            left: i % 2 === 0 ? `${config.marginLeft + slipWidth + config.gapX}mm` : `${config.marginLeft}mm`,
                          }}
                          dangerouslySetInnerHTML={{ __html: parseTemplate(htmlCodeF4) }}
                        />
                      ))}
                      
                      {/* Horizontal Cut Line */}
                      <div className="absolute flex items-center justify-center pointer-events-none" style={{
                         top: '50%',
                         left: `${config.marginLeft}mm`,
                         width: `calc(100% - ${config.marginLeft + config.marginRight}mm)`,
                         borderTop: '1.5px dashed #94a3b8',
                         zIndex: 0
                      }}>
                         <div className="bg-white px-2 py-0 text-[#94a3b8] text-[8px] sm:text-[10px] -mt-[14px]">✂️ Gunting disini</div>
                      </div>
                      
                      {/* Vertical Cut Line */}
                      <div className="absolute flex items-center justify-center flex-col pointer-events-none" style={{
                         left: '50%',
                         top: `${config.marginTop}mm`,
                         height: `calc(100% - ${config.marginTop + config.marginBottom}mm)`,
                         borderLeft: '1.5px dashed #94a3b8',
                         zIndex: 0
                      }}>
                         <div className="bg-white py-2 px-0 text-[#94a3b8] text-[8px] sm:text-[10px] -ml-[14px]" style={{ transform: 'rotate(-90deg)' }}>✂️</div>
                      </div>
                    </div>
                  </div>
               ) : (
                  <div className="w-full relative flex justify-center items-start overflow-auto" style={{ height: '350px' }}>
                    <div 
                      className="bg-white shadow-xl min-h-[150px] shrink-0 origin-top" 
                      style={{ 
                        width: `${thermalWidth}mm`,
                        transform: 'scale(1)',
                        transformOrigin: 'top center'
                      }} 
                      dangerouslySetInnerHTML={{ __html: parseTemplate(htmlCodeThermal) }}
                    ></div>
                  </div>
               )}
             </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-slate-900 rounded-xl shadow border border-slate-700 overflow-hidden">
              <div className="bg-slate-800 text-slate-300 text-xs px-3 py-2 font-mono flex justify-between rounded-t-xl">
                 <span>{activeCanvas === 'F4' ? 'editor_f4.html' : 'editor_thermal.html'}</span>
                 <span className="text-emerald-400 font-bold text-[10px]">{'{{variables}}'} ready</span>
              </div>
              <textarea
                className="flex-1 w-full bg-slate-900 text-slate-100 p-4 font-mono text-xs outline-none min-h-[300px]"
                value={activeCanvas === 'F4' ? htmlCodeF4 : htmlCodeThermal}
                onChange={(e) => activeCanvas === 'F4' ? setHtmlCodeF4(e.target.value) : setHtmlCodeThermal(e.target.value)}
                spellCheck={false}
              ></textarea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

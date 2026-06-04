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

  const thermalWidths = [58, 80];
  const [thermalWidth, setThermalWidth] = useState(58);

  // Calculations for F4 grid
  const [zoomF4, setZoomF4] = useState(0.3);

  const availableWidth = config.paperWidth - config.marginLeft - config.marginRight - config.gapX;
  const availableHeight = config.paperHeight - config.marginTop - config.marginBottom - config.gapY;
  
  const slipWidth = availableWidth / 2;
  const slipHeight = availableHeight / 2;

  const defaultHtml = `<div style="padding: 15px; font-family: 'Inter', system-ui, sans-serif; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; background-color: #ffffff; color: #1e293b; position: relative; overflow: hidden; box-shadow: inset 0 0 0 3px #f8fafc;">
  <!-- Header Minimalist -->
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed #cbd5e1; padding-bottom: 12px; margin-bottom: 12px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 44px; height: 44px; background: #f8fafc; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">
        <img src="{{app_logo}}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <div>
        <strong style="color: #0f172a; font-size: 16px; font-weight: 900; line-height: 1.2; letter-spacing: -0.5px; text-transform: uppercase; display: block;">{{app_name}}</strong>
        <span style="font-size: 10px; color: #64748b; font-weight: 500; display: block; max-width: 150px; line-height: 1.2;">{{app_address}}</span>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="background: #2563eb; color: white; padding: 4px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; display: inline-block; margin-bottom: 4px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">TAGIHAN LISTRIK</div>
      <div style="font-size: 10px; color: #64748b; font-weight: 800;">{{bulan_tagihan}}</div>
    </div>
  </div>
  
  <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 16px; flex: 1;">
    <!-- Kiri: Info Pelanggan -->
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px solid #f1f5f9; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 4px; border-radius: 4px 0 0 4px; height: 100%; background: #2563eb;"></div>
        <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">Data Pelanggan</div>
        <strong style="font-size: 14px; font-weight: 800; color: #0f172a; display: block;">{{pelanggan_name}}</strong>
        <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace; font-weight: 600;">ID: {{pelanggan_id}}</span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
         <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;">
           <span style="display: block; font-size: 8px; font-weight: 700; color: #64748b; margin-bottom: 2px;">USERNAME</span>
           <strong style="color: #0f172a; font-family: 'JetBrains Mono', monospace; font-size: 10px;">{{pelanggan_username}}</strong>
         </div>
         <div style="background: #ffffff; padding: 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;">
           <span style="display: block; font-size: 8px; font-weight: 700; color: #64748b; margin-bottom: 2px;">PASSWORD</span>
           <strong style="color: #0f172a; font-family: 'JetBrains Mono', monospace; font-size: 10px;">{{pelanggan_password}}</strong>
         </div>
      </div>
    </div>
    
    <!-- Kanan: Detail Tagihan -->
    <div style="display: flex; flex-direction: column; justify-content: space-between;">
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
  
  <!-- Footer -->
  <div style="margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end;">
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

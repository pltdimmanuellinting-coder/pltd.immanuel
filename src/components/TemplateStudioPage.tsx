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

  const defaultHtml = `<div style="padding: 15px; font-family: 'Inter', system-ui, sans-serif; font-size: 11px; border: 1.5px solid #0f172a; border-radius: 12px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; background-color: #ffffff; color: #1e293b; position: relative; overflow: hidden;">
  <div style="position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px;">
      <div style="width: 40px; height: 40px; background: #f1f5f9; border-radius: 8px; display: flex; items-center; justify-content: center; overflow: hidden; border: 1px solid #e2e8f0;">
        <img src="{{app_logo}}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <div style="text-align: left; flex: 1;">
        <strong style="color: #0f172a; font-size: 18px; line-height: 1; letter-spacing: 1px; text-transform: uppercase; display: block; margin-bottom: 2px;">{{app_name}}</strong>
        <span style="font-size: 9px; color: #64748b; font-weight: bold; display: block;">{{app_address}}</span>
      </div>
      <div style="text-align: right; background: #0f172a; color: white; padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; letter-spacing: 1px; flex-shrink: 0;">
        SLIP TAGIHAN
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 15px;">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Informasi Pelanggan</div>
          <strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 2px;">{{pelanggan_name}}</strong>
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
      
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Bulan</td><td style="text-align: right; font-weight: 900; color: #0f172a;">{{bulan_tagihan}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Tarif</td><td style="text-align: right; font-weight: 900; color: #0f172a;">{{tarif_name}}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="color: #64748b; padding: 4px 0;">Pemakaian</td><td style="text-align: right; font-weight: 900; color: #0f172a;">{{pemakaian_malam}} Malam</td></tr>
          <tr><td style="color: #64748b; padding: 4px 0;">Kolektor</td><td style="text-align: right; font-weight: 900; color: #0f172a;">{{kolektor_name}}</td></tr>
        </table>
        
        <!-- Blok Nominal (Non-inverted, clean professional look) -->
        <div style="margin-top: 15px; background: #ffffff; border: 2px solid #0f172a; padding: 10px 15px; border-radius: 10px; text-align: right;">
          <span style="font-size: 9px; font-weight: 800; color: #64748b; display: block; text-transform: uppercase; margin-bottom: 2px;">Total Tagihan</span>
          <strong style="font-size: 20px; color: #0f172a; letter-spacing: 1px;">Rp {{total_tagihan}}</strong>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 12px; font-size: 9px; color: #94a3b8; text-align: center; font-style: italic; border-top: 1px solid #f1f5f9; padding-top: 8px;">
      "Terima kasih atas partisipasi Anda dalam mendukung ketersediaan listrik desa kita."
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
    res = res.replace(/\{\{app_logo\}\}/g, appSettings.logo || '');
    res = res.replace(/\{\{pelanggan_name\}\}/g, 'Budi Santoso');
    res = res.replace(/\{\{pelanggan_id\}\}/g, 'PLTDIM-ABC1001');
    res = res.replace(/\{\{pelanggan_username\}\}/g, 'budi@pelanggan');
    res = res.replace(/\{\{pelanggan_password\}\}/g, '1234');
    res = res.replace(/\{\{kolektor_name\}\}/g, 'Bpk Rudi');
    res = res.replace(/\{\{bulan_tagihan\}\}/g, 'Mei 2026');
    res = res.replace(/\{\{tarif_name\}\}/g, '7000 LAMPU');
    res = res.replace(/\{\{pemakaian_malam\}\}/g, '31');
    res = res.replace(/\{\{total_tagihan\}\}/g, '217.000');
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
          <button onClick={handleSave} className="text-white font-black p-2 px-4 text-[10px] bg-emerald-500 rounded-xl flex items-center gap-2 hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all uppercase">
            <Save size={16} /> Simpan
          </button>
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
               <button onClick={handleOrientationToggle} className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-600 hover:bg-slate-200">Ubah Orientasi</button>
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

/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Printer, User as UserIcon, LogOut, Settings, PenTool, BookOpen, Loader2 } from 'lucide-react';
import { Role } from './types.ts';
import { useAppContext } from './context/AppContext.tsx';
import OperatorDashboard from './components/OperatorDashboard';
import PelangganPage from './components/PelangganPage';
import GenerateTagihanPage from './components/GenerateTagihanPage';
import TemplateStudioPage from './components/TemplateStudioPage';
import TagihanPage from './components/TagihanPage';
import PrintPage from './components/PrintPage';
import PageHeader from './components/PageHeader';
import DesignShowcase from './components/DesignShowcase';

export default function App() {
  const { 
    appSettings, setAppSettings, saveAppSettings, pelanggans, kolektors, operators, showToast,
    currentUser: firebaseUser, userRole: firebaseRole, isLoading, printContent, seedInitialData
  } = useAppContext();
  
  const [role, setRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'tagihan' | 'print' | 'profile' | 'pelanggan' | 'generate_tagihan' | 'template_studio' | 'pembukuan' | 'showcase'>('home');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sync with Firebase Auth state
  useEffect(() => {
    if (firebaseRole) {
      setRole(firebaseRole);
      // Try to find the user in our lists
      const op = operators.find(o => o.id === firebaseUser?.uid);
      if (op) setCurrentUser(op);
    }
  }, [firebaseRole, firebaseUser, operators]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check operators
    const op = operators.find(x => x.username === loginUsername && x.password === loginPassword);
    if (op || (loginUsername === 'eggystwn@operator' && loginPassword === 'Zefanya')) {
        const user = op || { id: 'op1', name: 'Eggy Setiawan', username: 'eggystwn@operator' };
        setRole('Operator');
        setCurrentUser(user);
        showToast(`Selamat datang, ${user.name}`);
        return;
    }
    
    // Simple local-only login for others for now, but CRUD might fail if rules strict
    const pc = pelanggans.find(x => x.username === loginUsername && x.password === loginPassword);
    if (pc) {
       setRole('Pelanggan');
       setCurrentUser(pc);
       showToast(`Selamat datang, ${pc.name}`);
       return;
    }
    const kc = kolektors.find(x => x.username === loginUsername && x.password === loginPassword);
    if (kc) {
       setRole('Kolektor');
       setCurrentUser(kc);
       showToast(`Selamat datang, ${kc.name}`);
       return;
    }
    
    showToast('Username atau password tidak valid', 'error');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium font-sans">Menyiapkan Aplikasi...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6 space-y-6 border border-slate-200">
          <div className="text-center">
            {appSettings.logo ? (
               <img src={appSettings.logo} alt="Logo" className="w-20 h-20 mx-auto object-cover rounded-xl mb-4" />
            ) : (
               <div className="text-4xl text-blue-600 mb-4 flex justify-center"><LayoutDashboard size={48}/></div>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{appSettings.appName}</h1>
            <p className="text-sm text-slate-500 mt-1">Sistem Informasi Penagihan</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <label className="text-xs font-bold text-slate-500 mb-1 block">Username</label>
               <input type="text" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="Contoh: eggystwn@operator" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500" />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 mb-1 block">Password</label>
               <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Masukkan password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500" />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg shadow-blue-200 mt-2"
            >
              Masuk
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-[10px] text-slate-400 mt-4">Hubungi administrator jika tidak dapat login.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        if (role === 'Operator') {
          return (
            <div className="relative h-full flex flex-col">
              <OperatorDashboard 
                onNavigate={setCurrentTab} 
                onSeedData={seedInitialData}
              />
              <div className="mt-auto p-6 pb-2 text-left">
                <div className="flex items-center gap-2 text-[#0000ff] font-black text-xs">
                  <span className="bg-[#0000ff] text-white px-1.5 py-0.5 rounded text-[8px]">WA</span>
                  085179911407
                </div>
              </div>
            </div>
          );
        }
        return <div className="p-4 text-center mt-10">Welcome {role}</div>;
      case 'pelanggan':
        return <PelangganPage onBack={() => setCurrentTab('home')} />;
      case 'generate_tagihan':
        return <GenerateTagihanPage onBack={() => setCurrentTab('home')} />;
      case 'template_studio':
        return <TemplateStudioPage onBack={() => setCurrentTab('home')} />;
      case 'pembukuan':
        return (
          <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
            <PageHeader title="PEMBUKUAN" onBack={() => setCurrentTab('home')} />
            <div className="p-4 text-center mt-10 h-full text-slate-400 font-bold uppercase tracking-widest text-xs">Modul Pembukuan Sedang Dikembangkan</div>
          </div>
        );
      case 'tagihan':
        return <TagihanPage onBack={() => setCurrentTab('home')} role={role} />;
      case 'print':
        return <PrintPage onBack={() => setCurrentTab('home')} />;
      case 'showcase':
        return <DesignShowcase onBack={() => setCurrentTab('profile')} />;
      case 'profile':
        return (
          <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
            <PageHeader title="SETTING" onBack={() => setCurrentTab('home')} />
            <div className="p-5 overflow-y-auto pb-32 space-y-6 flex-1">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-700 block border-b border-slate-100 pb-2">Identitas Aplikasi</h3>
                
                <div>
                  <label className="text-xs text-slate-500 font-bold mb-2 block">Upload Logo Perusahaan</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                      {appSettings.logo ? <img src={appSettings.logo} className="w-full h-full object-cover" /> : <LayoutDashboard className="text-slate-400" />}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = (e) => setAppSettings(prev => ({ ...prev, logo: e.target?.result as string }));
                          r.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Usaha / Aplikasi</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" 
                      value={appSettings.appName} 
                      onChange={(e) => setAppSettings(prev => ({ ...prev, appName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">Alamat Usaha</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 transition-all" 
                      value={appSettings.address} 
                      onChange={(e) => setAppSettings(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <button 
                    onClick={() => saveAppSettings(appSettings).then(() => showToast('Identitas aplikasi disimpan'))}
                    className="bg-blue-600 text-white shadow-lg shadow-blue-200 px-4 py-3.5 rounded-xl text-sm font-bold w-full hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Simpan Identitas Aplikasi
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-700 block border-b border-slate-100 pb-2">Profil Pengguna</h3>

                <div>
                  <label className="text-xs text-slate-500 font-bold mb-2 block mt-1">Foto Profil User</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                      {appSettings.profilePic ? <img src={appSettings.profilePic} className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400" />}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = (e) => setAppSettings(prev => ({ ...prev, profilePic: e.target?.result as string }));
                          r.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                   <div>
                     <label className="text-xs text-slate-500 font-bold mb-1 block">Nama Pengguna</label>
                     <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all" defaultValue={currentUser?.name || role || ''} />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500 font-bold mb-1 block">Kata Sandi Baru</label>
                     <input type="password" placeholder="Kosongkan jika tidak diganti" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 transition-all" />
                   </div>
                   <button className="bg-emerald-600 text-white shadow-lg shadow-emerald-200 px-4 py-3.5 rounded-xl text-sm font-bold w-full hover:bg-emerald-700 transition-all active:scale-95">
                     Simpan Profil
                   </button>
                   
                   <div className="pt-4 mt-4 border-t border-slate-100">
                     <button 
                       onClick={() => setCurrentTab('showcase')}
                       className="w-full bg-slate-900 text-white shadow-lg shadow-slate-200 px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       <PenTool size={16} /> Lihat Gallery Design
                     </button>
                     <p className="text-[9px] text-slate-400 mt-2 text-center uppercase font-bold tracking-tighter">Pilih gaya visual baru untuk aplikasi Anda</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => { setRole(null); setCurrentTab('home'); }}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold transition-colors hover:bg-red-100 mt-8"
              >
                <LogOut size={20} />
                Keluar / Ganti Akun
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isHomeView = currentTab === 'home';

  return (
    <div className="min-h-screen bg-white flex justify-center font-sans">
      <div className="w-full max-w-[480px] bg-white h-[100dvh] relative shadow-2xl flex flex-col border-x border-slate-200 overflow-hidden">
        {isHomeView && role && (
          <header className="relative bg-[#0000ff] text-white pt-10 pb-20 overflow-hidden shrink-0">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/20 rounded-full blur-[120px] opacity-20" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] opacity-10" />
            </div>

            <div className="relative px-6 z-20 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-1.5">
                  {appSettings.logo ? (
                    <img src={appSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/10 rounded-xl">
                      <LayoutDashboard size={32} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter drop-shadow-xl flex items-center gap-2 uppercase">
                    {appSettings.appName}
                  </h1>
                  <p className="text-[11px] text-blue-100 font-black mt-1 tracking-tight uppercase opacity-90">
                    {appSettings.address}
                  </p>
                  <div className="mt-2 text-[10px] bg-white/10 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 font-bold">
                    <span className="opacity-70">User: </span>
                    <span className="text-white uppercase">{currentUser?.name || 'Operator'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setRole(null); setCurrentTab('home'); }}
                className="relative h-12 w-12 shrink-0 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center overflow-hidden transition-all hover:bg-white/20 active:scale-95 text-white/90"
                title="Keluar"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Refined Proportional Wave Bottom */}
            <div className="absolute bottom-[-1px] left-0 w-full leading-[0] pointer-events-none">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] text-white fill-current">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" opacity="0.3"></path>
                <path d="M0,0V15.81C20,45.92,45.64,66.86,97.69,82.05c45.76,13.1,87.41,15,132.31,11,62-5.63,111.91-25.7,164-36,54.85-10.87,112.5,4.1,164.5,22,64.21,22.1,131.62,24.9,198.5,9,46.75-11.11,88.4-32.9,134.5-49,50-17.46,105-23.09,156.5-12,25.3,5,44.7,14,64.5,26.5,50,31.6,100,32.5,157.5,10V120H0Z"></path>
              </svg>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-28">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur shadow-xl rounded-2xl border border-slate-200 p-1.5 flex items-center justify-between z-40 no-print">
          <button 
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors ${currentTab === 'home' || ['pelanggan', 'generate_tagihan', 'template_studio', 'pembukuan'].includes(currentTab) ? 'bg-[#0000ff] text-white shadow-inner shadow-blue-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold mt-1">HOME</span>
          </button>
          <button 
            onClick={() => setCurrentTab('tagihan')}
            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors ${currentTab === 'tagihan' ? 'bg-[#0000ff] text-white shadow-inner shadow-blue-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <FileText size={24} />
            <span className="text-[10px] font-bold mt-1">TAGIHAN</span>
          </button>
          <button 
            onClick={() => setCurrentTab('print')}
            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors ${currentTab === 'print' ? 'bg-[#0000ff] text-white shadow-inner shadow-blue-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Printer size={24} />
            <span className="text-[10px] font-bold mt-1">PRINT</span>
          </button>
          <button 
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-colors ${currentTab === 'profile' ? 'bg-[#0000ff] text-white shadow-inner shadow-blue-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Settings size={24} />
            <span className="text-[10px] font-bold mt-1">SETTING</span>
          </button>
        </nav>
      </div>

      {/* Global Print Container */}
      <div id="print-container" dangerouslySetInnerHTML={{ __html: printContent }} />
    </div>
  );
}

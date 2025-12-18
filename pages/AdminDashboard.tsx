
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppointmentStatus, SiteConfig } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, updateAppointmentStatus, 
    services, addService, updateService, removeService,
    siteConfig, updateSiteConfig,
    isAdminLoggedIn, login, logout, dbError
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'site'>('appointments');
  const [editingService, setEditingService] = useState<any>(null);
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Credenciais incorretas.');
    } else {
      setError('');
    }
  };

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '#home';
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-pink-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-pink-200 transform -rotate-6">
               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-pink-900">Painel Admin</h2>
            <p className="text-pink-400 font-bold mt-1">Gestão de Agendamentos</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-pink-50 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all bg-gray-50/50 font-bold"
                required
                placeholder="Ex: profissional"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-pink-50 focus:ring-4 focus:ring-pink-100 focus:border-pink-400 outline-none transition-all bg-gray-50/50 font-bold"
                required
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{error}</p>}
            <button className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all transform active:scale-95 uppercase tracking-widest text-sm">
              Acessar Sistema
            </button>
            <div className="text-center pt-2">
              <button 
                onClick={goHome}
                className="text-xs text-pink-300 hover:text-pink-500 font-bold transition-colors"
              >
                Voltar ao site público
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const handleSaveConfig = () => {
    updateSiteConfig(configForm);
    if (!dbError) alert('Configurações salvas!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        alert('Imagem muito pesada (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setConfigForm({ ...configForm, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const pendingCount = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  return (
    <div className="min-h-screen bg-pink-50/30 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-80 bg-white border-r border-pink-100 p-8 flex flex-col md:h-screen sticky top-0 z-50 shadow-xl shadow-pink-100/20">
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg">A</div>
          <div>
            <h2 className="text-xl font-extrabold text-pink-900 leading-none">Admin</h2>
            <p className="text-[10px] text-pink-400 font-extrabold uppercase mt-1 tracking-widest">Gestão Profissional</p>
          </div>
        </div>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'appointments' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}>
            <span className="text-xl">📅</span>
            <span>Agendamentos</span>
            {pendingCount > 0 && <span className="ml-auto bg-white text-pink-600 text-[10px] px-2 py-0.5 rounded-full font-extrabold">{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveTab('services')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'services' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}>
            <span className="text-xl">💅</span>
            <span>Serviços</span>
          </button>
          <button onClick={() => setActiveTab('site')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'site' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}>
            <span className="text-xl">🌐</span>
            <span>Configurar Site</span>
          </button>
        </nav>
        
        <div className="pt-8 border-t border-pink-50">
          <button onClick={logout} className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all font-extrabold">
            <span className="text-xl">🚪</span>
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
        
        {/* Aviso de Erro de Banco de Dados (RLS) */}
        {dbError === 'RLS_ERROR' && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-3xl animate-fade-in">
            <h3 className="text-red-800 font-extrabold text-lg mb-2">⚠️ Atenção: Configuração Necessária no Supabase</h3>
            <p className="text-red-600 text-sm font-bold mb-4">
              Seu banco de dados está bloqueando a gravação (RLS ativado). Para salvar as alterações para todos os usuários, você precisa:
            </p>
            <ol className="text-red-700 text-xs font-bold space-y-2 list-decimal ml-4">
              <li>Acesse seu painel no Supabase.</li>
              <li>Vá em <b>SQL Editor</b> no menu lateral.</li>
              <li>Cole e rode este comando abaixo:</li>
            </ol>
            <pre className="mt-4 bg-red-900 text-red-100 p-4 rounded-xl text-[10px] overflow-x-auto font-mono">
              {`ALTER TABLE posts ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Public Access" ON public.posts \nFOR ALL USING (true) WITH CHECK (true);`}
            </pre>
            <p className="mt-4 text-[10px] text-red-500 font-bold">* Enquanto isso não for feito, as alterações ficam salvas apenas no seu navegador atual.</p>
          </div>
        )}

        <div className="mb-12">
          <p className="text-pink-400 font-extrabold text-xs uppercase tracking-widest mb-2">Área Administrativa</p>
          <h1 className="text-5xl font-extrabold text-pink-900">
            {activeTab === 'appointments' && 'Solicitações de Agenda'}
            {activeTab === 'services' && 'Gestão de Serviços'}
            {activeTab === 'site' && 'Identidade do Site'}
          </h1>
        </div>

        {/* Tab: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-pink-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-pink-50/30 border-b border-pink-100">
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest">Procedimento</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-center">Data</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50/50">
                    {appointments.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-24 text-center text-pink-200 font-bold italic text-lg">Sem agendamentos.</td></tr>
                    ) : (
                      [...appointments].reverse().map(a => (
                        <tr key={a.id} className="hover:bg-pink-50/10 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="font-extrabold text-gray-900 text-lg">{a.clientName}</div>
                            <a href={`https://wa.me/${a.clientWhatsapp.replace(/\D/g, '')}`} target="_blank" className="text-xs text-green-500 font-bold">WhatsApp: {a.clientWhatsapp}</a>
                          </td>
                          <td className="px-10 py-6">
                            <span className="font-extrabold text-pink-900 bg-pink-50 px-3 py-1 rounded-full text-xs">
                              {services.find(s => s.id === a.serviceId)?.name || 'Serviço'}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="font-extrabold text-gray-700">{new Date(a.date).toLocaleDateString('pt-BR')}</div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase
                              ${a.status === AppointmentStatus.PENDING ? 'bg-yellow-50 text-yellow-600' : ''}
                              ${a.status === AppointmentStatus.CONFIRMED ? 'bg-green-50 text-green-600' : ''}
                              ${a.status === AppointmentStatus.CANCELLED ? 'bg-red-50 text-red-500' : ''}
                            `}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            {a.status === AppointmentStatus.PENDING && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CONFIRMED)} className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Confirmar</button>
                                <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CANCELLED)} className="bg-white text-red-500 border border-red-50 px-4 py-2 rounded-xl text-xs font-bold">Recusar</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Services */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-pink-900">Procedimentos</h2>
              <button onClick={() => setEditingService({ name: '', description: '' })} className="bg-pink-600 text-white px-8 py-3.5 rounded-2xl font-extrabold shadow-xl text-xs uppercase">+ Adicionar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(s => (
                <div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100 flex flex-col">
                  <h3 className="text-2xl font-extrabold text-pink-900 mb-3">{s.name}</h3>
                  <p className="text-gray-500 text-sm mb-10 flex-1 font-bold">{s.description}</p>
                  <div className="flex space-x-3">
                    <button onClick={() => setEditingService(s)} className="flex-1 text-[10px] bg-pink-50 text-pink-600 py-3 rounded-xl font-bold uppercase">Editar</button>
                    <button onClick={() => { if(confirm('Excluir?')) removeService(s.id); }} className="flex-1 text-[10px] bg-white text-red-300 py-3 rounded-xl border border-red-50 font-bold uppercase">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Site Config */}
        {activeTab === 'site' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-pink-100 space-y-12 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-extrabold text-pink-900 mb-2">Identidade</h3>
                  <p className="text-sm text-pink-300 font-bold">Logo e contatos.</p>
                </div>
                <div className="md:col-span-2 space-y-8">
                  <div className="flex items-center gap-6 p-6 bg-pink-50/30 rounded-2xl">
                    <div className="w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-pink-200 flex items-center justify-center overflow-hidden">
                      {configForm.logoUrl && <img src={configForm.logoUrl} alt="Logo" className="w-full h-full object-contain" />}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-pink-600 px-4 py-2 rounded-xl font-bold text-xs border border-pink-100 shadow-sm">Alterar Logo</button>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome Profissional" value={configForm.professionalName} onChange={e => setConfigForm({...configForm, professionalName: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-pink-50 font-bold" />
                    <input type="text" placeholder="WhatsApp" value={configForm.whatsappNumber} onChange={e => setConfigForm({...configForm, whatsappNumber: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-pink-50 font-bold" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-pink-50 flex justify-end">
                <button onClick={handleSaveConfig} className="bg-pink-600 text-white px-12 py-4 rounded-2xl font-bold shadow-2xl hover:bg-pink-700 text-sm uppercase">Salvar Alterações</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editor de Serviço */}
        {editingService && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl">
              <h3 className="text-2xl font-extrabold text-pink-900 mb-6">{editingService.id ? 'Editar' : 'Novo'} Serviço</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Nome" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-gray-50 border font-bold" />
                <textarea placeholder="Descrição" value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full px-6 py-4 rounded-xl bg-gray-50 border h-32 font-bold" />
                <div className="flex space-x-3 pt-4">
                  <button onClick={() => setEditingService(null)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                  <button onClick={() => { if(editingService.id) updateService(editingService.id, editingService); else addService(editingService); setEditingService(null); }} className="flex-1 py-4 rounded-xl bg-pink-600 text-white font-bold">Salvar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppointmentStatus, SiteConfig } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, updateAppointmentStatus, 
    services, addService, updateService, removeService,
    siteConfig, updateSiteConfig,
    isAdminLoggedIn, login, logout 
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
    alert('Configurações salvas e aplicadas ao site!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3000000) {
        alert('Imagem muito pesada. Use uma de até 3MB.');
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
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'appointments' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}
          >
            <span className="text-xl">📅</span>
            <span>Agendamentos</span>
            {pendingCount > 0 && <span className="ml-auto bg-white text-pink-600 text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">{pendingCount}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'services' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}
          >
            <span className="text-xl">💅</span>
            <span>Serviços</span>
          </button>
          <button 
            onClick={() => setActiveTab('site')}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'site' ? 'bg-pink-600 text-white shadow-xl shadow-pink-200 font-bold' : 'hover:bg-pink-50 text-pink-700/60 font-bold'}`}
          >
            <span className="text-xl">🌐</span>
            <span>Configurar Site</span>
          </button>
        </nav>
        
        <div className="pt-8 border-t border-pink-50">
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all font-extrabold"
          >
            <span className="text-xl">🚪</span>
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto">
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
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest">Cliente / Contato</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest">Procedimento</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-center">Data Agendada</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-10 py-6 font-extrabold text-[11px] text-pink-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50/50">
                    {appointments.length === 0 ? (
                      <tr><td colSpan={5} className="px-10 py-24 text-center text-pink-200 font-bold italic text-lg">Nenhum agendamento registrado até agora.</td></tr>
                    ) : (
                      [...appointments].reverse().map(a => (
                        <tr key={a.id} className="hover:bg-pink-50/10 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="font-extrabold text-gray-900 text-lg group-hover:text-pink-600 transition-colors">{a.clientName}</div>
                            <a 
                              href={`https://wa.me/${a.clientWhatsapp.replace(/\D/g, '')}`} 
                              target="_blank" 
                              className="inline-flex items-center space-x-2 text-sm text-green-500 font-extrabold hover:text-green-600 mt-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.132c1.524.905 3.384 1.445 5.41 1.446 5.404 0 9.803-4.398 9.803-9.802 0-2.618-1.02-5.078-2.871-6.928-1.851-1.85-4.311-2.87-6.928-2.87-5.405 0-9.803 4.398-9.803 9.802 0 2.03.626 3.968 1.811 5.591l-.991 3.619 3.769-.988zm11.523-6.833c-.301-.151-1.781-.878-2.057-.978-.275-.1-.476-.151-.675.151-.199.302-.771.978-.946 1.178-.175.201-.35.226-.651.075-.301-.151-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.675-2.086-.175-.302-.018-.465.132-.615.136-.134.301-.351.451-.527.149-.176.199-.301.3-.502.1-.201.05-.377-.025-.527-.075-.151-.675-1.631-.925-2.235-.243-.587-.491-.507-.675-.516-.174-.008-.375-.01-.576-.01-.201 0-.527.075-.802.377-.275.301-1.053 1.029-1.053 2.511 0 1.481 1.078 2.912 1.228 3.113.15.201 2.122 3.241 5.14 4.542.717.31 1.277.495 1.713.633.72.229 1.375.196 1.893.118.577-.087 1.781-.728 2.031-1.43.25-.702.25-1.305.175-1.43-.075-.126-.275-.201-.576-.352z" /></svg>
                              <span>Chamar Cliente</span>
                            </a>
                          </td>
                          <td className="px-10 py-6">
                            <span className="font-extrabold text-pink-900 bg-pink-50 px-3 py-1 rounded-full text-sm">
                              {services.find(s => s.id === a.serviceId)?.name || 'Removido'}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="font-extrabold text-gray-700">{new Date(a.date).toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'long' })}</div>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border
                              ${a.status === AppointmentStatus.PENDING ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : ''}
                              ${a.status === AppointmentStatus.CONFIRMED ? 'bg-green-50 text-green-600 border-green-100' : ''}
                              ${a.status === AppointmentStatus.CANCELLED ? 'bg-red-50 text-red-50 border-red-100' : ''}
                            `}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            {a.status === AppointmentStatus.PENDING && (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CONFIRMED)}
                                  className="bg-green-500 text-white px-5 py-2.5 rounded-xl hover:bg-green-600 font-extrabold text-xs shadow-lg shadow-green-100 transition-all active:scale-95"
                                >
                                  Confirmar
                                </button>
                                <button 
                                  onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CANCELLED)}
                                  className="bg-white text-red-500 border border-red-100 px-5 py-2.5 rounded-xl hover:bg-red-50 font-extrabold text-xs transition-all active:scale-95"
                                >
                                  Recusar
                                </button>
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
              <h2 className="text-2xl font-extrabold text-pink-900">Gerenciar Procedimentos</h2>
              <button 
                onClick={() => setEditingService({ name: '', description: '' })}
                className="bg-pink-600 text-white px-8 py-3.5 rounded-2xl font-extrabold shadow-xl shadow-pink-100 hover:bg-pink-700 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
              >
                + Adicionar Novo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(s => (
                <div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100 group relative">
                  <h3 className="text-2xl font-extrabold text-pink-900 mb-3">{s.name}</h3>
                  <p className="text-gray-500 text-sm mb-10 min-h-[48px] leading-relaxed font-bold">{s.description}</p>
                  <div className="flex space-x-3">
                    <button onClick={() => setEditingService(s)} className="flex-1 text-xs bg-pink-50 text-pink-600 py-3.5 rounded-xl font-extrabold border border-pink-100 hover:bg-pink-100 transition-colors uppercase tracking-widest">EDITAR</button>
                    <button onClick={() => { if(confirm('Excluir serviço?')) removeService(s.id); }} className="flex-1 text-xs bg-white text-red-300 py-3.5 rounded-xl border border-red-50 font-extrabold hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest">EXCLUIR</button>
                  </div>
                </div>
              ))}
            </div>
            {editingService && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl">
                  <h3 className="text-3xl font-extrabold text-pink-900 mb-8">{editingService.id ? 'Ajustar Serviço' : 'Novo Serviço'}</h3>
                  <div className="space-y-6">
                    <input type="text" placeholder="Nome do Serviço" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 font-bold" />
                    <textarea placeholder="Descrição" value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 h-32 resize-none font-bold" />
                    <div className="flex space-x-4 pt-6">
                      <button onClick={() => setEditingService(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 font-extrabold text-gray-400">Cancelar</button>
                      <button onClick={() => { if(editingService.id) updateService(editingService.id, editingService); else addService(editingService); setEditingService(null); }} className="flex-1 py-4 rounded-2xl bg-pink-600 text-white font-extrabold hover:bg-pink-700">Salvar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Site Config */}
        {activeTab === 'site' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-pink-100 space-y-12 max-w-5xl">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-extrabold text-pink-900 mb-2">Identidade</h3>
                  <p className="text-sm text-pink-300 font-bold">Sua marca e contatos.</p>
                </div>
                <div className="md:col-span-2 space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-pink-50/30 rounded-[2rem] border border-pink-50">
                    <div className="w-28 h-28 bg-white rounded-[2rem] border-2 border-dashed border-pink-200 flex items-center justify-center overflow-hidden">
                      {configForm.logoUrl ? (
                        <img src={configForm.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-pink-200 text-xs font-extrabold tracking-widest uppercase">LOGO</span>
                      )}
                    </div>
                    <div className="text-center md:text-left">
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="bg-white text-pink-600 px-8 py-3 rounded-2xl font-extrabold text-xs uppercase border border-pink-100 shadow-md tracking-widest">Upload de Logo</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">Nome Comercial</label>
                      <input type="text" value={configForm.professionalName} onChange={e => setConfigForm({...configForm, professionalName: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">WhatsApp (com DDD)</label>
                      <input type="text" value={configForm.whatsappNumber} onChange={e => setConfigForm({...configForm, whatsappNumber: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-pink-50" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-1">
                  <h3 className="text-xl font-extrabold text-pink-900 mb-2">Página Inicial</h3>
                  <p className="text-sm text-pink-300 font-bold">Textos que vendem seu serviço.</p>
                </div>
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">Título Principal (Hero)</label>
                    <input type="text" value={configForm.heroTitle} onChange={e => setConfigForm({...configForm, heroTitle: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest ml-2">Subtítulo (Hero)</label>
                    <textarea value={configForm.heroSubtitle} onChange={e => setConfigForm({...configForm, heroSubtitle: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-pink-50 bg-gray-50 outline-none focus:ring-4 focus:ring-pink-50 h-32 resize-none font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-10 flex justify-end">
                <button 
                  onClick={handleSaveConfig}
                  className="bg-pink-600 text-white px-16 py-5 rounded-[2rem] font-extrabold uppercase tracking-widest shadow-2xl shadow-pink-200 hover:bg-pink-700 transition-all active:scale-95 text-sm"
                >
                  Salvar Tudo e Publicar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

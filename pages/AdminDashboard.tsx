
import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppointmentStatus, BlockedSlot, SiteConfig, Service } from '../types.ts';
import { Calendar } from '../components/Calendar.tsx';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, updateAppointmentStatus, services, 
    addService, updateService, removeService,
    siteConfig, updateSiteConfig, blockedSlots, toggleBlockedSlot,
    isAdminLoggedIn, login, logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'agenda' | 'services' | 'site'>('appointments');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [editingConfig, setEditingConfig] = useState<SiteConfig>(siteConfig);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  const navigateToHome = () => {
    window.location.hash = '#home';
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); login(username, password); }} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-pink-900 text-center">Acesso Admin</h2>
          <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 border rounded-xl" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-xl" />
          <button className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition-colors">Entrar</button>
          <button 
            type="button"
            onClick={navigateToHome}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>Voltar para o Site</span>
          </button>
        </form>
      </div>
    );
  }

  const dateStr = selectedDate?.toISOString().split('T')[0] || '';
  const isFullDayBlocked = blockedSlots.some(b => b.date === dateStr && !b.time);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteConfig(editingConfig);
    alert('Configurações salvas!');
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || !editingService?.description) return;
    
    if (editingService.id) {
      await updateService(editingService.id, { name: editingService.name, description: editingService.description });
    } else {
      await addService({ name: editingService.name, description: editingService.description });
    }
    setEditingService(null);
  };

  return (
    <div className="min-h-screen bg-pink-50/30 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-pink-100 p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-xl font-bold text-pink-900 mb-8">Nail Admin</h2>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'appointments', label: 'Pedidos', icon: '📥' },
            { id: 'agenda', label: 'Agenda & Folgas', icon: '📅' },
            { id: 'services', label: 'Serviços', icon: '💅' },
            { id: 'site', label: 'Configurar Site', icon: '🌐' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'text-pink-400 hover:bg-pink-50'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto space-y-2 pt-4 border-t border-pink-50">
          <button 
            onClick={navigateToHome}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all"
          >
            <span>🏠</span>
            <span>Voltar para o Site</span>
          </button>
          <button 
            onClick={logout} 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all"
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {activeTab === 'appointments' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-pink-900">Solicitações</h2>
            <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-pink-50/50 text-pink-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Procedimento</th>
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {appointments.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Nenhum agendamento.</td></tr>
                  ) : (
                    [...appointments].reverse().map(a => {
                      const serviceName = services.find(s => s.id === a.serviceId)?.name || 'Desconhecido';
                      return (
                        <tr key={a.id} className="hover:bg-pink-50/20 transition-colors">
                          <td className="p-4 font-bold text-gray-900">
                            {a.clientName}
                            <div className="text-[10px] text-green-500 font-bold">{a.clientWhatsapp}</div>
                          </td>
                          <td className="p-4 text-pink-800 font-semibold">{serviceName}</td>
                          <td className="p-4">
                            <div className="font-bold">{new Date(a.date).toLocaleDateString()}</div>
                            <div className="text-xs text-pink-400">{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'Pendente' ? 'bg-yellow-50 text-yellow-600' : a.status === 'Confirmado' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {a.status === AppointmentStatus.PENDING && (
                              <>
                                <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CONFIRMED)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-green-600 transition-colors">Confirmar</button>
                                <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CANCELLED)} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors">Recusar</button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-8 max-w-4xl animate-fade-in">
            <h2 className="text-3xl font-extrabold text-pink-900">Gestão da Agenda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-pink-800 mb-4">1. Selecione a Data</h3>
                <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                <button 
                  onClick={() => toggleBlockedSlot({ date: dateStr })}
                  className={`w-full mt-4 p-4 rounded-2xl font-bold transition-all shadow-sm ${isFullDayBlocked ? 'bg-red-500 text-white' : 'bg-white border-2 border-pink-100 text-pink-600 hover:bg-pink-50'}`}
                >
                  {isFullDayBlocked ? '🔓 Desbloquear Dia Inteiro' : '🔒 Bloquear Dia Inteiro (Folga)'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-pink-800 mb-4">2. Bloquear Horários Específicos</h3>
                {isFullDayBlocked ? (
                  <div className="p-8 bg-pink-50 rounded-3xl text-center border-2 border-dashed border-pink-100">
                    <p className="text-pink-400 font-bold italic">O dia todo já está bloqueado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map(time => {
                      const isBlocked = blockedSlots.some(b => b.date === dateStr && b.time === time);
                      const isTaken = appointments.some(a => {
                        const d = new Date(a.date);
                        return d.toISOString().split('T')[0] === dateStr && 
                               d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time &&
                               a.status !== AppointmentStatus.CANCELLED;
                      });

                      return (
                        <button 
                          key={time}
                          disabled={isTaken}
                          onClick={() => toggleBlockedSlot({ date: dateStr, time })}
                          className={`p-4 rounded-xl font-bold text-sm transition-all border-2 shadow-sm
                            ${isTaken ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed' :
                              isBlocked ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 
                              'bg-white border-pink-50 text-pink-800 hover:border-pink-200'}
                          `}
                        >
                          {time} {isTaken ? '(Agendado)' : isBlocked ? '(Bloqueado)' : '(Livre)'}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-extrabold text-pink-900">Serviços</h2>
              <button 
                onClick={() => setEditingService({})}
                className="bg-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all"
              >
                + Novo Serviço
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-2xl border flex justify-between items-start shadow-sm hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-bold text-pink-900">{s.name}</h3>
                    <p className="text-sm text-gray-500">{s.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingService(s)} className="text-pink-400 font-bold text-xs hover:text-pink-600">Editar</button>
                    <button onClick={() => removeService(s.id)} className="text-red-300 font-bold text-xs hover:text-red-500">Excluir</button>
                  </div>
                </div>
              ))}
            </div>

            {editingService && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <form onSubmit={handleSaveService} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4 shadow-2xl animate-fade-in">
                  <h3 className="text-xl font-bold text-pink-900">{editingService.id ? 'Editar' : 'Novo'} Serviço</h3>
                  <input required placeholder="Nome do Serviço" value={editingService.name || ''} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full p-3 border rounded-xl" />
                  <textarea required placeholder="Descrição" value={editingService.description || ''} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full p-3 border rounded-xl h-32" />
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setEditingService(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors">Salvar</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'site' && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            <h2 className="text-3xl font-extrabold text-pink-900">Configurações do Site</h2>
            <form onSubmit={handleSaveConfig} className="bg-white p-8 rounded-3xl border space-y-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Nome da Empresa</label>
                  <input value={editingConfig.companyName} onChange={e => setEditingConfig({...editingConfig, companyName: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Nome da Profissional</label>
                  <input value={editingConfig.professionalName} onChange={e => setEditingConfig({...editingConfig, professionalName: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">WhatsApp</label>
                  <input value={editingConfig.whatsappNumber} onChange={e => setEditingConfig({...editingConfig, whatsappNumber: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Endereço/Cidade</label>
                  <input value={editingConfig.address} onChange={e => setEditingConfig({...editingConfig, address: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Título Principal (Hero)</label>
                <input value={editingConfig.heroTitle} onChange={e => setEditingConfig({...editingConfig, heroTitle: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Subtítulo Principal</label>
                <textarea value={editingConfig.heroSubtitle} onChange={e => setEditingConfig({...editingConfig, heroSubtitle: e.target.value})} className="w-full p-3 border rounded-xl font-semibold h-24 focus:ring-2 focus:ring-pink-100 outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-pink-50">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Rodapé (Nome Dev/Empresa)</label>
                  <input value={editingConfig.footerName} onChange={e => setEditingConfig({...editingConfig, footerName: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-300 uppercase tracking-widest">Rodapé (Contato Dev)</label>
                  <input value={editingConfig.footerContact} onChange={e => setEditingConfig({...editingConfig, footerContact: e.target.value})} className="w-full p-3 border rounded-xl font-semibold focus:ring-2 focus:ring-pink-100 outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all transform active:scale-95">
                Salvar Todas as Alterações
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

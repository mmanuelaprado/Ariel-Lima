
import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { AppointmentStatus, BlockedSlot } from '../types.ts';
import { Calendar } from '../components/Calendar.tsx';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, updateAppointmentStatus, services, 
    siteConfig, updateSiteConfig, blockedSlots, toggleBlockedSlot,
    isAdminLoggedIn, login, logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'agenda' | 'services' | 'site'>('appointments');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); login(username, password); }} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-pink-900 text-center">Acesso Admin</h2>
          <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 border rounded-xl" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border rounded-xl" />
          <button className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold">Entrar</button>
        </form>
      </div>
    );
  }

  const dateStr = selectedDate?.toISOString().split('T')[0] || '';
  const isFullDayBlocked = blockedSlots.some(b => b.date === dateStr && !b.time);

  return (
    <div className="min-h-screen bg-pink-50/30 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-pink-100 p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-xl font-bold text-pink-900 mb-8">Nail Admin</h2>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'appointments', label: 'Pedidos', icon: '📥' },
            { id: 'agenda', label: 'Agenda & Folgas', icon: '📅' },
            { id: 'services', label: 'Serviços', icon: '💅' },
            { id: 'site', label: 'Site', icon: '🌐' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm ${activeTab === tab.id ? 'bg-pink-600 text-white' : 'text-pink-400 hover:bg-pink-50'}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto text-red-400 font-bold text-sm p-4">Sair</button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-pink-900">Solicitações</h2>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-pink-50/50 text-pink-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Data/Hora</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {appointments.length === 0 ? (
                    <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">Nenhum agendamento.</td></tr>
                  ) : (
                    [...appointments].reverse().map(a => (
                      <tr key={a.id}>
                        <td className="p-4 font-bold text-gray-900">
                          {a.clientName}
                          <div className="text-[10px] text-green-500">{a.clientWhatsapp}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold">{new Date(a.date).toLocaleDateString()}</div>
                          <div className="text-xs text-pink-400">{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'Pendente' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {a.status === AppointmentStatus.PENDING && (
                            <>
                              <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CONFIRMED)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold">Confirmar</button>
                              <button onClick={() => updateAppointmentStatus(a.id, AppointmentStatus.CANCELLED)} className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold">Recusar</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-8 max-w-4xl">
            <h2 className="text-3xl font-extrabold text-pink-900">Gestão da Agenda</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-pink-800 mb-4">1. Selecione a Data</h3>
                <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                <button 
                  onClick={() => toggleBlockedSlot({ date: dateStr })}
                  className={`w-full mt-4 p-4 rounded-2xl font-bold transition-all ${isFullDayBlocked ? 'bg-red-500 text-white' : 'bg-white border-2 border-pink-100 text-pink-600 hover:bg-pink-50'}`}
                >
                  {isFullDayBlocked ? '🔓 Desbloquear Dia Inteiro' : '🔒 Bloquear Dia Inteiro (Folga)'}
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-pink-800 mb-4">2. Bloquear Horários Específicos</h3>
                {isFullDayBlocked ? (
                  <div className="p-8 bg-pink-50 rounded-3xl text-center">
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
                          className={`p-4 rounded-xl font-bold text-sm transition-all border-2
                            ${isTaken ? 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed' :
                              isBlocked ? 'bg-red-50 border-red-200 text-red-600' : 
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

        {/* ... Demais abas simplificadas para brevidade ... */}
        {activeTab === 'services' && <div className="p-10 bg-white rounded-3xl text-center italic text-gray-400 font-bold">Gerencie seus serviços aqui.</div>}
        {activeTab === 'site' && <div className="p-10 bg-white rounded-3xl text-center italic text-gray-400 font-bold">Configure os textos do seu site.</div>}
      </main>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Calendar } from '../components/Calendar.tsx';
import { AppointmentStatus } from '../types.ts';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const Home: React.FC = () => {
  const { services, siteConfig, addAppointment, appointments, blockedSlots, isLoading } = useApp();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', serviceId: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    const isDayBlocked = blockedSlots.some(b => b.date === dateStr && !b.time);
    if (isDayBlocked) return [];

    return TIME_SLOTS.filter(time => {
      const isTimeBlocked = blockedSlots.some(b => b.date === dateStr && b.time === time);
      if (isTimeBlocked) return false;

      const hasAppointment = appointments.some(a => {
        const aDate = new Date(a.date);
        const aDateStr = aDate.toISOString().split('T')[0];
        const aTimeStr = aDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return aDateStr === dateStr && aTimeStr === time && a.status !== AppointmentStatus.CANCELLED;
      });
      
      return !hasAppointment;
    });
  }, [selectedDate, appointments, blockedSlots]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.name || !formData.whatsapp || !formData.serviceId) return;

    setStatus('loading');
    const [hours, minutes] = selectedTime.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes), 0);

    await addAppointment({
      clientName: formData.name,
      clientWhatsapp: formData.whatsapp,
      serviceId: formData.serviceId,
      date: finalDate.toISOString()
    });
    
    setStatus('success');
    setTimeout(() => {
      setStatus('idle');
      setShowBooking(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setFormData({ name: '', whatsapp: '', serviceId: '' });
    }, 3000);
  };

  const navigateToAdmin = (e: any) => { e.preventDefault(); window.location.hash = '#admin'; };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-600 font-bold">Carregando...</div>;

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-200">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-pink-100 h-16 flex items-center justify-between px-4">
        <div className="text-xl font-extrabold text-pink-600 tracking-tight">{siteConfig.companyName}</div>
        <div className="flex items-center space-x-4">
          <button onClick={navigateToAdmin} className="text-pink-300 font-bold text-[10px] uppercase hover:text-pink-500 transition-colors">Admin</button>
          <button onClick={() => setShowBooking(true)} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold text-xs shadow-md shadow-pink-100 hover:bg-pink-600 transition-all">Agendar</button>
        </div>
      </header>

      <section className="bg-pink-50 py-20 text-center px-4 relative overflow-hidden">
        <h1 className="text-4xl md:text-6xl font-extrabold text-pink-900 mb-4 animate-fade-in">{siteConfig.heroTitle}</h1>
        <p className="text-pink-800/70 max-w-lg mx-auto mb-8 font-semibold leading-relaxed animate-fade-in" style={{animationDelay: '0.1s'}}>{siteConfig.heroSubtitle}</p>
        <button onClick={() => setShowBooking(true)} className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-pink-200 hover:bg-pink-700 transition-all transform hover:scale-105 active:scale-95 animate-fade-in" style={{animationDelay: '0.2s'}}>Agendar Agora</button>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"></div>
      </section>

      <section id="servicos" className="py-16 bg-white container mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-10 text-pink-900 tracking-tight">{siteConfig.servicesTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map(s => (
            <div key={s.id} className="p-6 border border-pink-50 rounded-2xl hover:bg-pink-50/50 transition-all group hover:shadow-lg hover:shadow-pink-50/50">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform">💅</div>
              <h3 className="font-bold text-pink-900 mb-2">{s.name}</h3>
              <p className="text-xs text-gray-500 font-semibold leading-tight">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t border-pink-100 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl font-extrabold text-pink-600 mb-4">{siteConfig.companyName}</h3>
              <p className="text-sm text-gray-500 font-semibold mb-4">{siteConfig.heroSubtitle.slice(0, 100)}...</p>
              <div className="flex space-x-4">
                <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" className="bg-pink-50 p-2 rounded-lg text-pink-500 hover:bg-pink-500 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.204l-.651 2.316 2.437-.639c.916.48 1.947.8 3.126.8 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.765-5.837-5.765zm3.374 8.203c-.147.414-.711.763-1.169.814-.426.049-.982.074-1.586-.123-2.403-.79-3.962-3.235-4.082-3.395-.12-.16-1.011-1.342-1.011-2.561 0-1.22.639-1.821.865-2.07.226-.249.491-.31.654-.31.164 0 .328.001.474.007.152.007.357-.058.558.423.201.481.688 1.677.749 1.798.061.121.101.261.02.422-.08.161-.121.261-.242.402-.12.141-.252.314-.36.421-.119.119-.244.249-.105.486.139.237.618 1.021 1.328 1.653.913.813 1.683 1.065 1.92 1.184.237.119.377.099.518-.041.141-.14.602-.701.763-.941.161-.241.322-.201.542-.121.22.08 1.391.657 1.632.777.241.121.402.181.462.281.06.1.06.579-.087.994z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-extrabold text-pink-900 mb-4">Contato & Localização</h4>
              <ul className="space-y-3 text-sm text-gray-600 font-semibold">
                <li className="flex items-start space-x-2">
                  <span className="text-pink-400">📍</span>
                  <span>{siteConfig.address}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">📱</span>
                  <span>{siteConfig.whatsappNumber}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-pink-900 mb-4">Informações Legais</h4>
              <p className="text-sm text-gray-500 mb-2">© {new Date().getFullYear()} {siteConfig.companyName}</p>
              <p className="text-xs text-gray-400">Desenvolvido por {siteConfig.footerName}</p>
              <p className="text-xs text-gray-400 mt-2">Profissional: {siteConfig.professionalName}</p>
            </div>
          </div>
        </div>
      </footer>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-10 relative">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setShowBooking(false)}
                className="flex items-center space-x-2 text-gray-400 hover:text-pink-600 transition-colors font-bold text-sm"
              >
                <span>←</span>
                <span>Voltar</span>
              </button>
              <button onClick={() => setShowBooking(false)} className="text-gray-300 hover:text-pink-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            {status === 'success' ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-pink-900">Agendamento Solicitado!</h3>
                <p className="text-gray-500 font-bold">Aguarde o contato de confirmação no WhatsApp.</p>
                <button onClick={() => setShowBooking(false)} className="mt-8 bg-pink-600 text-white px-8 py-3 rounded-xl font-bold">Fechar</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4 flex items-center space-x-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    <span>Escolha o Dia</span>
                  </h3>
                  <Calendar onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }} selectedDate={selectedDate} />
                </div>
                
                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4 flex items-center space-x-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    <span>Horário</span>
                  </h3>
                  {!selectedDate ? (
                    <p className="text-pink-300 text-sm font-bold italic p-4 bg-pink-50/50 rounded-2xl border border-dashed border-pink-100">Selecione um dia primeiro...</p>
                  ) : availableTimes.length === 0 ? (
                    <p className="text-red-400 text-sm font-bold p-4 bg-red-50 rounded-2xl border border-dashed border-red-100">Indisponível para este dia.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimes.map(t => (
                        <button 
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border shadow-sm ${selectedTime === t ? 'bg-pink-500 border-pink-500 text-white scale-105' : 'bg-white border-pink-100 text-pink-700 hover:bg-pink-50'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4 flex items-center space-x-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                    <span>Seus Dados</span>
                  </h3>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <input required placeholder="Seu Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none transition-all" />
                    <input required placeholder="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none transition-all" />
                    <select required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white">
                      <option value="">Qual procedimento?</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button 
                      disabled={!selectedTime || status === 'loading'}
                      className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all transform active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                    >
                      {status === 'loading' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </div>
                      ) : 'Confirmar Solicitação'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

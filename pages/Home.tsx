
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

  // Calcula horários disponíveis para o dia selecionado
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Verifica se o dia todo está bloqueado
    const isDayBlocked = blockedSlots.some(b => b.date === dateStr && !b.time);
    if (isDayBlocked) return [];

    return TIME_SLOTS.filter(time => {
      // Verifica se o horário específico está bloqueado pelo admin
      const isTimeBlocked = blockedSlots.some(b => b.date === dateStr && b.time === time);
      if (isTimeBlocked) return false;

      // Verifica se já existe um agendamento confirmado/pendente nesse horário
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
    
    // Combina data e hora
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
        <div className="text-xl font-extrabold text-pink-600 tracking-tight">{siteConfig.professionalName}</div>
        <div className="flex items-center space-x-4">
          <button onClick={navigateToAdmin} className="text-pink-300 font-bold text-[10px] uppercase">Admin</button>
          <button onClick={() => setShowBooking(true)} className="bg-pink-500 text-white px-6 py-2 rounded-full font-bold text-xs">Agendar</button>
        </div>
      </header>

      <section className="bg-pink-50 py-20 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-pink-900 mb-4">{siteConfig.heroTitle}</h1>
        <p className="text-pink-800/70 max-w-lg mx-auto mb-8 font-semibold">{siteConfig.heroSubtitle}</p>
        <button onClick={() => setShowBooking(true)} className="bg-pink-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-pink-200">Agendar Agora</button>
      </section>

      <section id="servicos" className="py-16 bg-white container mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-10 text-pink-900">{siteConfig.servicesTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map(s => (
            <div key={s.id} className="p-6 border border-pink-50 rounded-2xl hover:bg-pink-50/50 transition-all">
              <h3 className="font-bold text-pink-900 mb-2">{s.name}</h3>
              <p className="text-xs text-gray-500 font-semibold">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 md:p-10 relative">
            <button onClick={() => setShowBooking(false)} className="absolute top-6 right-6 text-gray-400">✖</button>
            
            {status === 'success' ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-pink-900">Agendamento Solicitado!</h3>
                <p className="text-gray-500 font-bold">Aguarde o contato de confirmação no WhatsApp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4">1. Escolha o Dia</h3>
                  <Calendar onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }} selectedDate={selectedDate} />
                </div>
                
                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4">2. Horário</h3>
                  {!selectedDate ? (
                    <p className="text-pink-300 text-sm font-bold italic">Selecione um dia primeiro...</p>
                  ) : availableTimes.length === 0 ? (
                    <p className="text-red-400 text-sm font-bold">Indisponível para este dia.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimes.map(t => (
                        <button 
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border ${selectedTime === t ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-pink-100 text-pink-700 hover:bg-pink-50'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-pink-900 mb-4">3. Seus Dados</h3>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <input required placeholder="Seu Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm" />
                    <input required placeholder="WhatsApp" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm" />
                    <select required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} className="w-full p-3 rounded-xl border border-pink-100 font-bold text-sm">
                      <option value="">Qual procedimento?</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button 
                      disabled={!selectedTime || status === 'loading'}
                      className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold shadow-lg disabled:bg-gray-200"
                    >
                      {status === 'loading' ? 'Enviando...' : 'Confirmar Solicitação'}
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


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar } from '../components/Calendar';

export const Home: React.FC = () => {
  const { services, siteConfig, addAppointment } = useApp();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    serviceId: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.name || !formData.whatsapp || !formData.serviceId) return;

    addAppointment({
      clientName: formData.name,
      clientWhatsapp: formData.whatsapp,
      serviceId: formData.serviceId,
      date: selectedDate.toISOString()
    });
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowBooking(false);
      setSelectedDate(null);
      setFormData({ name: '', whatsapp: '', serviceId: '' });
    }, 3000);
  };

  const navigateToAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '#admin';
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-200">
      {/* Header - Compacto e funcional */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-pink-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            {siteConfig.logoUrl ? (
              <img src={siteConfig.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="text-xl font-extrabold text-pink-600 tracking-tight">{siteConfig.professionalName}</div>
            )}
          </div>
          
          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6 font-bold text-gray-600">
            <a href="#servicos" className="hover:text-pink-500 transition-colors uppercase text-[10px] tracking-widest">Serviços</a>
            <a href="#contato" className="hover:text-pink-500 transition-colors uppercase text-[10px] tracking-widest">Contato</a>
            <div className="flex items-center space-x-2 pl-4 border-l border-pink-50">
              <button 
                onClick={navigateToAdmin}
                className="text-pink-300 hover:text-pink-500 transition-all font-bold text-[10px] uppercase tracking-widest px-4 py-2"
              >
                Admin
              </button>
              <button 
                onClick={() => setShowBooking(true)}
                className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-all shadow-md shadow-pink-100 font-bold text-xs"
              >
                Agendar
              </button>
            </div>
          </nav>

          {/* Navegação Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={navigateToAdmin}
              className="text-pink-300 font-bold text-[10px] uppercase tracking-widest px-2"
            >
              Admin
            </button>
            <button 
              onClick={() => setShowBooking(true)}
              className="bg-pink-500 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md"
            >
              Agendar
            </button>
          </div>
        </div>
      </header>

      {/* Hero - Reduzido para Mobile First */}
      <section className="bg-gradient-to-b from-pink-100 to-pink-50 py-10 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <h1 className="text-3xl md:text-6xl font-extrabold mb-4 text-pink-900 leading-tight tracking-tighter">
            {siteConfig.heroTitle}
          </h1>
          <p className="text-sm md:text-xl text-pink-800/70 max-w-md mb-6 font-semibold leading-relaxed">
            {siteConfig.heroSubtitle}
          </p>
          <button 
            onClick={() => setShowBooking(true)}
            className="bg-pink-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl shadow-pink-200 hover:bg-pink-700 transition-all transform active:scale-95"
          >
            Começar Agendamento
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/40 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200/40 rounded-full -ml-32 -mb-32 blur-[80px]"></div>
      </section>

      {/* Services - Compactado significativamente */}
      <section id="servicos" className="py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-6 text-pink-900 tracking-tight">{siteConfig.servicesTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {services.map(service => (
              <div key={service.id} className="p-4 md:p-6 border border-pink-50 rounded-2xl hover:shadow-lg transition-all group bg-white flex flex-col items-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-pink-100 transition-all transform group-hover:rotate-6">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-sm md:text-lg font-bold mb-1 text-pink-900 tracking-tight">{service.name}</h3>
                <p className="text-[10px] md:text-sm text-gray-500 leading-tight font-semibold line-clamp-2">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact - Minimalista */}
      <section id="contato" className="py-8 bg-pink-50/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold mb-6 text-pink-900 tracking-tight">{siteConfig.contactTitle}</h2>
          <div className="max-w-sm mx-auto space-y-3 bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
            <div className="flex items-center justify-center space-x-2 text-sm font-bold text-pink-800">
              <span>📍</span>
              <span>{siteConfig.address}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm font-bold text-pink-800">
              <span>📞</span>
              <span>{siteConfig.whatsappNumber}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Compacto */}
      <footer className="bg-white border-t border-pink-100 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-pink-900 font-extrabold text-lg mb-1 tracking-tight">Desenvolvido por {siteConfig.footerName}</p>
          <p className="text-gray-400 text-[10px] mb-0 font-bold">Criação de sites: 📞 {siteConfig.footerContact}</p>
        </div>
      </footer>

      {/* Booking Modal - Mobile Responsive */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-pink-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setShowBooking(false)}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-pink-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="p-6 md:p-10">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-pink-900 mb-2">Enviado com sucesso!</h3>
                  <p className="text-gray-500 text-sm font-semibold">Aguarde o contato no WhatsApp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-pink-900 mb-4 tracking-tight text-center md:text-left">Selecione o Dia</h3>
                    <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-pink-900 mb-4 tracking-tight text-center md:text-left">Seus Dados</h3>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-pink-300 uppercase tracking-widest ml-1">Nome</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-pink-50 bg-pink-50/20 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-sm"
                          placeholder="Ex: Maria Silva"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-pink-300 uppercase tracking-widest ml-1">WhatsApp</label>
                        <input 
                          required
                          type="tel" 
                          value={formData.whatsapp}
                          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-pink-50 bg-pink-50/20 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-sm"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-pink-300 uppercase tracking-widest ml-1">Serviço</label>
                        <select 
                          required
                          value={formData.serviceId}
                          onChange={e => setFormData({...formData, serviceId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-pink-50 bg-pink-50/20 focus:bg-white focus:ring-4 focus:ring-pink-100 outline-none appearance-none font-bold text-sm cursor-pointer"
                        >
                          <option value="">Selecione...</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-2">
                        <button 
                          type="submit"
                          disabled={!selectedDate}
                          className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all transform active:scale-95 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                        >
                          Agendar Agora
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp - Reduzido */}
      <a 
        href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412 0 6.556-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.132c1.524.905 3.384 1.445 5.41 1.446 5.404 0 9.803-4.398 9.803-9.802 0-2.618-1.02-5.078-2.871-6.928-1.851-1.85-4.311-2.87-6.928-2.87-5.405 0-9.803 4.398-9.803 9.802 0 2.03.626 3.968 1.811 5.591l-.991 3.619 3.769-.988zm11.523-6.833c-.301-.151-1.781-.878-2.057-.978-.275-.1-.476-.151-.675.151-.199.302-.771.978-.946 1.178-.175.201-.35.226-.651.075-.301-.151-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.675-2.086-.175-.302-.018-.465.132-.615.136-.134.301-.351.451-.527.149-.176.199-.301.3-.502.1-.201.05-.377-.025-.527-.075-.151-.675-1.631-.925-2.235-.243-.587-.491-.507-.675-.516-.174-.008-.375-.01-.576-.01-.201 0-.527.075-.802.377-.275.301-1.053 1.029-1.053 2.511 0 1.481 1.078 2.912 1.228 3.113.15.201 2.122 3.241 5.14 4.542.717.31 1.277.495 1.713.633.72.229 1.375.196 1.893.118.577-.087 1.781-.728 2.031-1.43.25-.702.25-1.305.175-1.43-.075-.126-.275-.201-.576-.352z" />
        </svg>
      </a>
    </div>
  );
};

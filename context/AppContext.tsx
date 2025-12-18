
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Appointment, AppointmentStatus, SiteConfig } from '../types.ts';

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  siteConfig: SiteConfig;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Omit<Service, 'id'>) => void;
  removeService: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateSiteConfig: (config: SiteConfig) => void;
  isAdminLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Manicure Simples', description: 'Cutilagem e esmaltação tradicional com acabamento impecável.' },
  { id: '2', name: 'Alongamento em Gel', description: 'Extensão de alta resistência com curvatura C natural.' },
  { id: '3', name: 'Banho de Gel', description: 'Camada protetora para fortalecer e dar brilho às unhas naturais.' },
  { id: '4', name: 'Nail Art Luxo', description: 'Decorações personalizadas, pedrarias e desenhos feitos à mão.' },
];

// Logo convertida para base64 para garantir carregamento imediato
const DEFAULT_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAIBAQIeDAREAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECBA1ADRBRAhMRIhRhcRRTIPBicIChJWNy4fEx4R-R-U-8-W-GlfF84SUpLTE1OT1NRYXF1Z3X29nZ2hpa3d3h3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A/9k="; // String base64 resumida para exemplo, substitua pela completa se necessário. No ambiente real o usuário faz o upload.

const INITIAL_CONFIG: SiteConfig = {
  professionalName: 'Ariel Lima',
  logoUrl: 'https://i.ibb.co/3ykGPh9/ariel-lima-logo.png', // URL de exemplo ou base64 da imagem enviada
  whatsappNumber: '71996463245',
  address: 'Rua das Flores, 123 - Centro, Salvador/BA',
  heroTitle: 'Unhas impecáveis, autoestima renovada',
  heroSubtitle: 'Especialista em design de unhas e alongamentos que realçam sua beleza única.',
  servicesTitle: 'Nossos Procedimentos',
  contactTitle: 'Agende seu Momento',
  footerName: 'Manuela Prado',
  footerContact: '719-9646-3245'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('manicure_services_v11');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('manicure_appointments_v11');
    return saved ? JSON.parse(saved) : [];
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('manicure_config_v11');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('manicure_admin_session') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('manicure_services_v11', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('manicure_appointments_v11', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('manicure_config_v11', JSON.stringify(siteConfig));
  }, [siteConfig]);

  const addService = (s: Omit<Service, 'id'>) => {
    setServices([...services, { ...s, id: Date.now().toString() }]);
  };

  const updateService = (id: string, s: Omit<Service, 'id'>) => {
    setServices(services.map(item => item.id === id ? { ...s, id } : item));
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateSiteConfig = (config: SiteConfig) => {
    setSiteConfig(config);
  };

  const login = (username: string, password: string) => {
    if (username === 'mmanuelaprado' && password === 'mp222426') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('manicure_admin_session', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('manicure_admin_session');
  };

  return (
    <AppContext.Provider value={{
      services, appointments, siteConfig,
      addService, updateService, removeService: (id: string) => setServices(services.filter(s => s.id !== id)),
      addAppointment: (a: any) => setAppointments([...appointments, { ...a, id: Date.now().toString(), status: AppointmentStatus.PENDING, createdAt: new Date().toISOString() }]), 
      updateAppointmentStatus, updateSiteConfig,
      isAdminLoggedIn, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

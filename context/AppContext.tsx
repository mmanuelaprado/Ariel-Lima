
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Appointment, AppointmentStatus, SiteConfig } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  siteConfig: SiteConfig;
  isLoading: boolean;
  dbError: string | null;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Omit<Service, 'id'>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  updateSiteConfig: (config: SiteConfig) => Promise<void>;
  isAdminLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Manicure Simples', description: 'Cutilagem e esmaltação com acabamento fino e duradouro.' },
  { id: '2', name: 'Alongamento em Gel', description: 'Técnica de extensão com naturalidade e resistência extrema.' },
  { id: '3', name: 'Banho de Gel', description: 'Fortalecimento das unhas naturais com brilho espelhado.' },
  { id: '4', name: 'Nail Art Exclusiva', description: 'Decorações feitas à mão para um visual único.' },
];

const INITIAL_CONFIG: SiteConfig = {
  professionalName: 'Ariel Lima',
  logoUrl: 'https://i.ibb.co/3ykGPh9/ariel-lima-logo.png',
  whatsappNumber: '71996463245',
  address: 'Atendimento em Salvador/BA',
  heroTitle: 'Unhas impecáveis, autoestima renovada',
  heroSubtitle: 'Especialista em design de unhas e alongamentos que realçam sua beleza única através de técnicas modernas e seguras.',
  servicesTitle: 'Meus Procedimentos',
  contactTitle: 'Agende seu Momento',
  footerName: 'Manuela Prado',
  footerContact: '719-9646-3245'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Carregamento rápido do LocalStorage
      const localServices = localStorage.getItem('nails_services');
      const localConfig = localStorage.getItem('nails_config');
      const localAppointments = localStorage.getItem('nails_appointments');

      if (localServices) setServices(JSON.parse(localServices));
      if (localConfig) setSiteConfig(JSON.parse(localConfig));
      if (localAppointments) setAppointments(JSON.parse(localAppointments));

      // 2. Sincronização com Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('title, content, image, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const configPost = data.find(p => p.title === 'SYSTEM_CONFIG');
        const servicesPost = data.find(p => p.title === 'SYSTEM_SERVICES');
        const appointmentsPost = data.find(p => p.title === 'SYSTEM_APPOINTMENTS');

        if (configPost) {
          setSiteConfig(JSON.parse(configPost.content));
          localStorage.setItem('nails_config', configPost.content);
        }
        if (servicesPost) {
          setServices(JSON.parse(servicesPost.content));
          localStorage.setItem('nails_services', servicesPost.content);
        }
        if (appointmentsPost) {
          setAppointments(JSON.parse(appointmentsPost.content));
          localStorage.setItem('nails_appointments', appointmentsPost.content);
        }
      }
      setDbError(null);
    } catch (err: any) {
      console.warn('Modo Offline/RLS:', err.message);
      setDbError(err.message === 'Failed to fetch' ? 'Erro de conexão' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveToSupabase = async (type: 'CONFIG' | 'SERVICES' | 'APPOINTMENTS', content: any) => {
    const title = `SYSTEM_${type}`;
    const jsonContent = JSON.stringify(content);
    const imageUrl = type === 'CONFIG' ? (content as SiteConfig).logoUrl : '';
    
    localStorage.setItem(`nails_${type.toLowerCase()}`, jsonContent);

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ 
          title, 
          content: jsonContent,
          image: imageUrl || '' 
        }]);

      if (error) {
        if (error.message.includes('row-level security')) {
          setDbError('RLS_ERROR');
        } else {
          setDbError(error.message);
        }
      } else {
        setDbError(null);
      }
    } catch (err) {
      console.error('Network error during save');
    }
  };

  const addService = async (s: Omit<Service, 'id'>) => {
    const newServices = [...services, { ...s, id: Date.now().toString() }];
    setServices(newServices);
    await saveToSupabase('SERVICES', newServices);
  };

  const updateService = async (id: string, s: Omit<Service, 'id'>) => {
    const newServices = services.map(item => item.id === id ? { ...s, id } : item);
    setServices(newServices);
    await saveToSupabase('SERVICES', newServices);
  };

  const removeService = async (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    setServices(newServices);
    await saveToSupabase('SERVICES', newServices);
  };

  const addAppointment = async (a: any) => {
    const newAppointments = [...appointments, { 
      ...a, 
      id: Date.now().toString(), 
      status: AppointmentStatus.PENDING, 
      createdAt: new Date().toISOString() 
    }];
    setAppointments(newAppointments);
    await saveToSupabase('APPOINTMENTS', newAppointments);
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const newAppointments = appointments.map(a => a.id === id ? { ...a, status } : a);
    setAppointments(newAppointments);
    await saveToSupabase('APPOINTMENTS', newAppointments);
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    setSiteConfig(config);
    await saveToSupabase('CONFIG', config);
  };

  const login = (username: string, password: string) => {
    if (username === 'mmanuelaprado' && password === 'mp222426') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdminLoggedIn(false);

  return (
    <AppContext.Provider value={{
      services, appointments, siteConfig, isLoading, dbError,
      addService, updateService, removeService,
      addAppointment, updateAppointmentStatus, updateSiteConfig,
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

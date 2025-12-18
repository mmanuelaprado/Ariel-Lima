
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Service, Appointment, AppointmentStatus, SiteConfig } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  siteConfig: SiteConfig;
  isLoading: boolean;
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

// Mapeamento de IDs do banco para evitar duplicidade
const recordIds = {
  config: null as string | null,
  services: null as string | null,
  appointments: null as string | null,
};

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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Carregar dados do Supabase ignorando cache
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, image, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Filtra os registros mais recentes de cada tipo
        const configPost = data.find(p => p.title === 'SYSTEM_CONFIG');
        const servicesPost = data.find(p => p.title === 'SYSTEM_SERVICES');
        const appointmentsPost = data.find(p => p.title === 'SYSTEM_APPOINTMENTS');

        if (configPost) {
          recordIds.config = configPost.id;
          setSiteConfig(JSON.parse(configPost.content));
        }
        if (servicesPost) {
          recordIds.services = servicesPost.id;
          setServices(JSON.parse(servicesPost.content));
        }
        if (appointmentsPost) {
          recordIds.appointments = appointmentsPost.id;
          setAppointments(JSON.parse(appointmentsPost.content));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar no Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica robusta de Salvamento (Update se existir ID, senão Insert)
  const saveToSupabase = async (type: 'config' | 'services' | 'appointments', content: any, image: string = '') => {
    const title = `SYSTEM_${type.toUpperCase()}`;
    const id = recordIds[type];
    const payload = {
      title,
      content: JSON.stringify(content),
      image,
    };

    try {
      if (id) {
        // Tenta atualizar o registro existente
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Se não tem ID mapeado, cria um novo e armazena o ID retornado
        const { data, error } = await supabase
          .from('posts')
          .insert([payload])
          .select();
        if (error) throw error;
        if (data && data[0]) recordIds[type] = data[0].id;
      }
    } catch (err) {
      console.error(`Erro crítico ao salvar ${title}:`, err);
      // Fallback: tenta inserir se o update falhar por algum motivo
      await supabase.from('posts').insert([payload]);
    }
  };

  const addService = async (s: Omit<Service, 'id'>) => {
    const newServices = [...services, { ...s, id: Date.now().toString() }];
    setServices(newServices);
    await saveToSupabase('services', newServices);
  };

  const updateService = async (id: string, s: Omit<Service, 'id'>) => {
    const newServices = services.map(item => item.id === id ? { ...s, id } : item);
    setServices(newServices);
    await saveToSupabase('services', newServices);
  };

  const removeService = async (id: string) => {
    const newServices = services.filter(s => s.id !== id);
    setServices(newServices);
    await saveToSupabase('services', newServices);
  };

  const addAppointment = async (a: any) => {
    const newAppointments = [...appointments, { 
      ...a, 
      id: Date.now().toString(), 
      status: AppointmentStatus.PENDING, 
      createdAt: new Date().toISOString() 
    }];
    setAppointments(newAppointments);
    await saveToSupabase('appointments', newAppointments);
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const newAppointments = appointments.map(a => a.id === id ? { ...a, status } : a);
    setAppointments(newAppointments);
    await saveToSupabase('appointments', newAppointments);
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    setSiteConfig(config);
    await saveToSupabase('config', config, config.logoUrl);
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
      services, appointments, siteConfig, isLoading,
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


import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Appointment, AppointmentStatus, SiteConfig, BlockedSlot } from '../types.ts';
import { supabase } from '../lib/supabase.ts';

interface AppContextType {
  services: Service[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  siteConfig: SiteConfig;
  isLoading: boolean;
  dbError: string | null;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Omit<Service, 'id'>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  updateSiteConfig: (config: SiteConfig) => Promise<void>;
  toggleBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => Promise<void>;
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
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('title, content')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const configPost = data.find(p => p.title === 'SYSTEM_CONFIG');
        const servicesPost = data.find(p => p.title === 'SYSTEM_SERVICES');
        const appointmentsPost = data.find(p => p.title === 'SYSTEM_APPOINTMENTS');
        const blockedPost = data.find(p => p.title === 'SYSTEM_BLOCKED');

        if (configPost) setSiteConfig(JSON.parse(configPost.content));
        if (servicesPost) setServices(JSON.parse(servicesPost.content));
        if (appointmentsPost) setAppointments(JSON.parse(appointmentsPost.content));
        if (blockedPost) setBlockedSlots(JSON.parse(blockedPost.content));
      }
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveToSupabase = async (type: string, content: any) => {
    await supabase.from('posts').insert([{ title: `SYSTEM_${type}`, content: JSON.stringify(content) }]);
  };

  const addService = async (s: any) => {
    const next = [...services, { ...s, id: Date.now().toString() }];
    setServices(next);
    await saveToSupabase('SERVICES', next);
  };

  const updateService = async (id: string, s: any) => {
    const next = services.map(x => x.id === id ? { ...s, id } : x);
    setServices(next);
    await saveToSupabase('SERVICES', next);
  };

  const removeService = async (id: string) => {
    const next = services.filter(x => x.id !== id);
    setServices(next);
    await saveToSupabase('SERVICES', next);
  };

  const addAppointment = async (a: any) => {
    const next = [...appointments, { ...a, id: Date.now().toString(), status: AppointmentStatus.PENDING, createdAt: new Date().toISOString() }];
    setAppointments(next);
    await saveToSupabase('APPOINTMENTS', next);
    return true;
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    const next = appointments.map(a => a.id === id ? { ...a, status } : a);
    setAppointments(next);
    await saveToSupabase('APPOINTMENTS', next);
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    setSiteConfig(config);
    await saveToSupabase('CONFIG', config);
  };

  const toggleBlockedSlot = async (slot: Omit<BlockedSlot, 'id'>) => {
    let next;
    const exists = blockedSlots.find(b => b.date === slot.date && b.time === slot.time);
    if (exists) {
      next = blockedSlots.filter(b => b.id !== exists.id);
    } else {
      next = [...blockedSlots, { ...slot, id: Date.now().toString() }];
    }
    setBlockedSlots(next);
    await saveToSupabase('BLOCKED', next);
  };

  const login = (u: string, p: string) => {
    if (u === 'mmanuelaprado' && p === 'mp222426') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      services, appointments, blockedSlots, siteConfig, isLoading, dbError,
      addService, updateService, removeService, addAppointment, updateAppointmentStatus,
      updateSiteConfig, toggleBlockedSlot, isAdminLoggedIn, login, logout: () => setIsAdminLoggedIn(false)
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

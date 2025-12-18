
export enum AppointmentStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  CANCELLED = 'Cancelado'
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientWhatsapp: string;
  serviceId: string;
  date: string; // ISO format
  status: AppointmentStatus;
  createdAt: string;
}

export interface SiteConfig {
  professionalName: string;
  logoUrl: string;
  whatsappNumber: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  servicesTitle: string;
  contactTitle: string;
  footerName: string;
  footerContact: string;
}

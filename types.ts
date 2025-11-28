export enum UserRole {
  OWNER = 'OWNER',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST',
}

export enum AppointmentStatus {
  SCHEDULED = 'Agendado',
  CONFIRMED = 'Confirmado',
  ARRIVED = 'Chegou',
  COMPLETED = 'Finalizado',
  NO_SHOW = 'No-Show',
  CANCELLED = 'Cancelado',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  professionalId?: string; // If the user is a professional, link to their profile ID
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  birthDate?: string; // YYYY-MM-DD
  allergies?: string;
  colorFormula?: string;
  notes?: string;
  tags: string[];
  lastVisit?: string;
  totalSpent: number;
  loyaltyPoints: number;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Professional {
  id: string;
  name: string;
  photoUrl: string;
  color: string; // Hex color for calendar
  specialties: string[]; // Service IDs
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceIds: string[];
  dateTime: string; // ISO String
  status: AppointmentStatus;
  totalValue: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  value: number;
  description: string;
  category: string;
}

export interface SalonSettings {
  salonName: string;
  phone: string;
  address: string;
  logoUrl: string;
  loyaltyEnabled: boolean;
  pointsPerCurrency: number; // e.g., 1 point per 10 BRL
  loyaltyRewardDescription: string;
  bookingLinkSlug: string;
}
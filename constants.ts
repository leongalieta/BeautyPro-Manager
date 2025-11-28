import { Appointment, AppointmentStatus, Client, Professional, Service, Transaction, UserRole, SalonSettings, User } from "./types";

export const MOCK_PROFESSIONALS: Professional[] = [
  { id: 'p1', name: 'Ana Silva', photoUrl: 'https://picsum.photos/100/100?random=1', color: '#fecdd3', specialties: ['s1', 's2', 's3'] },
  { id: 'p2', name: 'Carlos Oliveira', photoUrl: 'https://picsum.photos/100/100?random=2', color: '#bfdbfe', specialties: ['s4', 's5'] },
  { id: 'p3', name: 'Fernanda Lima', photoUrl: 'https://picsum.photos/100/100?random=3', color: '#e9d5ff', specialties: ['s1', 's2', 's6'] },
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Roberto Dono', 
    email: 'admin@beautypro.com', 
    role: UserRole.OWNER,
    photoUrl: 'https://i.pravatar.cc/150?u=admin'
  },
  { 
    id: 'u2', 
    name: 'Ana Silva', 
    email: 'ana@beautypro.com', 
    role: UserRole.PROFESSIONAL, 
    professionalId: 'p1', // Linked to Ana Silva professional profile
    photoUrl: 'https://picsum.photos/100/100?random=1'
  },
  { 
    id: 'u3', 
    name: 'Júlia Recepção', 
    email: 'recepcao@beautypro.com', 
    role: UserRole.RECEPTIONIST,
    photoUrl: 'https://i.pravatar.cc/150?u=recep'
  }
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Corte Feminino', price: 120, durationMinutes: 60, category: 'Cabelo', description: 'Lavagem, corte e finalização.', status: 'ACTIVE' },
  { id: 's2', name: 'Coloração', price: 250, durationMinutes: 120, category: 'Cabelo', description: 'Coloração global com produtos premium.', status: 'ACTIVE' },
  { id: 's3', name: 'Hidratação Profunda', price: 90, durationMinutes: 45, category: 'Cabelo', status: 'ACTIVE' },
  { id: 's4', name: 'Barba Completa', price: 50, durationMinutes: 30, category: 'Barbearia', status: 'ACTIVE' },
  { id: 's5', name: 'Corte Masculino', price: 60, durationMinutes: 45, category: 'Barbearia', status: 'ACTIVE' },
  { id: 's6', name: 'Manicure', price: 40, durationMinutes: 45, category: 'Unhas', status: 'ACTIVE' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Mariana Souza', phone: '11999999999', email: 'mari@email.com', tags: ['VIP', 'Coloração'], totalSpent: 1500, loyaltyPoints: 120, lastVisit: '2023-10-15', photoUrl: 'https://picsum.photos/200?random=10', birthDate: '1990-10-28' },
  { id: 'c2', name: 'João Pereira', phone: '11988888888', tags: ['Novo'], totalSpent: 60, loyaltyPoints: 10, lastVisit: '2023-08-20' },
  { id: 'c3', name: 'Camila Santos', phone: '11977777777', tags: ['Frequente'], totalSpent: 3200, loyaltyPoints: 450, lastVisit: '2023-10-25', photoUrl: 'https://picsum.photos/200?random=11', birthDate: '1995-05-15' },
];

// Generate some appointments for "Today" and "Tomorrow"
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    professionalId: 'p1', // Ana
    serviceIds: ['s1'],
    dateTime: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    totalValue: 120,
  },
  {
    id: 'a2',
    clientId: 'c3',
    professionalId: 'p1', // Ana
    serviceIds: ['s2'],
    dateTime: new Date(today.setHours(13, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    totalValue: 250,
  },
  {
    id: 'a3',
    clientId: 'c2',
    professionalId: 'p2', // Carlos
    serviceIds: ['s5'],
    dateTime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.COMPLETED,
    totalValue: 60,
  },
  {
    id: 'a4',
    clientId: 'c3',
    professionalId: 'p3', // Fernanda
    serviceIds: ['s6'], // Manicure
    dateTime: new Date(today.setHours(11, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    totalValue: 40,
  },
  {
    id: 'a5',
    clientId: 'c1',
    professionalId: 'p2', // Carlos
    serviceIds: ['s4'], // Barba (Example scenario where client gets multiple services)
    dateTime: new Date(today.setHours(15, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    totalValue: 50,
  },
  {
    id: 'a6',
    clientId: 'c2',
    professionalId: 'p3', // Fernanda
    serviceIds: ['s3'], // Hidratação
    dateTime: new Date(today.setHours(16, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    totalValue: 90,
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date().toISOString(), type: 'INCOME', value: 120, description: 'Corte - Mariana Souza', category: 'Serviços' },
  { id: 't2', date: new Date().toISOString(), type: 'EXPENSE', value: 500, description: 'Compra de Produtos', category: 'Estoque' },
  { id: 't3', date: new Date().toISOString(), type: 'INCOME', value: 60, description: 'Corte - João Pereira', category: 'Serviços' },
];

export const DEFAULT_SETTINGS: SalonSettings = {
  salonName: 'BeautyPro Demo Salon',
  phone: '11999990000',
  address: 'Rua das Flores, 123 - São Paulo, SP',
  logoUrl: '',
  loyaltyEnabled: true,
  pointsPerCurrency: 1, // 1 point per 1 Real
  loyaltyRewardDescription: 'A cada 100 pontos, ganhe R$ 10 de desconto.',
  bookingLinkSlug: 'beautypro-demo',
};
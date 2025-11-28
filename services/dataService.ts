import { useState, useEffect, useCallback } from 'react';
import { 
  MOCK_APPOINTMENTS, 
  MOCK_CLIENTS, 
  MOCK_PROFESSIONALS, 
  MOCK_SERVICES, 
  MOCK_TRANSACTIONS,
  DEFAULT_SETTINGS,
  MOCK_USERS
} from '../constants';
import { Appointment, Client, Professional, Service, Transaction, AppointmentStatus, SalonSettings, User } from '../types';

// Simple in-memory store for MVP simulation
export const useDataService = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [settings, setSettings] = useState<SalonSettings>(DEFAULT_SETTINGS);

  // --- AUTH ---
  const login = (email: string) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- PROFESSIONAL ---
  const addProfessional = (pro: Omit<Professional, 'id'>) => {
    const newPro: Professional = {
      ...pro,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProfessionals([...professionals, newPro]);
  };

  const updateProfessional = (id: string, updatedPro: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...updatedPro } : p));
  };

  const removeProfessional = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  // --- APPOINTMENTS ---
  const addAppointment = (appt: Omit<Appointment, 'id' | 'status' | 'totalValue'>) => {
    // Calculate total value
    const total = appt.serviceIds.reduce((sum, sId) => {
      const service = services.find(s => s.id === sId);
      return sum + (service ? service.price : 0);
    }, 0);

    const newAppt: Appointment = {
      ...appt,
      id: Math.random().toString(36).substr(2, 9),
      status: AppointmentStatus.SCHEDULED,
      totalValue: total,
    };
    setAppointments([...appointments, newAppt]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    
    // If completed, add transaction
    if (status === AppointmentStatus.COMPLETED) {
      const appt = appointments.find(a => a.id === id);
      if (appt) {
        const client = clients.find(c => c.id === appt.clientId);
        addTransaction({
          type: 'INCOME',
          value: appt.totalValue,
          description: `Serviço - ${client?.name || 'Cliente'}`,
          category: 'Serviços'
        });
        
        // Update client stats
        if (client) {
            updateClientStats(client.id, appt.totalValue);
        }
      }
    }
  };

  // --- CLIENTS ---
  const addClient = (client: Omit<Client, 'id' | 'loyaltyPoints' | 'totalSpent' | 'tags'>) => {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      loyaltyPoints: 0,
      totalSpent: 0,
      tags: ['Novo']
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };
  
  const updateClientStats = (clientId: string, amount: number) => {
      setClients(prev => prev.map(c => {
          if (c.id === clientId) {
              return {
                  ...c,
                  totalSpent: c.totalSpent + amount,
                  loyaltyPoints: c.loyaltyPoints + Math.floor(amount / (settings.pointsPerCurrency > 0 ? (10 / settings.pointsPerCurrency) : 10)), 
                  lastVisit: new Date().toISOString().split('T')[0]
              }
          }
          return c;
      }))
  }

  // --- SERVICES ---
  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: Math.random().toString(36).substr(2, 9),
      status: service.status || 'ACTIVE'
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, updatedService: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedService } : s));
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // --- TRANSACTIONS ---
  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    const newT: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setTransactions([...transactions, newT]);
  };

  // --- SETTINGS ---
  const updateSettings = (newSettings: Partial<SalonSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    currentUser,
    login,
    logout,
    appointments,
    clients,
    services,
    professionals,
    transactions,
    settings,
    addAppointment,
    updateAppointmentStatus,
    addClient,
    updateClient,
    removeClient,
    addTransaction,
    addService,
    updateService,
    removeService,
    updateSettings,
    addProfessional,
    updateProfessional,
    removeProfessional
  };
};
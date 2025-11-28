import React, { useState, useMemo, useEffect } from 'react';
import { AdminSidebar, MobileHeader } from './components/Layout';
import { useDataService } from './services/dataService';
import { Card, Button, Badge, Input, Select, TextArea, Switch, Label } from './components/ui';
import { formatCurrency, formatDate, formatTime, generateWhatsAppLink, getServiceNames } from './utils';
import { AppointmentStatus, Client, Service, Professional, SalonSettings, UserRole, User, Appointment, Transaction } from './types';
import { MOCK_USERS } from './constants';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  User as UserIcon, 
  MapPin,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Settings,
  Trash2,
  Edit,
  Tag,
  X,
  Filter,
  Megaphone,
  Gift,
  Share2,
  Save,
  Copy,
  Briefcase,
  Lock,
  ExternalLink,
  DollarSign,
  Phone,
  Mail,
  Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- CONSTANTS ---
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'
];

// --- AUTH VIEW ---

const LoginView = ({ onLogin }: { onLogin: (email: string) => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
           </div>
           <h1 className="text-2xl font-bold text-gray-900">BeautyPro Manager</h1>
           <p className="text-gray-500 mt-2">Selecione um usuário para entrar (Demo)</p>
        </div>

        <div className="space-y-4">
           {MOCK_USERS.map(user => (
             <button
                key={user.id}
                onClick={() => onLogin(user.email)}
                className="w-full flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group text-left"
             >
                <img src={user.photoUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                   <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">{user.name}</h3>
                   <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 group-hover:bg-primary-200 group-hover:text-primary-800">
                      {user.role === UserRole.OWNER ? 'Dono(a)' : user.role === UserRole.PROFESSIONAL ? 'Profissional' : 'Recepção'}
                   </span>
                </div>
                <ChevronRight className="ml-auto text-gray-400 group-hover:text-primary-500" />
             </button>
           ))}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400">
           Versão MVP 1.0.0
        </div>
      </Card>
    </div>
  );
};

// --- APP VIEWS ---

// 1. Dashboard View
const DashboardView = ({ 
  appointments, 
  transactions, 
  user,
  clients,
  services
}: { 
  appointments: Appointment[], 
  transactions: Transaction[], 
  user: User,
  clients: Client[],
  services: Service[]
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.dateTime.startsWith(today));
  
  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
  
  // Logic: Only Owner sees full financials
  const showFinancials = user.role === UserRole.OWNER;

  const stats: { label: string; value: string | number; icon: any; color: string; bg: string }[] = [
    { label: 'Agendamentos Hoje', value: todaysAppointments.length, icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  if (showFinancials) {
      stats.push(
        { label: 'Faturamento Total', value: formatCurrency(income), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Despesas', value: formatCurrency(expense), icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' }
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name.split(' ')[0]} 👋</h1>
         <Badge>{user.role}</Badge>
      </div>
      
      <div className={`grid grid-cols-1 ${showFinancials ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Agendamentos</h2>
          <div className="space-y-4">
            {todaysAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum agendamento para hoje.</p>
            ) : (
                todaysAppointments.slice(0, 5).map(appt => {
                  const client = clients.find(c => c.id === appt.clientId);
                  const serviceNames = getServiceNames(appt.serviceIds, services);
                  
                  return (
                    <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3">
                            {formatTime(appt.dateTime)}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{client?.name || 'Cliente Desconhecido'}</p>
                            <p className="text-sm text-gray-500">{serviceNames}</p>
                        </div>
                        </div>
                        <Badge color={
                            appt.status === AppointmentStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                            appt.status === AppointmentStatus.COMPLETED ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                         }>
                            {appt.status}
                         </Badge>
                    </div>
                  );
                })
            )}
          </div>
        </Card>

        {showFinancials && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avisos & Marketing</h2>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 flex items-start">
              <Star className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Aniversariantes da Semana</p>
                <p className="text-sm mt-1">3 clientes fazem aniversário esta semana. Envie um cupom de desconto!</p>
              </div>
            </div>
             <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-100 flex items-start">
              <MessageCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Clientes Inativos</p>
                <p className="text-sm mt-1">12 clientes não retornam há mais de 45 dias.</p>
              </div>
            </div>
          </div>
        </Card>
        )}
      </div>
    </div>
  );
};

// 2. Schedule View (Day View)
const ScheduleView = ({ 
  appointments, 
  professionals, 
  services,
  user,
  onUpdateStatus 
}: { 
  appointments: any[], 
  professionals: any[], 
  services: any[],
  user: User,
  onUpdateStatus: (id: string, status: AppointmentStatus) => void 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('all');

  // If user is Professional, force filter to them
  useEffect(() => {
    if (user.role === UserRole.PROFESSIONAL && user.professionalId) {
        setSelectedProfessionalId(user.professionalId);
    } else {
        // Reset or keep based on preference? Resetting for simplicity when switching roles
        // But for MVP, we let it be 'all' for Owner/Receptionist
    }
  }, [user]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const dayAppointments = appointments.filter(a => 
    new Date(a.dateTime).toDateString() === selectedDate.toDateString()
  );

  // Time slots from 08:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Filter professionals to display
  const isProfessionalUser = user.role === UserRole.PROFESSIONAL;
  
  const displayedProfessionals = selectedProfessionalId === 'all'
    ? professionals
    : professionals.filter(p => p.id === selectedProfessionalId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        
        <div className="flex flex-1 md:justify-center items-center space-x-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
          <Button variant="ghost" onClick={handlePrevDay} className="p-2 h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-medium w-full md:w-48 text-center text-sm md:text-base">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <Button variant="ghost" onClick={handleNextDay} className="p-2 h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
        </div>

        <div className="flex gap-2">
            {!isProfessionalUser && (
                <div className="relative">
                    <select 
                        value={selectedProfessionalId} 
                        onChange={(e) => setSelectedProfessionalId(e.target.value)}
                        className="pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm bg-white appearance-none cursor-pointer hover:bg-gray-50 h-[42px] outline-none"
                    >
                        <option value="all">Todos os Profissionais</option>
                        {professionals.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            )}
            
            <Button>
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Novo</span>
            </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <div className="min-w-[800px] h-full flex flex-col">
          {/* Header Row: Professionals */}
          <div className="flex border-b border-gray-200">
            <div className="w-20 p-4 border-r border-gray-100 bg-gray-50 flex-shrink-0"></div>
            {displayedProfessionals.map(prof => (
              <div key={prof.id} className="flex-1 p-4 text-center border-r border-gray-100 last:border-0 min-w-[200px]">
                 <div className="flex flex-col items-center">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 font-bold shadow-sm text-gray-700`} style={{backgroundColor: prof.color}}>
                     {prof.name.charAt(0)}
                   </div>
                   <span className="font-medium text-sm truncate w-full">{prof.name}</span>
                 </div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative flex-1 overflow-y-auto">
            {hours.map(hour => (
              <div key={hour} className="flex border-b border-gray-100 min-h-[96px]">
                <div className="w-20 p-2 text-xs text-gray-400 text-right border-r border-gray-100 pr-4 flex-shrink-0 sticky left-0 bg-white">
                  {hour}:00
                </div>
                {displayedProfessionals.map(prof => (
                  <div key={prof.id} className="flex-1 border-r border-gray-100 relative group hover:bg-gray-50 transition-colors min-w-[200px]">
                     {/* Render appointments for this cell */}
                     {dayAppointments
                        .filter(a => {
                          const apptDate = new Date(a.dateTime);
                          return a.professionalId === prof.id && apptDate.getHours() === hour;
                        })
                        .map(appt => (
                          <div 
                            key={appt.id}
                            className="absolute inset-x-1 top-1 bottom-1 rounded border-l-4 p-2 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10 bg-white/50 backdrop-blur-sm"
                            style={{ backgroundColor: prof.color + '40', borderColor: prof.color, color: '#1f2937' }}
                            onClick={() => {
                                const nextStatus = appt.status === AppointmentStatus.SCHEDULED ? AppointmentStatus.CONFIRMED : 
                                                   appt.status === AppointmentStatus.CONFIRMED ? AppointmentStatus.COMPLETED : AppointmentStatus.SCHEDULED;
                                onUpdateStatus(appt.id, nextStatus);
                            }}
                          >
                            <div className="font-bold">{getServiceNames(appt.serviceIds, services)}</div>
                            <div className="mt-1 opacity-75">{AppointmentStatus[appt.status as keyof typeof AppointmentStatus] || appt.status}</div>
                          </div>
                        ))
                     }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Client List View
const ClientsView = ({ 
    clients, 
    onAdd, 
    onUpdate, 
    onDelete 
}: { 
    clients: Client[], 
    onAdd: (c: Omit<Client, 'id' | 'loyaltyPoints' | 'totalSpent' | 'tags'>) => void,
    onUpdate: (id: string, c: Partial<Client>) => void,
    onDelete: (id: string) => void
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      phone: '',
      email: '',
      birthDate: '',
      notes: ''
  });

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const handleOpenModal = (client?: Client) => {
      if (client) {
          setEditingId(client.id);
          setFormData({
              name: client.name,
              phone: client.phone,
              email: client.email || '',
              birthDate: client.birthDate || '',
              notes: client.notes || ''
          });
      } else {
          setEditingId(null);
          setFormData({ name: '', phone: '', email: '', birthDate: '', notes: '' });
      }
      setIsModalOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const clientData = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          birthDate: formData.birthDate,
          notes: formData.notes
      };

      if (editingId) {
          onUpdate(editingId, clientData);
      } else {
          onAdd(clientData);
      }
      setIsModalOpen(false);
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input 
              placeholder="Buscar nome ou telefone..." 
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <Card key={client.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir cliente?')) onDelete(client.id); }} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm">
                  <Trash2 className="h-4 w-4" />
                </button>
             </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 border-2 border-white shadow-sm">
                  {client.photoUrl ? (
                    <img src={client.photoUrl} alt={client.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
              </div>
              <Badge color="bg-amber-100 text-amber-800">{client.loyaltyPoints} pts</Badge>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Última Visita</p>
                <p className="font-medium text-gray-900">{client.lastVisit ? formatDate(client.lastVisit) : '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Gasto</p>
                <p className="font-medium text-gray-900">{formatCurrency(client.totalSpent)}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs"
                onClick={(e) => {
                    e.stopPropagation();
                    window.open(generateWhatsAppLink(client.phone, "Olá! Vamos agendar seu horário?"), '_blank');
                }}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
              <Button variant="secondary" className="flex-1 text-xs">Ver Perfil</Button>
            </div>
          </Card>
        ))}
      </div>

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label="Nome Completo" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
                placeholder="Ex: Maria Silva"
              />
              
              <Input 
                label="Telefone (WhatsApp)" 
                leftIcon={<Phone className="h-4 w-4" />}
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                required 
                placeholder="(11) 99999-9999"
              />

              <Input 
                label="Email" 
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="maria@email.com"
              />

              <Input 
                label="Data de Nascimento" 
                type="date"
                value={formData.birthDate} 
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
              />

              <TextArea 
                label="Observações / Alergias"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Alergia a amônia, prefere café sem açúcar..."
              />

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Services View
const ServicesView = ({ 
  services,
  onAdd,
  onUpdate,
  onDelete
}: { 
  services: Service[],
  onAdd: (s: Omit<Service, 'id'>) => void,
  onUpdate: (id: string, s: Partial<Service>) => void,
  onDelete: (id: string) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    durationMinutes: string;
    category: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: '',
    price: '',
    durationMinutes: '',
    category: 'Geral',
    description: '',
    status: 'ACTIVE'
  });

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        durationMinutes: service.durationMinutes.toString(),
        category: service.category,
        description: service.description || '',
        status: service.status || 'ACTIVE'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', durationMinutes: '30', category: 'Geral', description: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      name: formData.name,
      price: parseFloat(formData.price),
      durationMinutes: parseInt(formData.durationMinutes),
      category: formData.category,
      description: formData.description,
      status: formData.status
    };

    if (editingId) {
      onUpdate(editingId, serviceData);
    } else {
      onAdd(serviceData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Serviços e Preços</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <Card key={service.id} className={`p-6 relative group ${service.status === 'INACTIVE' ? 'opacity-75 bg-gray-50' : ''}`}>
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => handleOpenModal(service)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm border border-gray-100">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => { if(confirm('Excluir este serviço?')) onDelete(service.id) }} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm border border-gray-100">
                  <Trash2 className="h-4 w-4" />
                </button>
             </div>

             <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${service.status === 'INACTIVE' ? 'bg-gray-200 text-gray-500' : 'bg-primary-50 text-primary-600'}`}>
                  <Tag className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <span className="block text-xl font-bold text-gray-900">{formatCurrency(service.price)}</span>
                  <div className="flex flex-col items-end mt-1">
                      <span className="text-xs text-gray-500 mb-1">{service.category}</span>
                      {service.status === 'INACTIVE' && (
                          <Badge color="bg-red-100 text-red-600">Inativo</Badge>
                      )}
                  </div>
                </div>
             </div>

             <h3 className="font-semibold text-lg text-gray-900 mb-1">{service.name}</h3>
             <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10 leading-relaxed">{service.description || 'Sem descrição.'}</p>

             <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
               <Clock className="h-4 w-4 mr-2" />
               {service.durationMinutes} minutos
             </div>
          </Card>
        ))}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input 
                label="Nome do Serviço" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
                placeholder="Ex: Corte Masculino"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Preço" 
                  type="number" 
                  step="0.01" 
                  leftIcon={<span className="text-gray-500 font-semibold text-xs">R$</span>}
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required 
                />
                <Input 
                  label="Duração" 
                  type="number" 
                  rightElement={<span className="text-gray-500 text-xs">min</span>}
                  value={formData.durationMinutes} 
                  onChange={e => setFormData({...formData, durationMinutes: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label="Categoria" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required 
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Unhas">Unhas</option>
                    <option value="Estética">Estética</option>
                    <option value="Massagem">Massagem</option>
                  </Select>

                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                  >
                      <option value="ACTIVE">Ativo</option>
                      <option value="INACTIVE">Inativo</option>
                  </Select>
              </div>

              <TextArea 
                label="Descrição"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Detalhes do serviço..."
              />

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Salvar Alterações' : 'Criar Serviço'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Professionals View
const ProfessionalsView = ({ 
    professionals,
    services,
    onAdd,
    onUpdate,
    onDelete
}: { 
    professionals: Professional[],
    services: Service[],
    onAdd: (p: Omit<Professional, 'id'>) => void,
    onUpdate: (id: string, p: Partial<Professional>) => void,
    onDelete: (id: string) => void
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
      name: '',
      photoUrl: '',
      color: PRESET_COLORS[0],
      specialties: [] as string[]
    });
  
    const handleOpenModal = (pro?: Professional) => {
      if (pro) {
        setEditingId(pro.id);
        setFormData({
          name: pro.name,
          photoUrl: pro.photoUrl,
          color: pro.color,
          specialties: pro.specialties
        });
      } else {
        setEditingId(null);
        setFormData({ 
            name: '', 
            photoUrl: `https://ui-avatars.com/api/?name=New+Pro&background=random`, 
            color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)], 
            specialties: [] 
        });
      }
      setIsModalOpen(true);
    };
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const proData = {
        name: formData.name,
        photoUrl: formData.photoUrl,
        color: formData.color,
        specialties: formData.specialties
      };
  
      if (editingId) {
        onUpdate(editingId, proData);
      } else {
        onAdd(proData);
      }
      setIsModalOpen(false);
    };
  
    const toggleSpecialty = (id: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(id) 
                ? prev.specialties.filter(s => s !== id) 
                : [...prev.specialties, id]
        }));
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
          </Button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map(pro => (
            <Card key={pro.id} className="p-6 relative text-center group hover:shadow-lg transition-shadow">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(pro)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 border border-gray-100 bg-white shadow-sm">
                         <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if(confirm('Remover profissional?')) onDelete(pro.id) }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 border border-gray-100 bg-white shadow-sm">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

               <div className="inline-block relative">
                 <img src={pro.photoUrl} alt={pro.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-4" />
                 <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: pro.color}} title="Cor na Agenda" />
               </div>

               <h3 className="font-bold text-lg text-gray-900">{pro.name}</h3>
               <p className="text-sm text-gray-500 mb-4">{pro.specialties.length} especialidades</p>

               <div className="flex flex-wrap justify-center gap-1">
                  {pro.specialties.slice(0, 3).map(sid => {
                      const s = services.find(serv => serv.id === sid);
                      return s ? <Badge key={sid} color="bg-gray-100 text-gray-600 text-[10px]">{s.name}</Badge> : null
                  })}
                  {pro.specialties.length > 3 && <Badge color="bg-gray-100 text-gray-500 text-[10px]">+{pro.specialties.length - 3}</Badge>}
               </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Editar Profissional' : 'Novo Profissional'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
                    <X className="h-6 w-6" />
                </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input 
                        label="Nome Completo" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required 
                        placeholder="Ex: Carlos Oliveira"
                    />
                    
                    <Input 
                        label="URL da Foto" 
                        value={formData.photoUrl} 
                        onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                        placeholder="https://..."
                    />

                    <div>
                        <Label>Cor na Agenda</Label>
                        <div className="flex flex-wrap gap-3 mt-2">
                           {PRESET_COLORS.map(color => (
                             <button
                               type="button"
                               key={color}
                               onClick={() => setFormData({...formData, color})}
                               className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'ring-1 ring-black/5'}`}
                               style={{ backgroundColor: color }}
                             >
                                {formData.color === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
                             </button>
                           ))}
                        </div>
                    </div>

                    <div>
                        <Label>Especialidades</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mt-2 p-1">
                            {services.map(s => {
                                const isSelected = formData.specialties.includes(s.id);
                                return (
                                <div 
                                    key={s.id} 
                                    onClick={() => toggleSpecialty(s.id)}
                                    className={`
                                        cursor-pointer p-2.5 rounded-xl border text-sm flex items-center transition-all duration-200
                                        ${isSelected ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                                    `}
                                >
                                    <div className={`w-5 h-5 rounded-md border mr-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white'}`}>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                    </div>
                                    <span className="truncate font-medium">{s.name}</span>
                                </div>
                            )})}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Salvar Profissional</Button>
                    </div>
                </form>
            </div>
            </div>
        )}
      </div>
    );
};

// 6. Finance View
const FinanceView = ({ transactions }: { transactions: any[] }) => {
    // Group transactions by type for chart
    const data = [
        { name: 'Entradas', value: transactions.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.value, 0), color: '#16a34a' },
        { name: 'Saídas', value: transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.value, 0), color: '#dc2626' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 p-6">
                    <h2 className="text-lg font-semibold mb-4">Fluxo de Caixa (Mensal)</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Bar dataKey="value">
                                  {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Últimas Transações</h2>
                    <div className="space-y-3 overflow-y-auto max-h-64">
                        {transactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                                <div>
                                    <p className="font-medium text-gray-900">{t.description}</p>
                                    <p className="text-xs text-gray-500">{formatDate(t.date)}</p>
                                </div>
                                <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

// 7. Marketing View
const MarketingView = ({ clients }: { clients: Client[] }) => {
  
  // Logic to find birthdays (this month) for demo
  const currentMonth = new Date().getMonth();
  const birthdays = clients.filter(c => {
    if(!c.birthDate) return false;
    const birthDate = new Date(c.birthDate);
    // Note: In a real app, you'd match Month and Day. For demo, we just check month to get some hits.
    return birthDate.getMonth() === currentMonth || birthDate.getMonth() === 9; // Hardcoded October (9) for demo data
  });

  // Logic to find inactive clients (> 30 days)
  const inactiveDate = new Date();
  inactiveDate.setDate(inactiveDate.getDate() - 30);
  const inactiveClients = clients.filter(c => {
    if(!c.lastVisit) return true;
    return new Date(c.lastVisit) < inactiveDate;
  });

  const campaigns = [
    {
      id: 1,
      title: 'Aniversariantes do Mês',
      description: 'Envie um cupom de presente para quem faz aniversário.',
      icon: Gift,
      color: 'bg-pink-100 text-pink-600',
      count: birthdays.length,
      message: 'Olá! Feliz aniversário! 🎂 Temos um presente especial para você: 15% de desconto em qualquer serviço esta semana!',
      buttonText: 'Enviar Oferta'
    },
    {
      id: 2,
      title: 'Resgate de Clientes',
      description: 'Clientes que não visitam o salão há mais de 30 dias.',
      icon: UserIcon,
      color: 'bg-amber-100 text-amber-600',
      count: inactiveClients.length,
      message: 'Olá! Estamos com saudade! ❤️ Que tal agendar um horário para renovar o visual? Temos horários disponíveis!',
      buttonText: 'Enviar Lembrete'
    },
    {
      id: 3,
      title: 'Horários Livres',
      description: 'Preencha a agenda de amanhã com uma promoção relâmpago.',
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      count: clients.length, // All clients
      message: '✨ Promoção Relâmpago! Agende para amanhã e ganhe hidratação grátis no corte. Responda "EU QUERO"!',
      buttonText: 'Divulgar'
    }
  ];

  const handleCampaignAction = (campaign: any) => {
    // For MVP, we simulate sending by opening the first client's WhatsApp or a generic link
    // In a real app, this would probably list the clients to send individually
    const target = campaign.id === 1 && birthdays.length > 0 ? birthdays[0] : 
                   campaign.id === 2 && inactiveClients.length > 0 ? inactiveClients[0] :
                   clients[0];
    
    if (target) {
        window.open(generateWhatsAppLink(target.phone, campaign.message), '_blank');
    } else {
        alert("Nenhum cliente neste grupo para enviar mensagem.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Marketing & Automação</h1>
      <p className="text-gray-500">Crie campanhas automáticas para fidelizar seus clientes e aumentar o faturamento.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(camp => (
          <Card key={camp.id} className="flex flex-col h-full">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${camp.color}`}>
                  <camp.icon className="h-6 w-6" />
                </div>
                <Badge color="bg-gray-100 text-gray-800">{camp.count} clientes</Badge>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{camp.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{camp.description}</p>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-600 italic mb-4">
                "{camp.message}"
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
               <Button className="w-full" onClick={() => handleCampaignAction(camp)}>
                 <Megaphone className="h-4 w-4 mr-2" />
                 {camp.buttonText}
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 8. Settings View
const SettingsView = ({ 
    settings, 
    onUpdate 
}: { 
    settings: SalonSettings, 
    onUpdate: (s: Partial<SalonSettings>) => void 
}) => {
    const [formData, setFormData] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(formData);
        alert("Configurações salvas com sucesso!");
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`beautypro.app/${formData.bookingLinkSlug}`);
        alert("Link copiado para a área de transferência!");
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
                    Dados do Salão
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Nome do Estabelecimento" name="salonName" value={formData.salonName} onChange={handleChange} />
                    <Input label="Telefone / WhatsApp" name="phone" value={formData.phone} onChange={handleChange} />
                    <div className="md:col-span-2">
                        <Input label="Endereço Completo" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-primary-600" />
                    Programa de Fidelidade
                </h2>
                <div className="space-y-6">
                    <Switch 
                        checked={formData.loyaltyEnabled}
                        onChange={(val) => setFormData(prev => ({ ...prev, loyaltyEnabled: val }))}
                        label="Ativar Programa de Pontos"
                        description="Seus clientes ganharão pontos a cada serviço realizado."
                    />

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${!formData.loyaltyEnabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                         <Input 
                            label="Pontos por R$ 1,00 gasto" 
                            type="number" 
                            name="pointsPerCurrency" 
                            value={formData.pointsPerCurrency} 
                            onChange={handleChange} 
                        />
                        <div className="md:col-span-2">
                            <TextArea 
                                label="Descrição da Recompensa"
                                name="loyaltyRewardDescription"
                                rows={2}
                                value={formData.loyaltyRewardDescription}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center">
                    <Share2 className="h-5 w-5 mr-2 text-primary-600" />
                    Link de Agendamento
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                     <div className="flex-1 w-full">
                        <Input 
                            label="Slug do Salão (URL Personalizada)" 
                            name="bookingLinkSlug" 
                            leftIcon={<span className="text-gray-400 text-xs font-mono">beautypro.app/</span>}
                            value={formData.bookingLinkSlug} 
                            onChange={handleChange}
                        />
                     </div>
                     <div className="w-full md:w-auto flex gap-2">
                        <Button variant="outline" onClick={copyLink} className="whitespace-nowrap">
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar Link
                        </Button>
                        <Button variant="secondary" onClick={() => window.open(`#`, '_blank')} className="whitespace-nowrap">
                            Ver Página
                        </Button>
                     </div>
                </div>
            </Card>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Todas as Configurações
                </Button>
            </div>
        </div>
    );
};

// 9. Client Booking App (Client View)
const ClientBookingApp = ({
  services,
  professionals,
  onBook
}: {
  services: Service[],
  professionals: Professional[],
  onBook: (data: { serviceId: string, professionalId: string, slot: string }) => void
}) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleBook = () => {
    if (selectedService && selectedProfessional && selectedSlot) {
      onBook({
        serviceId: selectedService,
        professionalId: selectedProfessional,
        slot: selectedSlot
      });
      alert('Agendamento realizado com sucesso! (Simulado)');
      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex flex-col items-center justify-center border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">BeautyPro Salon</h1>
            <a
              href="https://beautypro.app/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center mt-1"
            >
              beautypro.app/demo <ExternalLink className="h-3 w-3 ml-1" />
            </a>
        </div>
        
        <div className="p-4 max-w-md mx-auto space-y-6">
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-semibold mb-4">1. Escolha o Serviço</h2>
                    <div className="space-y-3">
                        {services.map(service => (
                            <div 
                                key={service.id} 
                                onClick={() => { setSelectedService(service.id); setStep(2); }}
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:border-primary-500 cursor-pointer flex justify-between items-center hover:border-primary-300 transition-colors"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                                    <p className="text-sm text-gray-500">{formatCurrency(service.price)} • {service.durationMinutes} min</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center mb-4">
                        <button onClick={() => setStep(1)} className="mr-2 p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
                        <h2 className="text-lg font-semibold">2. Escolha o Profissional</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div 
                            onClick={() => { setSelectedProfessional('any'); setStep(3); }}
                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center cursor-pointer hover:border-primary-300 transition-all"
                         >
                            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <span className="font-medium text-sm">Qualquer Um</span>
                         </div>
                        {professionals.map(prof => (
                            <div 
                                key={prof.id} 
                                onClick={() => { setSelectedProfessional(prof.id); setStep(3); }}
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center cursor-pointer hover:border-primary-300 transition-all"
                            >
                                <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-2 flex items-center justify-center text-primary-700 font-bold text-xl">
                                    {prof.name.charAt(0)}
                                </div>
                                <span className="font-medium text-sm block truncate">{prof.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center mb-4">
                        <button onClick={() => setStep(2)} className="mr-2 p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
                        <h2 className="text-lg font-semibold">3. Escolha o Horário</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Horários disponíveis para amanhã:</p>
                    <div className="grid grid-cols-3 gap-3">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                            <button 
                                key={time}
                                onClick={() => { setSelectedSlot(time); }}
                                className={`py-3 px-1 rounded-xl text-sm font-medium border transition-all ${selectedSlot === time ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500 hover:text-primary-600'}`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-100">
                         <Button className="w-full py-3.5 text-lg shadow-lg shadow-primary-500/20" disabled={!selectedSlot} onClick={handleBook}>
                            Confirmar Agendamento
                         </Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [appMode, setAppMode] = useState<'admin' | 'client' | 'auth'>('auth'); // Default to auth

  // Data Store
  const { 
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
    addService,
    updateService,
    removeService,
    updateSettings,
    addProfessional,
    updateProfessional,
    removeProfessional
  } = useDataService();

  // Handle Login
  const handleLogin = (email: string) => {
    if (login(email)) {
        setAppMode('admin');
        setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setAppMode('auth');
  };

  // Render Logic
  if (appMode === 'auth') {
      return <LoginView onLogin={handleLogin} />;
  }

  if (appMode === 'client') {
      return (
          <>
            <ClientBookingApp 
                services={services} 
                professionals={professionals} 
                onBook={(data) => {
                    // Mock booking logic
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const [h, m] = data.slot.split(':');
                    tomorrow.setHours(parseInt(h), parseInt(m), 0, 0);

                    addAppointment({
                        clientId: 'c1', // Hardcoded for demo
                        professionalId: data.professionalId,
                        serviceIds: [data.serviceId],
                        dateTime: tomorrow.toISOString(),
                    });
                }} 
            />
            {/* Floating Switcher for Demo Purposes */}
            <div className="fixed bottom-4 right-4 z-50">
                <Button onClick={() => setAppMode('admin')} className="bg-gray-800 text-white shadow-xl rounded-full px-6 py-3">
                    Ir para Admin
                </Button>
            </div>
          </>
      );
  }

  // Permission Check Helper
  const canAccess = (view: string) => {
    if (!currentUser) return false;
    // Simple mapping based on Sidebar
    if (currentUser.role === UserRole.OWNER) return true;
    if (currentUser.role === UserRole.RECEPTIONIST) {
        return ['dashboard', 'agenda', 'clients'].includes(view);
    }
    if (currentUser.role === UserRole.PROFESSIONAL) {
        return ['agenda', 'clients'].includes(view);
    }
    return false;
  };

  const renderContent = () => {
    if (!canAccess(currentView)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <Lock className="h-16 w-16 mb-4 opacity-20" />
                <h2 className="text-xl font-semibold text-gray-600">Acesso Restrito</h2>
                <p>Você não tem permissão para acessar esta área.</p>
                <Button variant="outline" className="mt-4" onClick={() => setCurrentView('agenda')}>
                    Voltar para Agenda
                </Button>
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView 
            appointments={appointments} 
            transactions={transactions} 
            user={currentUser!} 
            clients={clients} 
            services={services}
        />;
      case 'agenda':
        return <ScheduleView 
                  appointments={appointments} 
                  professionals={professionals} 
                  services={services} 
                  user={currentUser!}
                  onUpdateStatus={updateAppointmentStatus} 
               />;
      case 'clients':
        return <ClientsView 
                  clients={clients} 
                  onAdd={addClient}
                  onUpdate={updateClient}
                  onDelete={removeClient}
               />;
      case 'services':
        return <ServicesView 
                  services={services} 
                  onAdd={addService}
                  onUpdate={updateService}
                  onDelete={removeService}
               />;
      case 'team':
        return <ProfessionalsView 
                  professionals={professionals} 
                  services={services}
                  onAdd={addProfessional}
                  onUpdate={updateProfessional}
                  onDelete={removeProfessional}
               />;
      case 'finance':
        return <FinanceView transactions={transactions} />;
      case 'marketing':
        return <MarketingView clients={clients} />;
      case 'settings':
        return <SettingsView settings={settings} onUpdate={updateSettings} />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                <Settings className="h-16 w-16 mb-4 opacity-20" />
                <p>Módulo {currentView} em desenvolvimento.</p>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
        userRole={currentUser?.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>

       {/* Floating Switcher for Demo Purposes */}
       <div className="fixed bottom-4 right-4 z-50 flex gap-2">
            <Button onClick={() => setAppMode('client')} className="bg-gray-800 text-white shadow-xl rounded-full px-6 py-3">
                Ver App Cliente
            </Button>
       </div>
    </div>
  );
};

export default App;
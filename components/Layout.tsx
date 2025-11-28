import React, { useState } from 'react';
import { 
  Calendar, 
  LayoutDashboard, 
  Users, 
  Scissors, 
  DollarSign, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  Megaphone,
  Briefcase
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  userRole?: UserRole;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isMobileOpen, 
  setIsMobileOpen,
  onLogout,
  userRole
}) => {
  // Define menu items with allowed roles
  const allMenuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: [UserRole.OWNER, UserRole.RECEPTIONIST] },
    { id: 'agenda', icon: Calendar, label: 'Agenda', roles: [UserRole.OWNER, UserRole.RECEPTIONIST, UserRole.PROFESSIONAL] },
    { id: 'clients', icon: Users, label: 'Clientes', roles: [UserRole.OWNER, UserRole.RECEPTIONIST, UserRole.PROFESSIONAL] },
    { id: 'services', icon: Scissors, label: 'Serviços', roles: [UserRole.OWNER] }, // Owner only
    { id: 'team', icon: Briefcase, label: 'Equipe', roles: [UserRole.OWNER] }, // Owner only
    { id: 'finance', icon: DollarSign, label: 'Financeiro', roles: [UserRole.OWNER] }, // Owner only
    { id: 'marketing', icon: Megaphone, label: 'Marketing', roles: [UserRole.OWNER] }, // Owner only
    { id: 'settings', icon: Settings, label: 'Configurações', roles: [UserRole.OWNER] }, // Owner only
  ];

  // Filter based on user role
  const menuItems = allMenuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const handleNavClick = (id: string) => {
    onChangeView(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-100 px-6">
          <Sparkles className="h-6 w-6 text-primary-600 mr-2" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
            BeautyPro
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon className={`h-5 w-5 mr-3 ${currentView === item.id ? 'text-primary-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>
    </>
  );
};

export const MobileHeader: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => (
  <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sticky top-0 z-10">
    <button onClick={onMenuClick} className="p-2 -ml-2 text-gray-600">
      <Menu className="h-6 w-6" />
    </button>
    <span className="text-lg font-bold text-gray-900">BeautyPro</span>
    <div className="w-8" /> {/* Spacer */}
  </div>
);
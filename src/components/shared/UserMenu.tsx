import React, { useState } from 'react';
import { User, LogOut, Settings, Shield, Users, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const UserMenu: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentPortal } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('guest');
    setIsOpen(false);
    // Trigger reset booking state when logging out
    window.dispatchEvent(new CustomEvent('resetBookingState'));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'agent': return <Users className="h-4 w-4" />;
      case 'driver': return <UserCheck className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600';
      case 'agent': return 'text-emerald-600';
      case 'driver': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-yellow-400 px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
      >
        <div className={`p-1 rounded ${getRoleColor(currentUser.role)} bg-white`}>
          {getRoleIcon(currentUser.role)}
        </div>
        <span className="text-sm font-medium">{currentUser.name}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getRoleColor(currentUser.role)} bg-gray-100`}>
                  {getRoleIcon(currentUser.role)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-600">{currentUser.email}</p>
                  <p className={`text-xs capitalize font-medium ${getRoleColor(currentUser.role)}`}>
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </div>
            
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
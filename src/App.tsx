import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/shared/Header';
import GuestPortal from './components/guest/GuestPortal';
import AdminPortal from './components/admin/AdminPortal';
import AgentPortal from './components/agent/AgentPortal';
import DriverPortal from './components/driver/DriverPortal';
import CSRPortal from './components/csr/CSRPortal';

function App() {
  const { currentPortal, currentUser } = useApp();

  const renderPortal = () => {
    switch (currentPortal) {
      case 'admin':
        return <AdminPortal />;
      case 'agent':
        return <AgentPortal />;
      case 'driver':
        return <DriverPortal />;
      case 'csr':
        return <CSRPortal />;
      default:
        return <GuestPortal />;
    }
  };

  // Only show header for guest portal
  if (currentPortal === 'guest') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {renderPortal()}
      </div>
    );
  }

  // For other portals, render them directly (they have their own headers)
  return renderPortal();
}

export default App;
import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import UserMenu from './UserMenu';
import LoginModal from '../auth/LoginModal';

const Header: React.FC = () => {
  const { setCurrentPortal, currentUser, resetBookingState } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const goToMainPage = () => {
    // Reset booking state first
    resetBookingState();
    // Then set to guest portal
    setCurrentPortal('guest');
  };

  return (
    <>
      <header className="bg-[#1a3a5f] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToMainPage}
              className="flex items-center space-x-3 text-white hover:text-[#e8b143] transition-colors duration-150 cursor-pointer"
            >
              <Car className="h-8 w-8 text-[#e8b143]" />
              <span className="text-xl font-bold">ROH AL JAZEERA</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {!currentUser ? (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-[#e8b143] text-[#1a3a5f] px-4 py-2 rounded-lg font-semibold hover:bg-[#d89c2a] transition-colors duration-150"
                >
                  Login/Register
                </button>
              ) : (
                <UserMenu />
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Check, Phone, Car, Plane, Train, Mountain, Fuel as Mosque, Users, Briefcase as Suitcase, Home } from 'lucide-react';
import { Route, CarType, Customer, Booking } from '../../types';
import { useApp } from '../../context/AppContext';

const BookingPortal: React.FC = () => {
  const { routes, carTypes, addBooking, loading } = useApp();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedCarType, setSelectedCarType] = useState<CarType | null>(null);
  const [customer, setCustomer] = useState<Partial<Customer>>({});
  const [pickupDetails, setPickupDetails] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentPage, setCurrentPage] = useState<'location' | 'vehicle' | 'confirmation'>('location');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Set default date and time with 20 minute buffer
  useEffect(() => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 15 * 60 * 1000); // Add 15 minutes
    
    setRideDate(futureTime.toISOString().split('T')[0]);
    
    const hours = futureTime.getHours().toString().padStart(2, '0');
    const minutes = futureTime.getMinutes().toString().padStart(2, '0');
    setRideTime(`${hours}:${minutes}`);
  }, []);

  // Listen for reset booking state event from logo click
  useEffect(() => {
    const handleResetBookingState = () => {
      setBookingConfirmed(false);
      setSelectedRoute(null);
      setSelectedCarType(null);
      setCurrentPage('location');
      setCustomer({});
      setPickupDetails('');
      setSpecialInstructions('');
      setFormErrors({});
    };

    window.addEventListener('resetBookingState', handleResetBookingState);
    
    return () => {
      window.removeEventListener('resetBookingState', handleResetBookingState);
    };
  }, []);

  const validateDateTime = () => {
    const selectedDateTime = new Date(`${rideDate}T${rideTime}`);
    const now = new Date();
    const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    if (selectedDateTime < minTime) {
      setFormErrors(prev => ({
        ...prev,
        datetime: 'Booking time must be at least 15 minutes from now'
      }));
      return false;
    }

    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.datetime;
      return newErrors;
    });
    return true;
  };

  const getRouteIcon = (routeName: string) => {
    if (routeName.includes('Airport')) return <Plane className="h-8 w-8" />;
    if (routeName.includes('Train')) return <Train className="h-8 w-8" />;
    if (routeName.includes('Ziyarah')) return <Mosque className="h-8 w-8" />;
    if (routeName.includes('Taif')) return <Mountain className="h-8 w-8" />;
    return <Car className="h-8 w-8" />;
  };

  const getVehicleEmoji = (carTypeId: string) => {
    switch (carTypeId) {
      case 'camry': return '🚗';
      case 'starx': return '🚙';
      case 'gmc': return '🚐';
      case 'hiace': return '🚌';
      default: return '🚗';
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setSelectedCarType(null);
    setCurrentPage('vehicle');
  };

  const handleCarTypeSelect = (carType: CarType) => {
    setSelectedCarType(carType);
    setCurrentPage('confirmation');
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customer.name?.trim()) {
      errors.name = 'Please enter your name';
    }
    
    if (!customer.phone?.trim()) {
      errors.phone = 'Please enter your phone number with country code';
    } else if (!/^\+[1-9]\d{1,14}$/.test(customer.phone.trim())) {
      errors.phone = 'Please enter a valid phone number with country code (e.g. +966501234567)';
    }

    if (!validateDateTime()) {
      errors.datetime = 'Invalid date/time selection';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async () => {
    if (!selectedRoute || !selectedCarType || !validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const newBooking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
        customerId: '',
        customer: customer as Customer,
        routeId: selectedRoute.id,
        route: selectedRoute,
        carType: selectedCarType.id,
        status: 'pending',
        pickupTime: new Date(`${rideDate}T${rideTime}`).toISOString(),
        pickupLocation: pickupDetails || selectedRoute.from,
        specialInstructions,
        price: selectedRoute.pricing[selectedCarType.id]
      };

      await addBooking(newBooking);
      setBookingConfirmed(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!selectedRoute || !selectedCarType) return '';

    const formattedDate = rideDate ? new Date(rideDate).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }) : '';

    let message = `Assalamu Alaikum,\n\nI would like to book a ride:\n\n`;
    message += `*Vehicle:* ${selectedCarType.name}\n`;
    message += `*Route:* ${selectedRoute.from} → ${selectedRoute.to}\n`;
    message += `*Price:* SAR ${selectedRoute.pricing[selectedCarType.id]}\n`;
    message += `*Passengers:* ${selectedCarType.capacity}\n\n`;
    
    if (customer.name) message += `*Name:* ${customer.name}\n`;
    if (customer.phone) message += `*Phone:* ${customer.phone}\n`;
    if (rideDate) message += `*Date:* ${formattedDate}\n`;
    if (rideTime) message += `*Time:* ${rideTime}\n`;
    if (pickupDetails) message += `*Pickup:* ${pickupDetails}\n`;
    if (specialInstructions) message += `*Instructions:* ${specialInstructions}\n`;
    
    message += `\nPAYMENT: CASH AFTER RIDE`;
    
    return encodeURIComponent(message);
  };

  // SIMPLE FUNCTION TO GO TO HOME PAGE - RESET EVERYTHING
  const goToHomePage = () => {
    setBookingConfirmed(false);
    setSelectedRoute(null);
    setSelectedCarType(null);
    setCurrentPage('location');
    setCustomer({});
    setPickupDetails('');
    setSpecialInstructions('');
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3a5f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes and vehicles...</p>
        </div>
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-[#1a3a5f]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a3a5f] mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been submitted successfully. Our team will contact you shortly via phone or WhatsApp to confirm your trip details.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="font-mono font-bold text-lg text-[#1a3a5f]">#RJ{Date.now().toString().slice(-6)}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={goToHomePage}
                className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
              
              <button
                onClick={goToHomePage}
                className="w-full bg-[#e8b143] text-[#1a3a5f] py-3 rounded-lg font-medium hover:bg-[#d89c2a] transition-colors"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Selection Page */}
        {currentPage === 'location' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#1a3a5f] mb-4">PREMIUM RIDE SERVICES</h1>
              <h2 className="text-xl text-[#6c757d] max-w-2xl mx-auto">
                Across Saudi Arabia with Comfort and Reliability
              </h2>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#1a3a5f] mb-6">Select Your Route</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {routes.map((route) => {
                  const minPrice = Math.min(...Object.values(route.pricing));
                  
                  return (
                    <div
                      key={route.id}
                      onClick={() => handleRouteSelect(route)}
                      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-[#1a3a5f] relative"
                    >
                      <div className="flex items-center space-x-3 mb-4 text-[#e8b143]">
                        {getRouteIcon(route.from)}
                        <h3 className="text-lg font-semibold text-[#1a3a5f]">
                          {route.from} → {route.to}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-[#6c757d] mb-4">
                        <span>{route.distance}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{route.duration}</span>
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#6c757d]">Starting from:</p>
                        <div className="text-2xl font-bold text-[#1a3a5f]">
                          SAR {minPrice}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Selection Page */}
        {currentPage === 'vehicle' && selectedRoute && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#1a3a5f] mb-2">Choose Your Vehicle</h1>
              <h2 className="text-lg text-[#6c757d]">Select the perfect ride for your journey</h2>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#1a3a5f]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1a3a5f] mb-2">
                    {selectedRoute.from} → {selectedRoute.to}
                  </h2>
                  <div className="flex items-center space-x-4 text-[#6c757d]">
                    <span>{selectedRoute.distance}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedRoute.duration}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {carTypes.map((carType) => {
                const price = selectedRoute.pricing[carType.id];
                const isLuxury = carType.name.includes('GMC');
                
                return (
                  <div
                    key={carType.id}
                    onClick={() => handleCarTypeSelect(carType)}
                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-[#e8b143] hover:shadow-xl"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{getVehicleEmoji(carType.id)}</div>
                      <h4 className="font-semibold text-[#1a3a5f] mb-1">
                        {carType.name}
                        {isLuxury && <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Luxury</span>}
                      </h4>
                      <p className="text-sm text-[#6c757d] mb-3">
                        SAR {selectedRoute.pricing[carType.id]}
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-[#6c757d] mb-4">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{carType.capacity}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Suitcase className="h-4 w-4" />
                          <span>Luggage</span>
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#1a3a5f]">
                        SAR {price}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {carType.features.slice(0, 2).map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-[#1a3a5f] px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirmation Page */}
        {currentPage === 'confirmation' && selectedRoute && selectedCarType && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#1a3a5f] mb-2">Confirm Your Booking</h1>
              <h2 className="text-lg text-[#6c757d]">Finalize your ride details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#1a3a5f]">
                <h3 className="text-lg font-semibold text-[#1a3a5f] mb-6">Booking Summary</h3>

                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{getVehicleEmoji(selectedCarType.id)}</div>
                  <h2 className="text-xl font-semibold text-[#1a3a5f]">{selectedCarType.name}</h2>
                  <div className="flex items-center justify-center space-x-4 text-[#6c757d] mt-2">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedCarType.capacity} passengers</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#1a3a5f] mb-2">Route</h3>
                    <p className="text-[#6c757d]">{selectedRoute.from} → {selectedRoute.to}</p>
                    <p className="text-sm text-[#6c757d]">{selectedRoute.distance} • {selectedRoute.duration}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#1a3a5f]">
                      SAR {selectedRoute.pricing[selectedCarType.id]}
                    </p>
                    <p className="text-sm text-[#6c757d] mt-2 font-medium">PAYMENT: CASH AFTER RIDE</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#1a3a5f]">
                <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Customer Information</h3>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For WhatsApp sharing, no details required. For direct booking, please fill in your information.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name (Required for booking)"
                      value={customer.name || ''}
                      onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Your Phone Number with Country Code (e.g. +966501234567)"
                      value={customer.phone || ''}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={customer.email || ''}
                      onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={rideDate}
                      onChange={(e) => setRideDate(e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent ${
                        formErrors.datetime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="time"
                      value={rideTime}
                      onChange={(e) => setRideTime(e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent ${
                        formErrors.datetime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.datetime && <p className="text-red-500 text-sm mt-1">{formErrors.datetime}</p>}

                  <div>
                    <input
                      type="text"
                      placeholder="Pickup Location Details (Optional)"
                      value={pickupDetails}
                      onChange={(e) => setPickupDetails(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Special Instructions (Optional)"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <button
                    onClick={handleBookingSubmit}
                    disabled={submitting}
                    className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>{submitting ? 'Creating Booking...' : 'Book Now'}</span>
                  </button>

                  <a
                    href={`https://wa.me/966574408160?text=${generateWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
                    </svg>
                    <span>WhatsApp Us</span>
                  </a>

                  <a
                    href="tel:+966574408160"
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Us</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Buttons - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
        <a
          href={`https://wa.me/966574408160`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
          </svg>
        </a>
        
        <a
          href="tel:+966574408160"
          className="bg-[#1a3a5f] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-105"
        >
          <Phone className="h-6 w-6" />
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a3a5f] text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Car className="h-8 w-8 text-[#e8b143]" />
              <span className="text-2xl font-bold">Roh al Jazeera</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+966 57 440 8160</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Makkah, Saudi Arabia</span>
              </div>
            </div>
            
            <div className="border-t border-blue-800 pt-6 text-sm text-blue-200">
              © 2024 Roh al Jazeera Online Ride Services. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPortal;
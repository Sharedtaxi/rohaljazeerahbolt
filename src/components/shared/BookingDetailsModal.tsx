import React from 'react';
import { X, MapPin, Clock, User, Phone, Car, DollarSign, FileText, Users } from 'lucide-react';
import { Booking } from '../../types';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#1a3a5f]">
          <h2 className="text-2xl font-bold text-white">
            Booking Details #{booking.id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'pickup' ? 'bg-orange-100 text-orange-800' :
                booking.status === 'drop' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Fare</p>
                <p className="text-2xl font-bold text-[#1a3a5f]">SAR {booking.price}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{booking.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {booking.customer.phone}
                  </p>
                </div>
                {booking.customer.email && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{booking.customer.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Trip Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-medium text-gray-900">{booking.route.from} → {booking.route.to}</p>
                  <p className="text-sm text-gray-500">{booking.route.distance} • {booking.route.duration}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Car Type</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      {booking.carType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pickup Time</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(booking.pickupTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup Location</p>
                  <p className="font-medium text-gray-900">{booking.pickupLocation}</p>
                </div>
                {booking.specialInstructions && (
                  <div>
                    <p className="text-sm text-gray-600">Special Instructions</p>
                    <p className="font-medium text-gray-900 bg-white p-3 rounded border">
                      {booking.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Information */}
            {booking.driver && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Driver Name</p>
                    <p className="font-medium text-gray-900">{booking.driver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{booking.driver.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900">{booking.driver.carModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-medium text-gray-900">{booking.driver.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-medium text-gray-900">{booking.driver.rating}/5 ⭐</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      booking.driver.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.driver.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Information */}
            {booking.agent && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Agent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Agent Name</p>
                    <p className="font-medium text-gray-900">{booking.agent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{booking.agent.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{booking.agent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commission</p>
                    <p className="font-bold text-green-600 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      SAR {booking.agentCommission || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare:</span>
                  <span className="font-medium">SAR {booking.price}</span>
                </div>
                {booking.agent && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Agent Commission:</span>
                    <span className="font-medium text-green-600">SAR {booking.agentCommission || 0}</span>
                  </div>
                )}
                {booking.driver && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver Share:</span>
                    <span className="font-medium text-blue-600">
                      SAR {(booking.price - (booking.agentCommission || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total Fare:</span>
                  <span className="text-[#1a3a5f]">SAR {booking.price}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Booking Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
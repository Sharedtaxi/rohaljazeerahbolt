import React from 'react';
import { Clock, MapPin, Phone, Car } from 'lucide-react';
import { Booking } from '../../types';
import StatusBadge from './StatusBadge';
import { carTypes } from '../../data/mockData';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onStatusUpdate?: (bookingId: string, status: any) => void;
  currentUserRole?: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  showActions = false, 
  onStatusUpdate,
  currentUserRole 
}) => {
  const carType = carTypes.find(ct => ct.id === booking.carType);
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{carType?.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">#{booking.id.slice(-6)}</h3>
            <p className="text-sm text-gray-600">{carType?.name}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{booking.route.from} → {booking.route.to}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Pickup: {formatTime(booking.pickupTime)}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="h-4 w-4" />
          <span>{booking.customer.name} - {booking.customer.phone}</span>
        </div>

        {booking.driver && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Car className="h-4 w-4" />
            <span>Driver: {booking.driver.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-lg font-semibold text-gray-900">
          SAR {booking.price}
          {booking.agentCommission > 0 && (
            <div className="text-sm text-green-600 font-medium">
              Commission: SAR {booking.agentCommission}
            </div>
          )}
        </div>
        
        {showActions && onStatusUpdate && currentUserRole === 'driver' && booking.status !== 'completed' && (
          <div className="flex space-x-2">
            {booking.status === 'assigned' && (
              <button
                onClick={() => onStatusUpdate(booking.id, 'pickup')}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
              >
                Start Pickup
              </button>
            )}
            {booking.status === 'pickup' && (
              <button
                onClick={() => onStatusUpdate(booking.id, 'drop')}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
              >
                Picked Up
              </button>
            )}
            {booking.status === 'drop' && (
              <button
                onClick={() => onStatusUpdate(booking.id, 'completed')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Complete Trip
              </button>
            )}
          </div>
        )}
      </div>

      {booking.specialInstructions && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> {booking.specialInstructions}
          </p>
        </div>
      )}

      {booking.agent && booking.agentCommission > 0 && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Agent:</strong> {booking.agent.name} • <strong>Commission:</strong> SAR {booking.agentCommission}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
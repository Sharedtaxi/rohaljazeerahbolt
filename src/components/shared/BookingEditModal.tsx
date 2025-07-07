import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Clock, MapPin, FileText } from 'lucide-react';
import { Booking } from '../../types';

interface BookingEditModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({ booking, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    price: 0,
    agentCommission: 0,
    pickupDate: '',
    pickupTime: '',
    pickupLocation: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when booking changes
  useEffect(() => {
    if (booking) {
      const pickupDateTime = new Date(booking.pickupTime);
      setFormData({
        price: booking.price,
        agentCommission: booking.agentCommission || 0,
        pickupDate: pickupDateTime.toISOString().split('T')[0],
        pickupTime: pickupDateTime.toTimeString().slice(0, 5),
        pickupLocation: booking.pickupLocation,
        specialInstructions: booking.specialInstructions || ''
      });
    }
  }, [booking]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!booking) return;

    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (formData.price <= 0) {
        setError('Price must be greater than 0');
        return;
      }

      if (formData.agentCommission < 0) {
        setError('Agent commission cannot be negative');
        return;
      }

      if (!formData.pickupDate || !formData.pickupTime) {
        setError('Pickup date and time are required');
        return;
      }

      if (!formData.pickupLocation.trim()) {
        setError('Pickup location is required');
        return;
      }

      // Validate pickup time is in the future
      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      const now = new Date();
      const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

      if (pickupDateTime < minTime) {
        setError('Pickup time must be at least 15 minutes from now');
        return;
      }

      // Prepare updates
      const updates: Partial<Booking> = {
        price: parseFloat(formData.price.toString()),
        agentCommission: parseFloat(formData.agentCommission.toString()),
        pickupTime: pickupDateTime.toISOString(),
        pickupLocation: formData.pickupLocation.trim(),
        specialInstructions: formData.specialInstructions.trim() || undefined
      };

      await onSave(booking.id, updates);
      onClose();
    } catch (error: any) {
      console.error('Error saving booking:', error);
      setError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#1a3a5f]">
          <h2 className="text-2xl font-bold text-white">
            Edit Booking #{booking.id.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Read-only Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] mb-3">Booking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">{booking.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Phone</p>
                  <p className="font-medium text-gray-900">{booking.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route</p>
                  <p className="font-medium text-gray-900">{booking.route.from} → {booking.route.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Car Type</p>
                  <p className="font-medium text-gray-900">{booking.carType}</p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (SAR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Enter price"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Commission (SAR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.agentCommission}
                    onChange={(e) => setFormData(prev => ({ ...prev, agentCommission: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Enter commission"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Commission amount for the agent (if applicable)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pickup Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Time *
                  </label>
                  <input
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                  placeholder="Enter specific pickup location"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1a3a5f] flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  rows={4}
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                  placeholder="Enter any special instructions or requirements"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-[#1a3a5f] mb-2">Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Fare:</span>
                  <span className="font-medium">SAR {formData.price}</span>
                </div>
                {formData.agentCommission > 0 && (
                  <div className="flex justify-between">
                    <span>Agent Commission:</span>
                    <span className="font-medium text-green-600">SAR {formData.agentCommission}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Driver Share:</span>
                  <span className="font-medium text-blue-600">
                    SAR {(formData.price - formData.agentCommission).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1a3a5f] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#152b46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingEditModal;
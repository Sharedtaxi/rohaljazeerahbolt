import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Car, Calendar, DollarSign, User, Bell, MapPin, Clock, CheckCircle, AlertTriangle, Phone, Star, TrendingUp, Activity, Eye, Edit } from 'lucide-react';
import BookingDetailsModal from '../shared/BookingDetailsModal';
import BookingEditModal from '../shared/BookingEditModal';

const DriverPortal: React.FC = () => {
  const { setCurrentUser, setCurrentPortal, bookings, currentUser, updateBookingStatus, refreshBookings, updateBooking } = useApp();
  const [activeTab, setActiveTab] = useState('bookings');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('guest');
  };

  // Filter bookings for current driver
  const driverBookings = bookings.filter(booking => 
    booking.driver && booking.driver.name === currentUser?.name
  );

  const stats = {
    totalRides: driverBookings.length,
    completedRides: driverBookings.filter(b => b.status === 'completed').length,
    ongoingRides: driverBookings.filter(b => ['assigned', 'pickup', 'drop'].includes(b.status)).length,
    totalEarnings: driverBookings.reduce((sum, booking) => sum + (booking.price * 0.8), 0), // 80% driver share
    pendingPayment: driverBookings.filter(b => b.status === 'completed').reduce((sum, booking) => sum + (booking.price * 0.8), 0),
    rating: 4.8
  };

  const filteredBookings = driverBookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    try {
      updateBookingStatus(bookingId, newStatus as any);
      alert(`Booking #${bookingId.slice(-6)} status updated to: ${newStatus}`);
    } catch (error) {
      alert('Failed to update booking status. Please try again.');
    }
  };

  const handleViewBooking = (bookingId: string) => {
    const booking = driverBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForDetails(booking);
      setShowBookingDetailsModal(true);
    }
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = driverBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForEdit(booking);
      setShowEditModal(true);
    }
  };

  const handleSaveBooking = async (bookingId: string, updates: Partial<any>) => {
    try {
      await updateBooking(bookingId, updates);
      alert(`Booking #${bookingId.slice(-6)} updated successfully`);
      setShowEditModal(false);
      setSelectedBookingForEdit(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const handleCallCustomer = (customerPhone: string) => {
    // In a real app, this would integrate with a calling system
    if (confirm(`Call customer at ${customerPhone}?`)) {
      alert(`Calling ${customerPhone}...`);
    }
  };

  const renderMyBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">My Bookings</h1>
        <div className="flex space-x-3">
          <button 
            onClick={refreshBookings}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="pickup">Pickup</option>
            <option value="drop">Drop</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rides</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">{stats.totalRides}</p>
            </div>
            <Calendar className="h-8 w-8 text-[#e8b143]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedRides}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.ongoingRides}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.rating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">#{booking.id.slice(-6)}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'pickup' ? 'bg-orange-100 text-orange-800' :
                      booking.status === 'drop' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-medium text-gray-900">{booking.customer.name}</p>
                      <p className="text-sm text-gray-500">{booking.customer.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Route</p>
                      <p className="font-medium text-gray-900">{booking.route.from}</p>
                      <p className="text-sm text-gray-500">→ {booking.route.to}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Pickup Time</p>
                      <p className="font-medium text-gray-900">
                        {new Date(booking.pickupTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.pickupTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">Fare to Collect</p>
                        <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {booking.status === 'assigned' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'pickup')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Start Pickup
                        </button>
                      )}
                      {booking.status === 'pickup' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'drop')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Picked Up
                        </button>
                      )}
                      {booking.status === 'drop' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Complete Trip
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewBooking(booking.id)}
                        className="text-[#1a3a5f] hover:text-[#152b46] p-2"
                        title="View Booking"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditBooking(booking.id)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Edit Booking"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCallCustomer(booking.customer.phone)}
                        className="text-green-600 hover:text-green-800 p-2"
                        title="Call Customer"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {booking.specialInstructions && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Instructions:</strong> {booking.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings assigned</h3>
              <p className="text-gray-500">You don't have any bookings assigned yet. Check back later for new rides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMyVehicle = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">My Vehicle</h1>
        <button className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>Update Details</span>
        </button>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 bg-[#1a3a5f] rounded-full flex items-center justify-center">
            <Car className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Toyota Camry 2023</h3>
            <p className="text-gray-600">ABC-123</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Vehicle Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Car Type:</span>
                <span className="font-medium">Sedan (4 passengers)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">Toyota Camry 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plate Number:</span>
                <span className="font-medium">ABC-123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Color:</span>
                <span className="font-medium">White</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Documents & Expiry</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">License Expiry:</span>
                <span className="font-medium text-green-600">Valid until Dec 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Registration:</span>
                <span className="font-medium text-green-600">Valid until Mar 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Insurance:</span>
                <span className="font-medium text-orange-600">Expires in 2 months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inspection:</span>
                <span className="font-medium text-green-600">Valid until Jun 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Earnings & Dues</h1>
        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">SAR {stats.totalEarnings.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-600">SAR {stats.pendingPayment.toFixed(0)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold text-blue-600">80%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Penalties</p>
              <p className="text-2xl font-bold text-red-600">SAR 0</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Earnings Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Route</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Total Fare</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Your Share</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {driverBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-4 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm text-gray-900">
                    {booking.route.from} → {booking.route.to}
                  </td>
                  <td className="py-4 text-sm text-gray-900">SAR {booking.price}</td>
                  <td className="py-4 text-sm font-medium text-green-600">
                    SAR {(booking.price * 0.8).toFixed(0)}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {booking.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Notifications</h1>
        <button className="text-[#1a3a5f] hover:text-[#152b46] text-sm font-medium">
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          <div className="p-6 bg-blue-50">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New booking assigned</p>
                <p className="text-sm text-gray-600">You have been assigned a new booking from Jeddah Airport to Makkah Hotel</p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment received</p>
                <p className="text-sm text-gray-600">Your weekly payment of SAR 1,920 has been processed</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Insurance expiry reminder</p>
                <p className="text-sm text-gray-600">Your vehicle insurance will expire in 2 months. Please renew it soon.</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Trip completed</p>
                <p className="text-sm text-gray-600">Your trip from Downtown to Airport has been completed successfully</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Profile Management</h1>
        <button className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors">
          Save Changes
        </button>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              value={currentUser?.name || ''} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input 
              type="tel" 
              value="+966501234567" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={currentUser?.email || ''} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Car Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent">
              <option>Toyota Camry (4 passengers)</option>
              <option>Hyundai Starex (7 passengers)</option>
              <option>GMC Suburban (7 passengers)</option>
              <option>Toyota Hiace (12 passengers)</option>
              <option>Luxury Car</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Car Make</label>
            <input 
              type="text" 
              placeholder="e.g., Toyota"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Car Model</label>
            <input 
              type="text" 
              placeholder="e.g., Camry 2023"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
            <input 
              type="text" 
              placeholder="ABC-123"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Expiry</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
            <input 
              type="text" 
              value="DL123456789" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Iqama Number</label>
            <input 
              type="text" 
              placeholder="Iqama Number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'vehicle', label: 'My Vehicle', icon: Car },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <header className="bg-[#1a3a5f] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <Car className="h-8 w-8 text-[#e8b143]" />
              <span className="text-xl font-bold">ROH AL JAZEERA - Driver</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="mt-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 border-r-4 border-[#1a3a5f] text-[#1a3a5f]' : 'text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'bookings' && renderMyBookings()}
          {activeTab === 'vehicle' && renderMyVehicle()}
          {activeTab === 'earnings' && renderEarnings()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal 
        booking={selectedBookingForDetails}
        isOpen={showBookingDetailsModal}
        onClose={() => {
          setShowBookingDetailsModal(false);
          setSelectedBookingForDetails(null);
        }}
      />

      {/* Booking Edit Modal */}
      <BookingEditModal 
        booking={selectedBookingForEdit}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBookingForEdit(null);
        }}
        onSave={handleSaveBooking}
      />
    </div>
  );
};

export default DriverPortal;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Users, Calendar, DollarSign, User, Bell, Plus, Eye, Edit, Trash2, Phone, Car, MapPin, Clock, TrendingUp, Activity, CheckCircle, AlertTriangle, X, LayoutDashboard, CreditCard } from 'lucide-react';
import BookingDetailsModal from '../shared/BookingDetailsModal';
import BookingEditModal from '../shared/BookingEditModal';

const AgentPortal: React.FC = () => {
  const { setCurrentUser, setCurrentPortal, bookings, routes, carTypes, currentUser, addBooking, updateBookingStatus, refreshBookings, updateBooking, deleteBooking, markCommissionAsPaid } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    routeId: '',
    carType: '',
    pickupDate: '',
    pickupTime: '',
    pickupLocation: '',
    specialInstructions: '',
    agentCommission: ''
  });

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('guest');
  };

  // Filter bookings for current agent
  const agentBookings = bookings.filter(booking => 
    booking.agent && booking.agent.name === currentUser?.name
  );

  const stats = {
    totalBookings: agentBookings.length,
    pendingBookings: agentBookings.filter(b => b.status === 'pending').length,
    completedBookings: agentBookings.filter(b => b.status === 'completed').length,
    totalCommission: agentBookings.reduce((sum, booking) => sum + (booking.agentCommission || 0), 0),
    pendingCommission: agentBookings.filter(b => b.status === 'completed').reduce((sum, booking) => sum + (booking.agentCommission || 0), 0),
    avgCommission: agentBookings.length > 0 ? agentBookings.reduce((sum, booking) => sum + (booking.agentCommission || 0), 0) / agentBookings.length : 0,
    totalEarned: agentBookings.reduce((sum, booking) => sum + (booking.agentCommission || 0), 0),
    totalReceived: agentBookings.filter(b => b.commissionPaid).reduce((sum, booking) => sum + (booking.agentCommission || 0), 0),
    totalPending: agentBookings.filter(b => !b.commissionPaid && b.agentCommission > 0).reduce((sum, booking) => sum + (booking.agentCommission || 0), 0)
  };

  const filteredBookings = agentBookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const handleViewBooking = (bookingId: string) => {
    const booking = agentBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForDetails(booking);
      setShowBookingDetailsModal(true);
    }
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = agentBookings.find(b => b.id === bookingId);
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

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm(`Are you sure you want to delete booking #${bookingId.slice(-6)}?`)) {
      deleteBooking(bookingId)
        .then(() => {
          alert(`Booking #${bookingId.slice(-6)} deleted successfully`);
        })
        .catch((error) => {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking. Please try again.');
        });
    }
  };

  const handleCreateBooking = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.routeId || !formData.carType) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const selectedRoute = routes.find(r => r.id === formData.routeId);
      if (!selectedRoute) {
        alert('Invalid route selected');
        return;
      }

      const bookingData = {
        customerId: '',
        customer: {
          id: '',
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail
        },
        routeId: formData.routeId,
        route: selectedRoute,
        carType: formData.carType,
        status: 'pending' as const,
        pickupTime: `${formData.pickupDate}T${formData.pickupTime}`,
        pickupLocation: formData.pickupLocation || selectedRoute.from,
        specialInstructions: formData.specialInstructions,
        price: selectedRoute.pricing[formData.carType],
        agentCommission: parseFloat(formData.agentCommission) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addBooking(bookingData);
      setShowCreateModal(false);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        routeId: '',
        carType: '',
        pickupDate: '',
        pickupTime: '',
        pickupLocation: '',
        specialInstructions: '',
        agentCommission: ''
      });

      // Show success with booking details
      setTimeout(() => {
        const newBooking = agentBookings[0];
        if (newBooking) {
          setSelectedBookingForDetails(newBooking);
          setShowBookingDetailsModal(true);
        }
      }, 500);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const calculatePrice = () => {
    if (formData.routeId && formData.carType) {
      const route = routes.find(r => r.id === formData.routeId);
      if (route && route.pricing[formData.carType]) {
        return route.pricing[formData.carType];
      }
    }
    return 0;
  };

  const currentPrice = calculatePrice();

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Agent Dashboard</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Booking</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-[#e8b143]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-purple-600">SAR {stats.totalCommission.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {agentBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{booking.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">{booking.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
                  <p className="text-xs text-green-600">Commission: SAR {booking.agentCommission || 0}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">
                {stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Commission</span>
              <span className="font-bold text-purple-600">SAR {stats.avgCommission.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending Commission</span>
              <span className="font-bold text-orange-600">SAR {stats.pendingCommission.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-bold text-[#1a3a5f]">{stats.totalBookings} bookings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-[#e8b143]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-purple-600">SAR {stats.totalCommission.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
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
                      booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    <div>
                      <p className="text-sm text-gray-600">Commission</p>
                      <p className="font-bold text-green-600">SAR {booking.agentCommission || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Fare</p>
                        <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
                      </div>
                      {booking.driver && (
                        <div>
                          <p className="text-sm text-gray-600">Driver</p>
                          <p className="font-medium text-gray-900">{booking.driver.name}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewBooking(booking.id)}
                        className="text-blue-600 hover:text-blue-800 p-2"
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
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Delete Booking"
                      >
                        <Trash2 className="h-4 w-4" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-4">You haven't created any bookings yet. Start by creating your first booking.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors"
              >
                Create First Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Commission Tracking</h1>
        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Commission Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">SAR {stats.totalCommission.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-600">SAR {stats.pendingCommission.toFixed(0)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Commission</p>
              <p className="text-2xl font-bold text-blue-600">SAR {stats.avgCommission.toFixed(0)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bookings</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalBookings}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Commission Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Route</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Total Fare</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Commission</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-4 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm text-gray-900">{booking.customer.name}</td>
                  <td className="py-4 text-sm text-gray-900">
                    {booking.route.from} → {booking.route.to}
                  </td>
                  <td className="py-4 text-sm text-gray-900">SAR {booking.price}</td>
                  <td className="py-4 text-sm font-medium text-green-600">
                    SAR {booking.agentCommission || 0}
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
              <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Booking confirmed</p>
                <p className="text-sm text-gray-600">Your booking #001 has been confirmed and assigned to a driver</p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Commission earned</p>
                <p className="text-sm text-gray-600">You earned SAR 50 commission from booking #002</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Booking requires attention</p>
                <p className="text-sm text-gray-600">Customer requested changes to booking #003</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
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
              value="+966501234568" 
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Industry</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent">
              <option>Hotel</option>
              <option>Tourism Company</option>
              <option>Travel Agency</option>
              <option>Hajj & Umrah Services</option>
              <option>Corporate Services</option>
              <option>Individual Agent</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Iqama Number</label>
            <input 
              type="text" 
              placeholder="Iqama Number (Optional)"
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

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Accounts & Payments</h1>
        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned Commission</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">SAR {stats.totalEarned.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Received Commission</p>
              <p className="text-2xl font-bold text-green-600">SAR {stats.totalReceived.toFixed(0)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending Commission</p>
              <p className="text-2xl font-bold text-orange-600">SAR {stats.totalPending.toFixed(0)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Commission Payment Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Commission Payment Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Fare</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Commission Amount</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Payment Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agentBookings.filter(b => b.agentCommission > 0).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.customer.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {booking.route.from} → {booking.route.to}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">SAR {booking.price}</td>
                  <td className="py-4 px-6 text-sm font-medium text-green-600">
                    SAR {booking.agentCommission}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.commissionPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {booking.commissionPaid ? 'Received' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {!booking.commissionPaid && booking.agentCommission > 0 && (
                      <button 
                        onClick={() => {
                          if (confirm(`Mark commission as received for booking #${booking.id.slice(-6)}?`)) {
                            markCommissionAsPaid(booking.id)
                              .then(() => {
                                alert(`Commission marked as received for booking #${booking.id.slice(-6)}`);
                              })
                              .catch((error) => {
                                console.error('Error marking commission as paid:', error);
                                alert('Failed to mark commission as received. Please try again.');
                              });
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                      >
                        Mark as Received
                      </button>
                    )}
                    {booking.commissionPaid && (
                      <span className="text-green-600 text-sm font-medium">✓ Received</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {agentBookings.filter(b => b.agentCommission > 0).length === 0 && (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No commission bookings yet</h3>
              <p className="text-gray-500">Create bookings with commission to track your earnings here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
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
              <Users className="h-8 w-8 text-[#e8b143]" />
              <span className="text-xl font-bold">ROH AL JAZEERA - Agent</span>
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
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'bookings' && renderMyBookings()}
          {activeTab === 'commissions' && renderCommissions()}
          {activeTab === 'accounts' && renderAccounts()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a3a5f]">Create New Booking</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                    <input 
                      type="text" 
                      value={formData.customerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      value={formData.customerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="+966501234567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Route *</label>
                  <select 
                    value={formData.routeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, routeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    required
                  >
                    <option value="">Choose a route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.from} → {route.to} ({route.distance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Car Type *</label>
                  <select 
                    value={formData.carType}
                    onChange={(e) => setFormData(prev => ({ ...prev, carType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    required
                  >
                    <option value="">Choose a car type</option>
                    {carTypes.map(carType => (
                      <option key={carType.id} value={carType.id}>
                        {carType.icon} {carType.name} ({carType.capacity} passengers)
                      </option>
                    ))}
                  </select>
                </div>

                {currentPrice > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Route Price:</span>
                      <span className="text-lg font-bold text-[#1a3a5f]">SAR {currentPrice}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent Commission (SAR)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={formData.agentCommission}
                    onChange={(e) => setFormData(prev => ({ ...prev, agentCommission: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Enter your commission amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the commission amount you want to earn from this booking (e.g., 50 for SAR 50). Leave blank for no commission.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date *</label>
                    <input 
                      type="date" 
                      value={formData.pickupDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time *</label>
                    <input 
                      type="time" 
                      value={formData.pickupTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location Details</label>
                  <input 
                    type="text" 
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Specific pickup location or landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea 
                    rows={3}
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Any special requirements or instructions"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  className="flex-1 bg-[#1a3a5f] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#152b46] transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AgentPortal;
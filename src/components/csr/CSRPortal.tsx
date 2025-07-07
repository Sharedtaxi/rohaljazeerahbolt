import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Shield, Calendar, Phone, User, Bell, CheckCircle, Clock, AlertTriangle, Eye, Edit, Users, Car, MessageCircle, FileText } from 'lucide-react';
import BookingDetailsModal from '../shared/BookingDetailsModal';
import BookingEditModal from '../shared/BookingEditModal';

const CSRPortal: React.FC = () => {
  const { setCurrentUser, setCurrentPortal, bookings, currentUser, refreshBookings, updateBooking } = useApp();
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

  // Get all bookings for CSR view
  const allBookings = bookings;
  const pendingBookings = allBookings.filter(booking => booking.status === 'pending');
  const assignedBookings = allBookings.filter(booking => booking.status === 'assigned');

  const stats = {
    totalBookings: allBookings.length,
    pendingConfirmations: pendingBookings.length,
    confirmedToday: 12, // Mock data
    callsHandled: 45, // Mock data
    avgResponseTime: '2.3 min', // Mock data
  };

  const handleConfirmBooking = (bookingId: string) => {
    console.log(`Confirming booking: ${bookingId}`);
    alert(`Booking #${bookingId.slice(-6)} confirmed successfully!`);
  };

  const handleRejectBooking = (bookingId: string) => {
    console.log(`Rejecting booking: ${bookingId}`);
    if (confirm(`Are you sure you want to reject booking #${bookingId.slice(-6)}?`)) {
      alert(`Booking #${bookingId.slice(-6)} rejected`);
    }
  };

  const handleCallCustomer = (customerPhone: string) => {
    console.log(`Calling customer: ${customerPhone}`);
    alert(`Calling customer: ${customerPhone}`);
  };

  const handleViewBooking = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForDetails(booking);
      setShowBookingDetailsModal(true);
    }
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = allBookings.find(b => b.id === bookingId);
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

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Booking Management</h1>
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
            <option value="pending">Pending Confirmation</option>
            <option value="assigned">Confirmed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Confirmations</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingConfirmations}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Calls Handled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.callsHandled}</p>
            </div>
            <Phone className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Pending Confirmations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Pending Customer Confirmations</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingBookings.length > 0 ? pendingBookings.map((booking) => (
            <div key={booking.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">#{booking.id.slice(-6)}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Needs Confirmation
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
                      <p className="text-sm text-gray-600">Fare</p>
                      <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {booking.agent && (
                        <div>
                          <p className="text-sm text-gray-600">Created by Agent</p>
                          <p className="font-medium text-gray-900">{booking.agent.name}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleCallCustomer(booking.customer.phone)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call Customer</span>
                      </button>
                      <button 
                        onClick={() => handleConfirmBooking(booking.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Confirm Booking
                      </button>
                      <button 
                        onClick={() => handleRejectBooking(booking.id)}
                        className="text-red-600 hover:text-red-800 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reject
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
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending confirmations</h3>
              <p className="text-gray-500">All bookings have been confirmed or processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Fare</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.slice(0, 10).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.customer.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.route.from} → {booking.route.to}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-[#1a3a5f]">SAR {booking.price}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewBooking(booking.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Booking"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditBooking(booking.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit Booking"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCallCustomer(booking.customer.phone)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Call Customer"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerService = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Customer Service</h1>
      </div>

      {/* Service Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Calls Handled:</span>
              <span className="font-bold text-blue-600">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bookings Confirmed:</span>
              <span className="font-bold text-green-600">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Issues Resolved:</span>
              <span className="font-bold text-purple-600">8</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time:</span>
              <span className="font-bold text-green-600">2.3 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Satisfaction:</span>
              <span className="font-bold text-yellow-600">4.8/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resolution Rate:</span>
              <span className="font-bold text-blue-600">94%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => console.log('Calling next customer')}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Call Next Customer
            </button>
            <button 
              onClick={() => console.log('Viewing pending issues')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Pending Issues
            </button>
            <button 
              onClick={() => console.log('Generating report')}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Customer Interactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Recent Customer Interactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Called Ahmed Al-Rashid</p>
                <p className="text-sm text-gray-600">Confirmed booking #001 for Jeddah Airport pickup</p>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">WhatsApp message to Sarah Johnson</p>
                <p className="text-sm text-gray-600">Sent pickup details and driver information</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Resolved complaint from Omar Hassan</p>
                <p className="text-sm text-gray-600">Driver delay issue - provided compensation voucher</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
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
          <div className="p-6 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Urgent: Customer complaint</p>
                <p className="text-sm text-gray-600">Customer reporting driver no-show for booking #003</p>
                <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-orange-50">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Booking confirmation needed</p>
                <p className="text-sm text-gray-600">Agent booking #005 requires customer confirmation call</p>
                <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Booking confirmed successfully</p>
                <p className="text-sm text-gray-600">Customer confirmed pickup details for booking #002</p>
                <p className="text-xs text-gray-500 mt-1">30 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Follow-up call scheduled</p>
                <p className="text-sm text-gray-600">Reminder to call customer about tomorrow's booking</p>
                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
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
              value="+966501234570" 
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Passport/Iqama/CNIC Number</label>
            <input 
              type="text" 
              placeholder="Document Number"
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
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'customer-service', label: 'Customer Service', icon: MessageCircle },
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
              <Shield className="h-8 w-8 text-[#e8b143]" />
              <span className="text-xl font-bold">ROH AL JAZEERA - CSR</span>
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
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'customer-service' && renderCustomerService()}
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

export default CSRPortal;
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Users, Calendar, Car, Route, DollarSign, FileText, UserPlus, Plus, Edit, Trash2, Eye, Check, X, Filter, Download, Settings, Shield, UserCheck, Building2 } from 'lucide-react';
import BookingDetailsModal from '../shared/BookingDetailsModal';
import BookingEditModal from '../shared/BookingEditModal';

const AdminPortal: React.FC = () => {
  const { setCurrentUser, setCurrentPortal, bookings, routes, carTypes, drivers, agents, currentUser, addBooking, updateBookingStatus, assignBookingToDriver, deleteBooking, refreshBookings, updateBooking, markCommissionAsPaid } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'booking' | 'driver' | 'agent' | 'csr' | 'route' | 'cartype'>('booking');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedCarType, setSelectedCarType] = useState('');
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
    price: 0,
    agentCommission: 0
  });

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPortal('guest');
  };

  // Get all bookings for admin view
  const allBookings = bookings;

  const stats = {
    totalBookings: allBookings.length,
    pendingBookings: allBookings.filter(b => b.status === 'pending').length,
    completedBookings: allBookings.filter(b => b.status === 'completed').length,
    totalDrivers: drivers.length,
    onlineDrivers: drivers.filter(d => d.isOnline).length,
    totalAgents: agents.length,
    totalRoutes: routes.length,
    totalCarTypes: carTypes.length,
    totalRevenue: allBookings.reduce((sum, booking) => sum + booking.price, 0),
    totalCommissions: allBookings.reduce((sum, booking) => sum + (booking.agentCommission || 0), 0),
    pendingPayments: allBookings.filter(b => b.status === 'completed').length * 150, // Estimated pending
    bookingsBySource: {
      guest: allBookings.filter(b => !b.agent).length,
      agent: allBookings.filter(b => b.agent).length,
      admin: allBookings.filter(b => !b.agent && !b.driver).length // Admin created bookings
    }
  };

  const handleAssignToDriver = (bookingId: string) => {
    const availableDrivers = drivers.filter(d => d.isOnline);
    if (availableDrivers.length === 0) {
      alert('No drivers are currently online. Please try again later.');
      return;
    }
    
    const driverNames = availableDrivers.map(d => `${d.name} (${d.carType})`).join('\n');
    const selectedDriver = prompt(`Select a driver for booking #${bookingId.slice(-6)}:\n\n${driverNames}\n\nEnter driver name:`);
    
    if (selectedDriver) {
      const driver = availableDrivers.find(d => d.name.toLowerCase().includes(selectedDriver.toLowerCase()));
      if (driver) {
        assignBookingToDriver(bookingId, driver.id);
        alert(`Booking #${bookingId.slice(-6)} assigned to ${driver.name}`);
      } else {
        alert('Driver not found. Please try again.');
      }
    }
  };

  const handleApproveBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'assigned');
    alert(`Booking #${bookingId.slice(-6)} approved and ready for driver assignment`);
  };

  const handleCreateBooking = async () => {
    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.routeId || !formData.carType) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const bookingData = {
        customerId: '',
        customer: {
          id: '',
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail
        },
        routeId: formData.routeId,
        route: routes.find(r => r.id === formData.routeId)!,
        carType: formData.carType,
        status: 'pending' as const,
        pickupTime: `${formData.pickupDate}T${formData.pickupTime}`,
        pickupLocation: formData.pickupLocation || routes.find(r => r.id === formData.routeId)?.from || '',
        specialInstructions: formData.specialInstructions,
        price: currentPrice,
        agentCommission: parseFloat(formData.agentCommission.toString()) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addBooking(bookingData);
      alert('Booking created successfully!');
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
        price: 0,
        agentCommission: 0
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
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

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        deleteBooking(bookingId);
        alert(`Booking #${bookingId.slice(-6)} deleted successfully`);
      } catch (error) {
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  const handleRouteChange = (routeId: string) => {
    setFormData(prev => ({ ...prev, routeId }));
    setSelectedRoute(routeId);
    const route = routes.find(r => r.id === routeId);
    if (route && formData.carType) {
      setFormData(prev => ({ ...prev, price: route.pricing[formData.carType] || 0 }));
    }
  };

  const handleCarTypeChange = (carType: string) => {
    setFormData(prev => ({ ...prev, carType }));
    setSelectedCarType(carType);
    const route = routes.find(r => r.id === formData.routeId);
    if (route) {
      setFormData(prev => ({ ...prev, price: route.pricing[carType] || 0 }));
    }
  };

  // Calculate price when both route and car type are selected
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

  const filteredBookings = allBookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <button className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-[#1a3a5f]">{stats.totalBookings}</p>
              <p className="text-xs text-gray-500 mt-1">
                Guest: {stats.bookingsBySource.guest} | Agent: {stats.bookingsBySource.agent}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-[#e8b143]" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineDrivers}/{stats.totalDrivers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.onlineDrivers / stats.totalDrivers) * 100).toFixed(0)}% online
              </p>
            </div>
            <Car className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">SAR {stats.totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Commissions: SAR {stats.totalCommissions.toFixed(0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-xs text-gray-500 mt-1">
                All systems operational
              </p>
            </div>
            <Settings className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Booking Sources Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Booking Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Guest Bookings
              </span>
              <span className="font-bold text-blue-600">{stats.bookingsBySource.guest}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Agent Bookings
              </span>
              <span className="font-bold text-green-600">{stats.bookingsBySource.agent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Admin Bookings
              </span>
              <span className="font-bold text-purple-600">{stats.bookingsBySource.admin}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {allBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{booking.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">{booking.customer.name}</p>
                  <p className="text-xs text-gray-500">
                    {booking.agent ? `Agent: ${booking.agent.name}` : 'Guest booking'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
                  {booking.agentCommission > 0 && (
                    <p className="text-xs text-green-600">Comm: SAR {booking.agentCommission}</p>
                  )}
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
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Routes</span>
              <span className="font-bold text-[#1a3a5f]">{stats.totalRoutes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Car Types</span>
              <span className="font-bold text-[#1a3a5f]">{stats.totalCarTypes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Agents</span>
              <span className="font-bold text-[#1a3a5f]">{stats.totalAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-green-600">
                {stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="completed">Completed</option>
          </select>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => {
              setCreateType('booking');
              setShowCreateModal(true);
            }}
            className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">All Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Source</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date & Time</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Route</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Car Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Driver</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Fare</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.customer.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {booking.agent ? (
                      <span className="flex items-center text-green-600">
                        <Building2 className="h-3 w-3 mr-1" />
                        Agent
                      </span>
                    ) : (
                      <span className="flex items-center text-blue-600">
                        <Users className="h-3 w-3 mr-1" />
                        Guest
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{new Date(booking.pickupTime).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(booking.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.route.from} → {booking.route.to}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.carType}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.driver?.name || 'Unassigned'}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div className="font-bold text-[#1a3a5f]">SAR {booking.price}</div>
                    {booking.agentCommission > 0 && (
                      <div className="text-xs text-green-600">Comm: SAR {booking.agentCommission}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveBooking(booking.id)}
                            className="text-green-600 hover:text-green-800 px-2 py-1 text-xs border border-green-300 rounded hover:bg-green-50"
                            title="Approve Booking"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAssignToDriver(booking.id)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs border border-blue-300 rounded hover:bg-blue-50"
                            title="Assign to Driver"
                          >
                            Assign
                          </button>
                        </>
                      )}
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
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Booking"
                      >
                        <Trash2 className="h-4 w-4" />
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

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Driver Management</h1>
        <button 
          onClick={() => {
            setCreateType('driver');
            setShowCreateModal(true);
          }}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Driver</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">All Drivers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Car Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Plate Number</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Rating</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{driver.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{driver.phone}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{driver.carType}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{driver.plateNumber}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{driver.rating}/5</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => alert(`Viewing driver: ${driver.name}`)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Driver"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => alert(`Editing driver: ${driver.name}`)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit Driver"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete driver: ${driver.name}?`)) {
                            alert(`Driver ${driver.name} deleted`);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Driver"
                      >
                        <Trash2 className="h-4 w-4" />
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

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Agent Management</h1>
        <button 
          onClick={() => {
            setCreateType('agent');
            setShowCreateModal(true);
          }}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Agent</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">All Agents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Bookings Created</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Commission</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agents.map((agent) => {
                const agentBookings = allBookings.filter(b => b.agent?.id === agent.id);
                const totalCommission = agentBookings.reduce((sum, b) => sum + (b.agentCommission || 0), 0);
                
                return (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{agent.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{agent.phone}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{agent.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{agentBookings.length}</td>
                    <td className="py-4 px-6 text-sm font-medium text-green-600">SAR {totalCommission.toFixed(0)}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing agent: ${agent.name}`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Agent"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Editing agent: ${agent.name}`)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Edit Agent"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete agent: ${agent.name}?`)) {
                              alert(`Agent ${agent.name} deleted`);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Agent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCSR = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">CSR Management</h1>
        <button 
          onClick={() => {
            setCreateType('csr');
            setShowCreateModal(true);
          }}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add CSR</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Customer Service Representatives</h3>
        <p className="text-gray-600 mb-4">Manage CSR team members who handle customer confirmations and support.</p>
        
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CSR members yet</h3>
          <p className="text-gray-500 mb-4">Add CSR team members to handle customer service operations.</p>
          <button 
            onClick={() => {
              setCreateType('csr');
              setShowCreateModal(true);
            }}
            className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors"
          >
            Add First CSR
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Route Management</h1>
        <button 
          onClick={() => {
            setCreateType('route');
            setShowCreateModal(true);
          }}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Route</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">All Routes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {routes.map((route) => (
            <div key={route.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{route.from} → {route.to}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>{route.distance}</span>
                    <span>•</span>
                    <span>{route.duration}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(route.pricing).map(([carType, price]) => (
                      <div key={carType} className="text-sm">
                        <span className="text-gray-600 capitalize">{carType}:</span>
                        <span className="font-bold text-[#1a3a5f] ml-1">SAR {price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => alert(`Editing route: ${route.from} → ${route.to}`)}
                    className="text-green-600 hover:text-green-800 p-2"
                    title="Edit Route"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete route: ${route.from} → ${route.to}?`)) {
                        alert(`Route ${route.from} → ${route.to} deleted`);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete Route"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCarTypes = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Car Type Management</h1>
        <button 
          onClick={() => {
            setCreateType('cartype');
            setShowCreateModal(true);
          }}
          className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Car Type</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">All Car Types</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Icon</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Capacity</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Features</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {carTypes.map((carType) => (
                <tr key={carType.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-2xl">{carType.icon}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{carType.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{carType.capacity}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{carType.description}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {carType.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-[#1a3a5f] px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => alert(`Editing car type: ${carType.name}`)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Edit Car Type"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete car type: ${carType.name}?`)) {
                            alert(`Car type ${carType.name} deleted`);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Car Type"
                      >
                        <Trash2 className="h-4 w-4" />
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

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1a3a5f]">Accounts & Payments</h1>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Mark Payments
          </button>
          <button className="bg-[#1a3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#152b46] transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Driver Payments</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Due:</span>
              <span className="font-bold text-orange-600">SAR 2,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid:</span>
              <span className="font-bold text-green-600">SAR 1,200</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Agent Commissions</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Due:</span>
              <span className="font-bold text-orange-600">SAR {stats.totalCommissions.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paid:</span>
              <span className="font-bold text-green-600">SAR 450</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Revenue</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-[#1a3a5f]">SAR {stats.totalRevenue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Profit:</span>
              <span className="font-bold text-purple-600">SAR {(stats.totalRevenue * 0.3).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Payment Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#1a3a5f]">Agent Commission Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Booking ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Agent</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Fare</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Commission</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allBookings.filter(b => b.agent && b.agentCommission > 0).slice(0, 10).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-[#1a3a5f]">#{booking.id.slice(-6)}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.agent?.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{booking.customer.name}</td>
                  <td className="py-4 px-6 text-sm font-bold text-[#1a3a5f]">SAR {booking.price}</td>
                  <td className="py-4 px-6 text-sm font-bold text-green-600">SAR {booking.agentCommission}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.commissionPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {booking.commissionPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {!booking.commissionPaid && (
                      <button 
                        onClick={() => {
                          if (confirm(`Mark commission as paid for booking #${booking.id.slice(-6)}?`)) {
                            markCommissionAsPaid(booking.id)
                              .then(() => {
                                alert(`Commission marked as paid for booking #${booking.id.slice(-6)}`);
                              })
                              .catch((error) => {
                                console.error('Error marking commission as paid:', error);
                                alert('Failed to mark commission as paid. Please try again.');
                              });
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-300 rounded hover:bg-green-50 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                    {booking.commissionPaid && (
                      <span className="text-green-600 text-sm font-medium">✓ Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'drivers', label: 'Drivers', icon: Car },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'csr', label: 'CSR', icon: Shield },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'cartypes', label: 'Car Types', icon: Car },
    { id: 'accounts', label: 'Accounts', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Header */}
      <header className="bg-[#1a3a5f] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-white">
              <Shield className="h-8 w-8 text-[#e8b143]" />
              <span className="text-xl font-bold">ROH AL JAZEERA - Admin</span>
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
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'drivers' && renderDrivers()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'csr' && renderCSR()}
          {activeTab === 'routes' && renderRoutes()}
          {activeTab === 'cartypes' && renderCarTypes()}
          {activeTab === 'accounts' && renderAccounts()}
        </div>
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#1a3a5f]">
                Create {createType === 'booking' ? 'New Booking' : createType === 'cartype' ? 'Car Type' : createType.charAt(0).toUpperCase() + createType.slice(1)}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
              {createType === 'booking' && (
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
                      onChange={(e) => handleRouteChange(e.target.value)}
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
                      onChange={(e) => handleCarTypeChange(e.target.value)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Commission (SAR)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.agentCommission}
                      onChange={(e) => setFormData(prev => ({ ...prev, agentCommission: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Enter commission amount (optional)"
                    />
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
              )}
              
              {createType !== 'booking' && (
                <p className="text-gray-600">Create {createType} form will be implemented here.</p>
              )}
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
                  onClick={createType === 'booking' ? handleCreateBooking : () => setShowCreateModal(false)}
                  className="flex-1 bg-[#1a3a5f] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#152b46] transition-colors"
                >
                  {createType === 'booking' ? 'Create Booking' : 'Create'}
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

export default AdminPortal;
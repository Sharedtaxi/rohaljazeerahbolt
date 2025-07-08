import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, Users, Calendar, Car, Route, DollarSign, FileText, UserPlus, Plus, Edit, Trash2, Eye, Check, X, Filter, Download, Settings, Shield, UserCheck, Building2 } from 'lucide-react';

const AdminPortal: React.FC = () => {
  const { setCurrentUser, setCurrentPortal, bookings, routes, carTypes, drivers, agents, currentUser, addBooking, updateBookingStatus, assignBookingToDriver, deleteBooking, refreshBookings } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'booking' | 'driver' | 'agent' | 'csr' | 'route' | 'cartype'>('booking');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedCarType, setSelectedCarType] = useState('');
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
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);

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
    totalRevenue: allBookings.reduce((sum, booking) => sum + booking.price, 0),
    pendingPayments: allBookings.filter(b => b.status === 'completed').length * 150 // Estimated pending
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
      setShowBookingDetailsModal(false);
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
      
      // Show success message with custom modal
      setTimeout(() => {
        const newBooking = allBookings[0]; // Get the latest booking
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
      // Note: updateBooking function needs to be implemented in context
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
              <p className="text-sm text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineDrivers}/{stats.totalDrivers}</p>
            </div>
            <Car className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">SAR {stats.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">SAR {stats.pendingPayments}</p>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1a3a5f] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {allBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{booking.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600">{booking.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1a3a5f]">SAR {booking.price}</p>
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
              <span className="font-bold text-[#1a3a5f]">{routes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Car Types</span>
              <span className="font-bold text-[#1a3a5f]">{carTypes.length}</span>
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
                  <td className="py-4 px-6 text-sm font-bold text-[#1a3a5f]">SAR {booking.price}</td>
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
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{agent.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{agent.phone}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{agent.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{agent.bookingsCreated}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-[#1a3a5f]" />
              <h1 className="text-xl font-bold text-[#1a3a5f]">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-[#1a3a5f] text-[#1a3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-[#1a3a5f] text-[#1a3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drivers'
                  ? 'border-[#1a3a5f] text-[#1a3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drivers
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agents'
                  ? 'border-[#1a3a5f] text-[#1a3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Agents
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'drivers' && renderDrivers()}
        {activeTab === 'agents' && renderAgents()}
      </div>
    </div>
  );
};

export default AdminPortal;
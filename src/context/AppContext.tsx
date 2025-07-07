import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Booking, User, BookingStatus, CarType, Route, Driver, Agent, Customer } from '../types';
import { supabaseHelpers } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  bookings: Booking[];
  carTypes: CarType[];
  routes: Route[];
  drivers: Driver[];
  agents: Agent[];
  currentPortal: 'guest' | 'admin' | 'agent' | 'driver' | 'csr';
  loading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setCurrentPortal: (portal: 'guest' | 'admin' | 'agent' | 'driver' | 'csr') => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, driverId?: string) => Promise<void>;
  refreshData: () => Promise<void>;
  resetBookingState: () => void;
  refreshBookings: () => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  markCommissionAsPaid: (bookingId: string) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  // New functions for complete workflow
  assignBookingToDriver: (bookingId: string, driverId: string) => Promise<void>;
  releaseBookingFromDriver: (bookingId: string) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;
  getBookingsByCarType: (carType: string) => Booking[];
  getAvailableDriversByCarType: (carType: string) => Driver[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPortal, setCurrentPortal] = useState<'guest' | 'admin' | 'agent' | 'driver' | 'csr'>('guest');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform database data to app format
  const transformBookingData = (dbBooking: any): Booking => {
    try {
      return {
        id: dbBooking.id,
        customerId: dbBooking.customer_id,
        customer: {
          id: dbBooking.customers?.id || dbBooking.customer_id,
          name: dbBooking.customers?.name || 'Unknown Customer',
          phone: dbBooking.customers?.phone || '',
          email: dbBooking.customers?.email
        },
        routeId: dbBooking.route_id,
        route: {
          id: dbBooking.routes?.id || dbBooking.route_id,
          from: dbBooking.routes?.from_location || 'Unknown',
          to: dbBooking.routes?.to_location || 'Unknown',
          distance: dbBooking.routes?.distance || '0 km',
          duration: dbBooking.routes?.duration || '0 min',
          pricing: dbBooking.routes?.pricing || {}
        },
        carType: dbBooking.car_type,
        driverId: dbBooking.driver_id,
        driver: dbBooking.drivers ? {
          id: dbBooking.drivers.id,
          name: dbBooking.drivers.name,
          phone: dbBooking.drivers.phone,
          carType: dbBooking.drivers.car_type,
          carModel: dbBooking.drivers.car_model,
          plateNumber: dbBooking.drivers.plate_number,
          rating: dbBooking.drivers.rating,
          isOnline: dbBooking.drivers.is_online
        } : undefined,
        agentId: dbBooking.agent_id,
        agent: dbBooking.agents ? {
          id: dbBooking.agents.id,
          name: dbBooking.agents.name,
          phone: dbBooking.agents.phone,
          email: dbBooking.agents.email,
          bookingsCreated: dbBooking.agents.bookings_created
        } : undefined,
        status: dbBooking.status as BookingStatus,
        pickupTime: dbBooking.pickup_time,
        pickupLocation: dbBooking.pickup_location,
        specialInstructions: dbBooking.special_instructions,
        price: dbBooking.price,
        agentCommission: parseFloat(dbBooking.agent_commission) || 0,
        commissionPaid: dbBooking.agent_commission_paid || false,
        createdAt: dbBooking.created_at,
        updatedAt: dbBooking.updated_at
      };
    } catch (error) {
      console.error('Error transforming booking data:', error, dbBooking);
      throw error;
    }
  };

  const transformCarTypeData = (dbCarType: any): CarType => ({
    id: dbCarType.id,
    name: dbCarType.name,
    description: dbCarType.description,
    capacity: dbCarType.capacity,
    features: dbCarType.features || [],
    icon: dbCarType.icon
  });

  const transformRouteData = (dbRoute: any): Route => ({
    id: dbRoute.id,
    from: dbRoute.from_location,
    to: dbRoute.to_location,
    distance: dbRoute.distance,
    duration: dbRoute.duration,
    pricing: dbRoute.pricing || {}
  });

  const transformDriverData = (dbDriver: any): Driver => ({
    id: dbDriver.id,
    name: dbDriver.name,
    phone: dbDriver.phone,
    carType: dbDriver.car_type,
    carModel: dbDriver.car_model,
    plateNumber: dbDriver.plate_number,
    rating: dbDriver.rating,
    isOnline: dbDriver.is_online
  });

  const transformAgentData = (dbAgent: any): Agent => ({
    id: dbAgent.id,
    name: dbAgent.name,
    phone: dbAgent.phone,
    email: dbAgent.email,
    bookingsCreated: dbAgent.bookings_created
  });

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading initial data...');
      
      // Load all data in parallel with error handling
      const results = await Promise.allSettled([
        supabaseHelpers.getCarTypes(),
        supabaseHelpers.getRoutes(),
        supabaseHelpers.getBookings(),
        supabaseHelpers.getDrivers(),
        supabaseHelpers.getAgents()
      ]);

      // Handle car types
      if (results[0].status === 'fulfilled') {
        const carTypesData = results[0].value.map(transformCarTypeData);
        setCarTypes(carTypesData);
        console.log('✅ Car types loaded:', carTypesData.length);
      } else {
        console.error('❌ Error loading car types:', results[0].reason);
        setCarTypes([]);
      }

      // Handle routes
      if (results[1].status === 'fulfilled') {
        const routesData = results[1].value.map(transformRouteData);
        setRoutes(routesData);
        console.log('✅ Routes loaded:', routesData.length);
      } else {
        console.error('❌ Error loading routes:', results[1].reason);
        setRoutes([]);
      }

      // Handle bookings
      if (results[2].status === 'fulfilled') {
        const bookingsData = results[2].value.map(transformBookingData);
        setBookings(bookingsData);
        console.log('✅ Bookings loaded:', bookingsData.length);
      } else {
        console.error('❌ Error loading bookings:', results[2].reason);
        setBookings([]);
      }

      // Handle drivers
      if (results[3].status === 'fulfilled') {
        const driversData = results[3].value.map(transformDriverData);
        setDrivers(driversData);
        console.log('✅ Drivers loaded:', driversData.length);
      } else {
        console.error('❌ Error loading drivers:', results[3].reason);
        setDrivers([]);
      }

      // Handle agents
      if (results[4].status === 'fulfilled') {
        const agentsData = results[4].value.map(transformAgentData);
        setAgents(agentsData);
        console.log('✅ Agents loaded:', agentsData.length);
      } else {
        console.error('❌ Error loading agents:', results[4].reason);
        setAgents([]);
      }

      // Check if any critical data failed to load
      const failedLoads = results.filter(r => r.status === 'rejected');
      if (failedLoads.length > 0) {
        setError(`Failed to load some data. Check console for details.`);
      }

      console.log('✅ Initial data loading completed');

    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setError('Failed to load application data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const refreshBookings = async () => {
    try {
      console.log('🔄 Refreshing bookings...');
      const bookingsData = await supabaseHelpers.getBookings();
      const transformedBookings = bookingsData.map(transformBookingData);
      setBookings(transformedBookings);
      console.log('✅ Bookings refreshed:', transformedBookings.length);
    } catch (error) {
      console.error('❌ Error refreshing bookings:', error);
      throw error;
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Creating booking...', bookingData);
      
      // Validate required fields
      if (!bookingData.customer?.name?.trim()) {
        throw new Error('Customer name is required');
      }
      
      if (!bookingData.customer?.phone?.trim()) {
        throw new Error('Customer phone is required');
      }
      
      if (!bookingData.routeId?.trim()) {
        throw new Error('Route is required');
      }
      
      if (!bookingData.carType?.trim()) {
        throw new Error('Car type is required');
      }
      
      if (!bookingData.pickupTime) {
        throw new Error('Pickup time is required');
      }
      
      if (!bookingData.pickupLocation?.trim()) {
        throw new Error('Pickup location is required');
      }
      
      if (!bookingData.price || bookingData.price <= 0) {
        throw new Error('Valid price is required');
      }

      // Validate pickup time is at least 15 minutes from now
      const pickupTime = new Date(bookingData.pickupTime);
      const now = new Date();
      const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
      
      if (pickupTime < minTime) {
        throw new Error('Pickup time must be at least 15 minutes from now');
      }

      // First create or get customer
      let customer: Customer;
      try {
        // Check if customer already exists by phone
        const existingCustomers = await supabaseHelpers.getCustomerByPhone(bookingData.customer.phone);
        
        if (existingCustomers && existingCustomers.length > 0) {
          customer = {
            id: existingCustomers[0].id,
            name: existingCustomers[0].name,
            phone: existingCustomers[0].phone,
            email: existingCustomers[0].email
          };
          console.log('✅ Using existing customer:', customer.id);
        } else {
          // Create new customer
          const newCustomer = await supabaseHelpers.createCustomer({
            name: bookingData.customer.name.trim(),
            phone: bookingData.customer.phone.trim(),
            email: bookingData.customer.email?.trim() || null
          });
          
          customer = {
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email
          };
          console.log('✅ Created new customer:', customer.id);
        }
      } catch (customerError) {
        console.error('❌ Error handling customer:', customerError);
        throw new Error('Failed to create or find customer');
      }

      // Validate route exists
      const route = routes.find(r => r.id === bookingData.routeId);
      if (!route) {
        throw new Error('Selected route not found');
      }

      // Validate car type exists
      const carType = carTypes.find(ct => ct.id === bookingData.carType);
      if (!carType) {
        throw new Error('Selected car type not found');
      }

      // Get current user's agent ID if they are an agent
      let agentId: string | null = null;
      if (currentUser?.role === 'agent') {
        const userAgent = agents.find(a => a.email === currentUser.email);
        if (userAgent) {
          agentId = userAgent.id;
        }
      }

      // Ensure commission is properly formatted
      const agentCommission = bookingData.agentCommission || 0;
      console.log('💰 Agent commission being saved:', agentCommission);

      // Create booking with validated data
      const dbBooking = await supabaseHelpers.createBooking({
        customer_id: customer.id,
        route_id: bookingData.routeId.trim(),
        car_type: bookingData.carType.trim(),
        agent_id: agentId, // Will be null for guest bookings
        pickup_time: bookingData.pickupTime,
        pickup_location: bookingData.pickupLocation.trim(),
        special_instructions: bookingData.specialInstructions?.trim() || null,
        price: Number(bookingData.price),
        agent_commission: Number(agentCommission)
      });

      const newBooking = transformBookingData(dbBooking);
      setBookings(prev => [newBooking, ...prev]);
      
      console.log('✅ Booking created successfully:', newBooking.id);
      console.log('💰 Commission saved:', newBooking.agentCommission);

      // Update agent booking count if applicable
      if (agentId) {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, bookingsCreated: agent.bookingsCreated + 1 }
            : agent
        ));
      }

    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('foreign key constraint')) {
        if (error.message.includes('route_id')) {
          throw new Error('Selected route is invalid. Please choose a different route.');
        } else if (error.message.includes('car_type')) {
          throw new Error('Selected car type is invalid. Please choose a different car type.');
        } else if (error.message.includes('customer_id')) {
          throw new Error('Customer information is invalid. Please check the details.');
        } else {
          throw new Error('Invalid booking data. Please check all fields and try again.');
        }
      } else if (error.message?.includes('violates check constraint')) {
        throw new Error('Invalid booking status or data format.');
      } else if (error.message?.includes('duplicate key')) {
        throw new Error('A booking with similar details already exists.');
      } else {
        throw new Error(error.message || 'Failed to create booking. Please try again.');
      }
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus, driverId?: string) => {
    try {
      console.log('🔄 Updating booking status:', bookingId, status, driverId);
      
      const updatedBooking = await supabaseHelpers.updateBookingStatus(bookingId, status, driverId);
      const transformedBooking = transformBookingData(updatedBooking);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? transformedBooking : booking
        )
      );
      
      console.log('✅ Booking status updated successfully');

    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      throw error;
    }
  };

  // New function to assign booking to specific driver
  const assignBookingToDriver = async (bookingId: string, driverId: string) => {
    try {
      console.log('🔄 Assigning booking to driver:', bookingId, driverId);
      
      const updatedBooking = await supabaseHelpers.updateBookingStatus(bookingId, 'assigned', driverId);
      const transformedBooking = transformBookingData(updatedBooking);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? transformedBooking : booking
        )
      );
      
      console.log('✅ Booking assigned to driver successfully');

    } catch (error) {
      console.error('❌ Error assigning booking to driver:', error);
      throw error;
    }
  };

  // New function to release booking from driver (back to pending)
  const releaseBookingFromDriver = async (bookingId: string) => {
    try {
      console.log('🔄 Releasing booking from driver:', bookingId);
      
      const updatedBooking = await supabaseHelpers.updateBookingStatus(bookingId, 'pending', null);
      const transformedBooking = transformBookingData(updatedBooking);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? transformedBooking : booking
        )
      );
      
      console.log('✅ Booking released from driver successfully');

    } catch (error) {
      console.error('❌ Error releasing booking from driver:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      console.log('🔄 Updating booking in context:', bookingId, updates);
      
      // Prepare updates for database
      const dbUpdates: any = {};
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.agentCommission !== undefined) dbUpdates.agent_commission = updates.agentCommission;
      if (updates.commissionPaid !== undefined) dbUpdates.agent_commission_paid = updates.commissionPaid;
      if (updates.specialInstructions !== undefined) dbUpdates.special_instructions = updates.specialInstructions;
      if (updates.pickupTime !== undefined) dbUpdates.pickup_time = updates.pickupTime;
      if (updates.pickupLocation !== undefined) dbUpdates.pickup_location = updates.pickupLocation;
      
      const updatedBooking = await supabaseHelpers.updateBooking(bookingId, dbUpdates);
      const transformedBooking = transformBookingData(updatedBooking);
      
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? transformedBooking : booking
        )
      );
      
      console.log('✅ Booking updated successfully in context');

    } catch (error) {
      console.error('❌ Error updating booking in context:', error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      console.log('🔄 Deleting booking in context:', bookingId);
      
      await supabaseHelpers.deleteBooking(bookingId);
      
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      console.log('✅ Booking deleted successfully in context');

    } catch (error) {
      console.error('❌ Error deleting booking in context:', error);
      throw error;
    }
  };

  const markCommissionAsPaid = async (bookingId: string) => {
    try {
      console.log('🔄 Marking commission as paid:', bookingId);
      
      await updateBooking(bookingId, { commissionPaid: true });
      
      console.log('✅ Commission marked as paid successfully');

    } catch (error) {
      console.error('❌ Error marking commission as paid:', error);
      throw error;
    }
  };

  // Get bookings by car type (for driver filtering)
  const getBookingsByCarType = (carType: string): Booking[] => {
    return bookings.filter(booking => booking.carType === carType);
  };

  // Get available drivers by car type
  const getAvailableDriversByCarType = (carType: string): Driver[] => {
    return drivers.filter(driver => 
      driver.carType === carType && driver.isOnline
    );
  };

  // Function to reset booking state - this will be called when logo is clicked
  const resetBookingState = () => {
    // Dispatch a custom event that the GuestPortal can listen to
    window.dispatchEvent(new CustomEvent('resetBookingState'));
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const bookingsSubscription = supabaseHelpers.subscribeToBookings((payload) => {
      console.log('📡 Booking update received:', payload);
      // Refresh bookings when changes occur
      refreshData();
    });

    const driversSubscription = supabaseHelpers.subscribeToDrivers((payload) => {
      console.log('📡 Driver update received:', payload);
      // Refresh drivers when changes occur
      refreshData();
    });

    return () => {
      bookingsSubscription.unsubscribe();
      driversSubscription.unsubscribe();
    };
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const value = {
    currentUser,
    bookings,
    carTypes,
    routes,
    drivers,
    agents,
    currentPortal,
    loading,
    error,
    setCurrentUser,
    setCurrentPortal,
    addBooking,
    updateBookingStatus,
    refreshData,
    resetBookingState,
    refreshBookings,
    updateBooking,
    deleteBooking,
    markCommissionAsPaid,
    assignBookingToDriver,
    releaseBookingFromDriver,
    getBookingsByCarType,
    getAvailableDriversByCarType
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
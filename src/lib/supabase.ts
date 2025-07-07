import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with additional options for better error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Test connection with better error handling
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('car_types')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.error('❌ Supabase connection exception:', error);
  }
};

// Test connection on initialization
testConnection();

// Helper functions for database operations
export const supabaseHelpers = {
  // Car Types
  async getCarTypes() {
    try {
      const { data, error } = await supabase
        .from('car_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching car types:', error);
        throw error;
      }
      
      console.log('✅ Loaded car types:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception fetching car types:', error);
      throw error;
    }
  },

  async createCarType(carType: { id: string; name: string; description: string; capacity: number; features: string[]; icon: string }) {
    try {
      const { data, error } = await supabase
        .from('car_types')
        .insert(carType)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating car type:', error);
        throw error;
      }
      
      console.log('✅ Created car type:', data.id);
      return data;
    } catch (error) {
      console.error('Exception creating car type:', error);
      throw error;
    }
  },

  async updateCarType(id: string, updates: Partial<{ name: string; description: string; capacity: number; features: string[]; icon: string }>) {
    try {
      const { data, error } = await supabase
        .from('car_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating car type:', error);
        throw error;
      }
      
      console.log('✅ Updated car type:', data.id);
      return data;
    } catch (error) {
      console.error('Exception updating car type:', error);
      throw error;
    }
  },

  async deleteCarType(id: string) {
    try {
      const { error } = await supabase
        .from('car_types')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting car type:', error);
        throw error;
      }
      
      console.log('✅ Deleted car type:', id);
    } catch (error) {
      console.error('Exception deleting car type:', error);
      throw error;
    }
  },

  // Routes
  async getRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('from_location');
      
      if (error) {
        console.error('Error fetching routes:', error);
        throw error;
      }
      
      console.log('✅ Loaded routes:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception fetching routes:', error);
      throw error;
    }
  },

  async createRoute(route: { id: string; from_location: string; to_location: string; distance: string; duration: string; pricing: Record<string, number> }) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert(route)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating route:', error);
        throw error;
      }
      
      console.log('✅ Created route:', data.id);
      return data;
    } catch (error) {
      console.error('Exception creating route:', error);
      throw error;
    }
  },

  async updateRoute(id: string, updates: Partial<{ from_location: string; to_location: string; distance: string; duration: string; pricing: Record<string, number> }>) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating route:', error);
        throw error;
      }
      
      console.log('✅ Updated route:', data.id);
      return data;
    } catch (error) {
      console.error('Exception updating route:', error);
      throw error;
    }
  },

  async deleteRoute(id: string) {
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting route:', error);
        throw error;
      }
      
      console.log('✅ Deleted route:', id);
    } catch (error) {
      console.error('Exception deleting route:', error);
      throw error;
    }
  },

  // Customers
  async createCustomer(customer: { name: string; phone: string; email?: string | null }) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
      
      console.log('✅ Created customer:', data.id);
      return data;
    } catch (error) {
      console.error('Exception creating customer:', error);
      throw error;
    }
  },

  async getCustomer(id: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exception fetching customer:', error);
      throw error;
    }
  },

  async getCustomerByPhone(phone: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .limit(1);
      
      if (error) {
        console.error('Error fetching customer by phone:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Exception fetching customer by phone:', error);
      return null;
    }
  },

  // Drivers
  async getDrivers() {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching drivers:', error);
        throw error;
      }
      
      console.log('✅ Loaded drivers:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception fetching drivers:', error);
      throw error;
    }
  },

  async createDriver(driver: { name: string; phone: string; car_type: string; car_model: string; plate_number: string; rating?: number; is_online?: boolean }) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert(driver)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating driver:', error);
        throw error;
      }
      
      console.log('✅ Created driver:', data.id);
      return data;
    } catch (error) {
      console.error('Exception creating driver:', error);
      throw error;
    }
  },

  async updateDriver(id: string, updates: Partial<{ name: string; phone: string; car_type: string; car_model: string; plate_number: string; rating: number; is_online: boolean }>) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating driver:', error);
        throw error;
      }
      
      console.log('✅ Updated driver:', data.id);
      return data;
    } catch (error) {
      console.error('Exception updating driver:', error);
      throw error;
    }
  },

  async deleteDriver(id: string) {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting driver:', error);
        throw error;
      }
      
      console.log('✅ Deleted driver:', id);
    } catch (error) {
      console.error('Exception deleting driver:', error);
      throw error;
    }
  },

  async getDriversByCarType(carType: string) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('car_type', carType)
        .eq('is_online', true);
      
      if (error) {
        console.error('Error fetching drivers by car type:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching drivers by car type:', error);
      return [];
    }
  },

  async updateDriverStatus(driverId: string, isOnline: boolean) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({ is_online: isOnline })
        .eq('id', driverId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating driver status:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Exception updating driver status:', error);
      throw error;
    }
  },

  // Agents
  async getAgents() {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching agents:', error);
        throw error;
      }
      
      console.log('✅ Loaded agents:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception fetching agents:', error);
      throw error;
    }
  },

  async createAgent(agent: { name: string; phone: string; email: string; bookings_created?: number }) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert(agent)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating agent:', error);
        throw error;
      }
      
      console.log('✅ Created agent:', data.id);
      return data;
    } catch (error) {
      console.error('Exception creating agent:', error);
      throw error;
    }
  },

  async updateAgent(id: string, updates: Partial<{ name: string; phone: string; email: string; bookings_created: number }>) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating agent:', error);
        throw error;
      }
      
      console.log('✅ Updated agent:', data.id);
      return data;
    } catch (error) {
      console.error('Exception updating agent:', error);
      throw error;
    }
  },

  async deleteAgent(id: string) {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting agent:', error);
        throw error;
      }
      
      console.log('✅ Deleted agent:', id);
    } catch (error) {
      console.error('Exception deleting agent:', error);
      throw error;
    }
  },

  // Bookings
  async createBooking(booking: {
    customer_id: string;
    route_id: string;
    car_type: string;
    agent_id?: string | null;
    pickup_time: string;
    pickup_location: string;
    special_instructions?: string | null;
    price: number;
    agent_commission?: number | null;
  }) {
    try {
      console.log('📝 Creating booking with data:', booking);

      // Validate all required fields before sending to database
      if (!booking.customer_id || !booking.route_id || !booking.car_type || 
          !booking.pickup_time || !booking.pickup_location || !booking.price) {
        throw new Error('Missing required booking fields');
      }

      // Ensure agent_id is explicitly null if not provided
      const bookingData = {
        customer_id: booking.customer_id,
        route_id: booking.route_id,
        car_type: booking.car_type,
        agent_id: booking.agent_id || null,
        pickup_time: booking.pickup_time,
        pickup_location: booking.pickup_location,
        special_instructions: booking.special_instructions || null,
        price: booking.price,
        agent_commission: booking.agent_commission || 0.00,
        status: 'pending'
      };

      console.log('📝 Inserting booking with data:', bookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Supabase error creating booking:', error);
        throw error;
      }

      console.log('✅ Created booking:', data.id);

      // Get related data separately to avoid join issues
      const [customerData, routeData, driverData, agentData] = await Promise.all([
        supabase.from('customers').select('*').eq('id', data.customer_id).single(),
        supabase.from('routes').select('*').eq('id', data.route_id).single(),
        data.driver_id ? supabase.from('drivers').select('*').eq('id', data.driver_id).single() : { data: null },
        data.agent_id ? supabase.from('agents').select('*').eq('id', data.agent_id).single() : { data: null }
      ]);

      // Return booking with related data
      return {
        ...data,
        customers: customerData.data,
        routes: routeData.data,
        drivers: driverData.data,
        agents: agentData.data
      };
    } catch (error: any) {
      console.error('❌ Exception creating booking:', error);
      
      // Provide more specific error messages based on the error
      if (error.code === '23503') {
        if (error.message.includes('route_id')) {
          throw new Error('Invalid route selected. Please choose a valid route.');
        } else if (error.message.includes('car_type')) {
          throw new Error('Invalid car type selected. Please choose a valid car type.');
        } else if (error.message.includes('customer_id')) {
          throw new Error('Customer information is invalid.');
        } else if (error.message.includes('agent_id')) {
          throw new Error('Agent information is invalid.');
        } else {
          throw new Error('Invalid booking data. Please check all fields.');
        }
      } else if (error.code === '23514') {
        throw new Error('Invalid booking status or data format.');
      } else {
        throw error;
      }
    }
  },

  async getBookings() {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      if (!bookings || bookings.length === 0) {
        console.log('⚠️ No bookings found in database');
        return [];
      }

      console.log('✅ Loaded bookings:', bookings.length);

      // Get related data separately to avoid join issues
      const customerIds = [...new Set(bookings.map(b => b.customer_id))];
      const routeIds = [...new Set(bookings.map(b => b.route_id))];
      const driverIds = [...new Set(bookings.map(b => b.driver_id).filter(Boolean))];
      const agentIds = [...new Set(bookings.map(b => b.agent_id).filter(Boolean))];

      const [customers, routes, drivers, agents] = await Promise.all([
        customerIds.length > 0 ? supabase.from('customers').select('*').in('id', customerIds) : { data: [] },
        routeIds.length > 0 ? supabase.from('routes').select('*').in('id', routeIds) : { data: [] },
        driverIds.length > 0 ? supabase.from('drivers').select('*').in('id', driverIds) : { data: [] },
        agentIds.length > 0 ? supabase.from('agents').select('*').in('id', agentIds) : { data: [] }
      ]);

      // Map the data together
      const enrichedBookings = bookings.map(booking => ({
        ...booking,
        customers: customers.data?.find(c => c.id === booking.customer_id) || null,
        routes: routes.data?.find(r => r.id === booking.route_id) || null,
        drivers: booking.driver_id ? drivers.data?.find(d => d.id === booking.driver_id) || null : null,
        agents: booking.agent_id ? agents.data?.find(a => a.id === booking.agent_id) || null : null
      }));

      console.log('✅ Enriched bookings with related data');
      return enrichedBookings;
    } catch (error) {
      console.error('Exception fetching bookings:', error);
      throw error;
    }
  },

  async getBookingsByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings by status:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching bookings by status:', error);
      return [];
    }
  },

  async getBookingsByDriver(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings by driver:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching bookings by driver:', error);
      return [];
    }
  },

  async getBookingsByAgent(agentId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings by agent:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching bookings by agent:', error);
      return [];
    }
  },

  async updateBookingStatus(bookingId: string, status: string, driverId?: string | null) {
    try {
      const updateData: any = { status };
      if (driverId !== undefined) {
        updateData.driver_id = driverId;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating booking status:', error);
        throw error;
      }

      console.log('✅ Updated booking status:', bookingId, status);

      // Get related data
      const [customerData, routeData, driverData, agentData] = await Promise.all([
        supabase.from('customers').select('*').eq('id', data.customer_id).single(),
        supabase.from('routes').select('*').eq('id', data.route_id).single(),
        data.driver_id ? supabase.from('drivers').select('*').eq('id', data.driver_id).single() : { data: null },
        data.agent_id ? supabase.from('agents').select('*').eq('id', data.agent_id).single() : { data: null }
      ]);

      return {
        ...data,
        customers: customerData.data,
        routes: routeData.data,
        drivers: driverData.data,
        agents: agentData.data
      };
    } catch (error) {
      console.error('Exception updating booking status:', error);
      throw error;
    }
  },

  // Update booking
  async updateBooking(bookingId: string, updates: Partial<{ price: number; agent_commission: number; agent_commission_paid: boolean; special_instructions: string; pickup_time: string; pickup_location: string }>) {
    try {
      console.log('🔄 Updating booking:', bookingId, updates);
      
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      console.log('✅ Booking updated successfully:', data.id);

      // Get related data
      const [customerData, routeData, driverData, agentData] = await Promise.all([
        supabase.from('customers').select('*').eq('id', data.customer_id).single(),
        supabase.from('routes').select('*').eq('id', data.route_id).single(),
        data.driver_id ? supabase.from('drivers').select('*').eq('id', data.driver_id).single() : { data: null },
        data.agent_id ? supabase.from('agents').select('*').eq('id', data.agent_id).single() : { data: null }
      ]);

      return {
        ...data,
        customers: customerData.data,
        routes: routeData.data,
        drivers: driverData.data,
        agents: agentData.data
      };
    } catch (error) {
      console.error('Exception updating booking:', error);
      throw error;
    }
  },

  // Delete booking
  async deleteBooking(bookingId: string) {
    try {
      console.log('🔄 Deleting booking:', bookingId);
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }
      
      console.log('✅ Booking deleted successfully:', bookingId);
    } catch (error) {
      console.error('Exception deleting booking:', error);
      throw error;
    }
  },

  // Real-time subscriptions
  subscribeToBookings(callback: (payload: any) => void) {
    return supabase
      .channel('bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        callback
      )
      .subscribe();
  },

  subscribeToDrivers(callback: (payload: any) => void) {
    return supabase
      .channel('drivers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' }, 
        callback
      )
      .subscribe();
  }
};
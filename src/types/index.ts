export interface CarType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  features: string[];
  icon: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  pricing: Record<string, number>;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  carType: string;
  carModel: string;
  plateNumber: string;
  rating: number;
  isOnline: boolean;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  bookingsCreated: number;
}

export type BookingStatus = 'pending' | 'assigned' | 'pickup' | 'drop' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customer: Customer;
  routeId: string;
  route: Route;
  carType: string;
  driverId?: string;
  driver?: Driver;
  agentId?: string;
  agent?: Agent;
  status: BookingStatus;
  pickupTime: string;
  pickupLocation: string;
  specialInstructions?: string;
  price: number;
  agentCommission: number;
  commissionPaid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'driver' | 'customer' | 'csr';
  carType?: string;
}
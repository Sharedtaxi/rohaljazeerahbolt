import { CarType, Route, Driver, Booking, Agent, Customer } from '../types';

export const carTypes: CarType[] = [
  {
    id: 'camry',
    name: 'Toyota Camry',
    description: 'Comfortable sedan for business trips',
    capacity: 4,
    features: ['AC', 'Leather Seats', 'WiFi', 'Phone Charger'],
    icon: '🚗'
  },
  {
    id: 'starx',
    name: 'Starx SUV',
    description: 'Spacious SUV for family travel',
    capacity: 6,
    features: ['AC', 'Spacious', 'Entertainment System', 'Child Seats Available'],
    icon: '🚙'
  },
  {
    id: 'gmc',
    name: 'GMC Suburban',
    description: 'Premium large SUV for groups',
    capacity: 8,
    features: ['Premium AC', 'Luxury Interior', 'Entertainment', 'Extra Luggage Space'],
    icon: '🚐'
  },
  {
    id: 'hiace',
    name: 'Toyota Hiace',
    description: 'Van for large groups and events',
    capacity: 14,
    features: ['AC', 'Multiple Rows', 'Large Capacity', 'Event Transport'],
    icon: '🚌'
  }
];

export const routes: Route[] = [
  {
    id: 'airport-downtown',
    from: 'International Airport',
    to: 'Downtown Business District',
    distance: '25 km',
    duration: '35 min',
    pricing: {
      camry: 45,
      starx: 60,
      gmc: 85,
      hiace: 120
    }
  },
  {
    id: 'downtown-mall',
    from: 'Downtown Business District',
    to: 'Grand Shopping Mall',
    distance: '12 km',
    duration: '20 min',
    pricing: {
      camry: 25,
      starx: 35,
      gmc: 50,
      hiace: 70
    }
  },
  {
    id: 'hotel-conference',
    from: 'Luxury Hotel District',
    to: 'Convention Center',
    distance: '8 km',
    duration: '15 min',
    pricing: {
      camry: 20,
      starx: 28,
      gmc: 40,
      hiace: 55
    }
  },
  {
    id: 'university-airport',
    from: 'University Campus',
    to: 'International Airport',
    distance: '35 km',
    duration: '45 min',
    pricing: {
      camry: 55,
      starx: 75,
      gmc: 100,
      hiace: 140
    }
  }
];

export const drivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Ahmed Hassan',
    phone: '+1234567890',
    carType: 'camry',
    carModel: 'Toyota Camry 2023',
    plateNumber: 'ABC-123',
    rating: 4.8,
    isOnline: true
  },
  {
    id: 'driver-2',
    name: 'Sarah Johnson',
    phone: '+1234567891',
    carType: 'starx',
    carModel: 'Starx SUV 2024',
    plateNumber: 'XYZ-456',
    rating: 4.9,
    isOnline: true
  },
  {
    id: 'driver-3',
    name: 'Mohammed Ali',
    phone: '+1234567892',
    carType: 'gmc',
    carModel: 'GMC Suburban 2023',
    plateNumber: 'GMC-789',
    rating: 4.7,
    isOnline: false
  },
  {
    id: 'driver-4',
    name: 'Lisa Chen',
    phone: '+1234567893',
    carType: 'hiace',
    carModel: 'Toyota Hiace 2024',
    plateNumber: 'VAN-321',
    rating: 4.6,
    isOnline: true
  }
];

export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'John Smith',
    phone: '+1234567894',
    email: 'john@taxicompany.com',
    bookingsCreated: 156
  },
  {
    id: 'agent-2',
    name: 'Emma Wilson',
    phone: '+1234567895',
    email: 'emma@taxicompany.com',
    bookingsCreated: 243
  }
];

export const customers: Customer[] = [
  {
    id: 'customer-1',
    name: 'Robert Davis',
    phone: '+1234567896',
    email: 'robert@email.com'
  },
  {
    id: 'customer-2',
    name: 'Maria Garcia',
    phone: '+1234567897',
    email: 'maria@email.com'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    customerId: 'customer-1',
    customer: customers[0],
    routeId: 'airport-downtown',
    route: routes[0],
    carType: 'camry',
    driverId: 'driver-1',
    driver: drivers[0],
    agentId: 'agent-1',
    agent: agents[0],
    status: 'pickup',
    pickupTime: '2024-01-15T14:30:00Z',
    pickupLocation: 'Terminal 2, Gate 5',
    specialInstructions: 'Customer will be at arrivals with blue jacket',
    price: 45,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T14:25:00Z'
  },
  {
    id: 'booking-2',
    customerId: 'customer-2',
    customer: customers[1],
    routeId: 'downtown-mall',
    route: routes[1],
    carType: 'starx',
    status: 'pending',
    pickupTime: '2024-01-15T16:00:00Z',
    pickupLocation: 'Main Street Plaza',
    price: 35,
    createdAt: '2024-01-15T14:45:00Z',
    updatedAt: '2024-01-15T14:45:00Z'
  }
];
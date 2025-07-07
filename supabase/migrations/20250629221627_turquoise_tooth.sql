/*
  # Complete Taxi Aggregator Database Setup

  1. New Tables
    - `users` - Authentication users
    - `car_types` - Vehicle types with pricing
    - `routes` - Predefined routes with pricing
    - `customers` - Customer information
    - `agents` - Booking agents
    - `drivers` - Driver profiles with vehicle info
    - `bookings` - Trip bookings with full details

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
    - Public access for viewing car types and routes
    - Authenticated access for managing bookings

  3. Sample Data
    - Car types (Camry, Starx, GMC, Hiace)
    - Routes with distance and pricing
    - Sample drivers and agents
    - Proper relationships and constraints
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Car types are viewable by everyone" ON car_types;
DROP POLICY IF EXISTS "Car types are manageable by authenticated users" ON car_types;
DROP POLICY IF EXISTS "Routes are viewable by everyone" ON routes;
DROP POLICY IF EXISTS "Routes are manageable by authenticated users" ON routes;
DROP POLICY IF EXISTS "Customers can be created by anyone" ON customers;
DROP POLICY IF EXISTS "Customers can view their own data" ON customers;
DROP POLICY IF EXISTS "Customers can be updated by authenticated users" ON customers;
DROP POLICY IF EXISTS "Drivers can view their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can be managed by authenticated users" ON drivers;
DROP POLICY IF EXISTS "Agents can view their own data" ON agents;
DROP POLICY IF EXISTS "Agents can update their own data" ON agents;
DROP POLICY IF EXISTS "Agents can be managed by authenticated users" ON agents;
DROP POLICY IF EXISTS "Bookings can be created by anyone" ON bookings;
DROP POLICY IF EXISTS "Bookings are viewable by authenticated users" ON bookings;
DROP POLICY IF EXISTS "Bookings can be updated by authenticated users" ON bookings;

-- Create users table for authentication (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create car_types table
CREATE TABLE IF NOT EXISTS car_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  capacity integer NOT NULL,
  features text[] DEFAULT '{}',
  icon text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id text PRIMARY KEY,
  from_location text NOT NULL,
  to_location text NOT NULL,
  distance text NOT NULL,
  duration text NOT NULL,
  pricing jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  bookings_created integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  phone text NOT NULL,
  car_type text NOT NULL,
  car_model text NOT NULL,
  plate_number text NOT NULL,
  rating numeric(3,2) DEFAULT 5.0,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for drivers.car_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'drivers_car_type_fkey'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT drivers_car_type_fkey 
    FOREIGN KEY (car_type) REFERENCES car_types(id);
  END IF;
END $$;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  route_id text NOT NULL REFERENCES routes(id),
  car_type text NOT NULL REFERENCES car_types(id),
  driver_id uuid REFERENCES drivers(id),
  agent_id uuid REFERENCES agents(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'pickup', 'drop', 'completed', 'cancelled')),
  pickup_time timestamptz NOT NULL,
  pickup_location text NOT NULL,
  special_instructions text,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_car_type ON drivers(car_type);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_type ON bookings(car_type);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_car_types_updated_at ON car_types;
CREATE TRIGGER update_car_types_updated_at
  BEFORE UPDATE ON car_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE car_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Car types - viewable by everyone, manageable by authenticated users
CREATE POLICY "Car types are viewable by everyone" ON car_types FOR SELECT TO public USING (true);
CREATE POLICY "Car types are manageable by authenticated users" ON car_types FOR ALL TO authenticated USING (true);

-- Routes - viewable by everyone, manageable by authenticated users
CREATE POLICY "Routes are viewable by everyone" ON routes FOR SELECT TO public USING (true);
CREATE POLICY "Routes are manageable by authenticated users" ON routes FOR ALL TO authenticated USING (true);

-- Customers - can be created by anyone, managed by authenticated users
CREATE POLICY "Customers can be created by anyone" ON customers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Customers can view their own data" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers can be updated by authenticated users" ON customers FOR UPDATE TO authenticated USING (true);

-- Drivers - can view own data and be managed by authenticated users
CREATE POLICY "Drivers can view their own data" ON drivers FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM agents 
    UNION 
    SELECT user_id FROM drivers WHERE user_id IS NOT NULL
  ));
CREATE POLICY "Drivers can update their own data" ON drivers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Drivers can be managed by authenticated users" ON drivers FOR ALL TO authenticated USING (true);

-- Agents - can view own data and be managed by authenticated users
CREATE POLICY "Agents can view their own data" ON agents FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM agents 
    UNION 
    SELECT user_id FROM drivers WHERE user_id IS NOT NULL
  ));
CREATE POLICY "Agents can update their own data" ON agents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Agents can be managed by authenticated users" ON agents FOR ALL TO authenticated USING (true);

-- Bookings - can be created by anyone, viewed and managed by authenticated users
CREATE POLICY "Bookings can be created by anyone" ON bookings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Bookings are viewable by authenticated users" ON bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Bookings can be updated by authenticated users" ON bookings FOR UPDATE TO authenticated USING (true);

-- Insert sample data

-- Car types
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
  ('camry', 'Toyota Camry', 'Comfortable sedan for business trips', 4, ARRAY['AC', 'Leather Seats', 'WiFi', 'Phone Charger'], '🚗'),
  ('starx', 'Starx SUV', 'Spacious SUV for family travel', 6, ARRAY['AC', 'Spacious', 'Entertainment System', 'Child Seats Available'], '🚙'),
  ('gmc', 'GMC Suburban', 'Premium large SUV for groups', 8, ARRAY['Premium AC', 'Luxury Interior', 'Entertainment', 'Extra Luggage Space'], '🚐'),
  ('hiace', 'Toyota Hiace', 'Van for large groups and events', 14, ARRAY['AC', 'Multiple Rows', 'Large Capacity', 'Event Transport'], '🚌')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  capacity = EXCLUDED.capacity,
  features = EXCLUDED.features,
  icon = EXCLUDED.icon;

-- Routes
INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
  ('airport-downtown', 'International Airport', 'Downtown Business District', '25 km', '35 min', '{"camry": 45, "starx": 60, "gmc": 85, "hiace": 120}'),
  ('downtown-mall', 'Downtown Business District', 'Grand Shopping Mall', '12 km', '20 min', '{"camry": 25, "starx": 35, "gmc": 50, "hiace": 70}'),
  ('hotel-conference', 'Luxury Hotel District', 'Convention Center', '8 km', '15 min', '{"camry": 20, "starx": 28, "gmc": 40, "hiace": 55}'),
  ('university-airport', 'University Campus', 'International Airport', '35 km', '45 min', '{"camry": 55, "starx": 75, "gmc": 100, "hiace": 140}')
ON CONFLICT (id) DO UPDATE SET
  from_location = EXCLUDED.from_location,
  to_location = EXCLUDED.to_location,
  distance = EXCLUDED.distance,
  duration = EXCLUDED.duration,
  pricing = EXCLUDED.pricing;

-- Sample agents
INSERT INTO agents (name, phone, email, bookings_created) VALUES
  ('John Smith', '+1234567894', 'john@taxicompany.com', 156),
  ('Emma Wilson', '+1234567895', 'emma@taxicompany.com', 243)
ON CONFLICT DO NOTHING;

-- Sample drivers
INSERT INTO drivers (name, phone, car_type, car_model, plate_number, rating, is_online) VALUES
  ('Ahmed Hassan', '+1234567890', 'camry', 'Toyota Camry 2023', 'ABC-123', 4.8, true),
  ('Sarah Johnson', '+1234567891', 'starx', 'Starx SUV 2024', 'XYZ-456', 4.9, true),
  ('Mohammed Ali', '+1234567892', 'gmc', 'GMC Suburban 2023', 'GMC-789', 4.7, false),
  ('Lisa Chen', '+1234567893', 'hiace', 'Toyota Hiace 2024', 'VAN-321', 4.6, true)
ON CONFLICT DO NOTHING;

-- Sample customers
INSERT INTO customers (name, phone, email) VALUES
  ('Robert Davis', '+1234567896', 'robert@email.com'),
  ('Maria Garcia', '+1234567897', 'maria@email.com')
ON CONFLICT DO NOTHING;
/*
  # Fix Database Schema and Sample Data

  1. New Tables
    - Ensure all tables exist with proper structure
    - Fix foreign key relationships
    - Add proper sample data

  2. Security
    - Enable RLS on all tables
    - Add permissive policies for demo purposes

  3. Sample Data
    - Add consistent sample data that matches the application expectations
    - Ensure all relationships are properly linked
*/

-- Drop all existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Ensure all tables exist with correct structure
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

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  bookings_created integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
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

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  route_id text NOT NULL,
  car_type text NOT NULL,
  driver_id uuid,
  agent_id uuid,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'pickup', 'drop', 'completed', 'cancelled')),
  pickup_time timestamptz NOT NULL,
  pickup_location text NOT NULL,
  special_instructions text,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints safely
DO $$
BEGIN
  -- Add foreign key for drivers.car_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'drivers_car_type_fkey'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT drivers_car_type_fkey 
    FOREIGN KEY (car_type) REFERENCES car_types(id);
  END IF;

  -- Add foreign key for bookings.customer_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_customer_id_fkey'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id);
  END IF;

  -- Add foreign key for bookings.route_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_route_id_fkey'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_route_id_fkey 
    FOREIGN KEY (route_id) REFERENCES routes(id);
  END IF;

  -- Add foreign key for bookings.car_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_car_type_fkey'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_car_type_fkey 
    FOREIGN KEY (car_type) REFERENCES car_types(id);
  END IF;

  -- Add foreign key for bookings.driver_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_driver_id_fkey'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_driver_id_fkey 
    FOREIGN KEY (driver_id) REFERENCES drivers(id);
  END IF;

  -- Add foreign key for bookings.agent_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_agent_id_fkey'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_agent_id_fkey 
    FOREIGN KEY (agent_id) REFERENCES agents(id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_car_type ON drivers(car_type);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_type ON bookings(car_type);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Enable Row Level Security
ALTER TABLE car_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demo purposes
CREATE POLICY "Car types public access" ON car_types FOR ALL TO public USING (true);
CREATE POLICY "Routes public access" ON routes FOR ALL TO public USING (true);
CREATE POLICY "Customers public access" ON customers FOR ALL TO public USING (true);
CREATE POLICY "Drivers public access" ON drivers FOR ALL TO public USING (true);
CREATE POLICY "Agents public access" ON agents FOR ALL TO public USING (true);
CREATE POLICY "Bookings public access" ON bookings FOR ALL TO public USING (true);

-- Clear existing data to avoid conflicts
DELETE FROM bookings;
DELETE FROM drivers;
DELETE FROM agents;
DELETE FROM customers;
DELETE FROM routes;
DELETE FROM car_types;

-- Insert car types first (referenced by other tables)
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
('camry', 'Toyota Camry', 'Comfortable sedan perfect for city rides', 4, ARRAY['Air Conditioning', 'GPS Navigation', 'Bluetooth'], '🚗'),
('starx', 'Starx SUV', 'Spacious SUV for family travel', 6, ARRAY['Air Conditioning', 'Spacious', 'Entertainment System', 'Child Seats Available'], '🚙'),
('gmc', 'GMC Suburban', 'Premium large SUV for groups', 8, ARRAY['Premium AC', 'Luxury Interior', 'Entertainment', 'Extra Luggage Space'], '🚐'),
('hiace', 'Toyota Hiace', 'Van for large groups and events', 14, ARRAY['AC', 'Multiple Rows', 'Large Capacity', 'Event Transport'], '🚌');

-- Insert routes
INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
('airport-downtown', 'International Airport', 'Downtown Business District', '25 km', '35 min', '{"camry": 45, "starx": 60, "gmc": 85, "hiace": 120}'::jsonb),
('downtown-mall', 'Downtown Business District', 'Grand Shopping Mall', '12 km', '20 min', '{"camry": 25, "starx": 35, "gmc": 50, "hiace": 70}'::jsonb),
('hotel-conference', 'Luxury Hotel District', 'Convention Center', '8 km', '15 min', '{"camry": 20, "starx": 28, "gmc": 40, "hiace": 55}'::jsonb),
('university-airport', 'University Campus', 'International Airport', '35 km', '45 min', '{"camry": 55, "starx": 75, "gmc": 100, "hiace": 140}'::jsonb);

-- Insert customers
INSERT INTO customers (id, name, phone, email) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Robert Davis', '+1234567896', 'robert@email.com'),
('550e8400-e29b-41d4-a716-446655440021', 'Maria Garcia', '+1234567897', 'maria@email.com');

-- Insert agents
INSERT INTO agents (id, name, phone, email, bookings_created) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Smith', '+1234567894', 'john@taxicompany.com', 156),
('550e8400-e29b-41d4-a716-446655440002', 'Emma Wilson', '+1234567895', 'emma@taxicompany.com', 243);

-- Insert drivers
INSERT INTO drivers (id, name, phone, car_type, car_model, plate_number, rating, is_online) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Ahmed Hassan', '+1234567890', 'camry', 'Toyota Camry 2023', 'ABC-123', 4.8, true),
('550e8400-e29b-41d4-a716-446655440011', 'Sarah Johnson', '+1234567891', 'starx', 'Starx SUV 2024', 'XYZ-456', 4.9, true),
('550e8400-e29b-41d4-a716-446655440012', 'Mohammed Ali', '+1234567892', 'gmc', 'GMC Suburban 2023', 'GMC-789', 4.7, false),
('550e8400-e29b-41d4-a716-446655440013', 'Lisa Chen', '+1234567893', 'hiace', 'Toyota Hiace 2024', 'VAN-321', 4.6, true);

-- Insert sample bookings
INSERT INTO bookings (id, customer_id, route_id, car_type, driver_id, agent_id, status, pickup_time, pickup_location, special_instructions, price) VALUES
(
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440020',
  'airport-downtown',
  'camry',
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440001',
  'pickup',
  now() + interval '30 minutes',
  'Terminal 2, Gate 5',
  'Customer will be at arrivals with blue jacket',
  45.00
),
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440021',
  'downtown-mall',
  'starx',
  NULL,
  '550e8400-e29b-41d4-a716-446655440002',
  'pending',
  now() + interval '2 hours',
  'Main Street Plaza',
  NULL,
  35.00
);
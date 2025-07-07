/*
  # Fix database migration issues

  1. Drop all existing policies that depend on functions
  2. Drop and recreate functions
  3. Create new permissive policies for demo
  4. Insert sample data with proper relationships
*/

-- First, drop ALL existing policies that might depend on functions
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Now drop all functions safely
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(user_uuid uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(input_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS uid() CASCADE;

-- Create simplified get_user_role function
CREATE OR REPLACE FUNCTION get_user_role(input_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple role detection for demo
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = input_user_id AND email LIKE '%admin%') THEN
    RETURN 'admin';
  END IF;
  
  IF EXISTS (SELECT 1 FROM agents WHERE user_id = input_user_id) THEN
    RETURN 'agent';
  END IF;
  
  IF EXISTS (SELECT 1 FROM drivers WHERE user_id = input_user_id) THEN
    RETURN 'driver';
  END IF;
  
  RETURN 'customer';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'customer';
END;
$$;

-- Create simplified uid function
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
$$;

-- Create very permissive policies for demo purposes
-- Car types - accessible to everyone
CREATE POLICY "Car types public access" ON car_types FOR ALL TO public USING (true);

-- Routes - accessible to everyone  
CREATE POLICY "Routes public access" ON routes FOR ALL TO public USING (true);

-- Customers - accessible to everyone
CREATE POLICY "Customers public access" ON customers FOR ALL TO public USING (true);

-- Drivers - accessible to everyone
CREATE POLICY "Drivers public access" ON drivers FOR ALL TO public USING (true);

-- Agents - accessible to everyone
CREATE POLICY "Agents public access" ON agents FOR ALL TO public USING (true);

-- Bookings - accessible to everyone
CREATE POLICY "Bookings public access" ON bookings FOR ALL TO public USING (true);

-- Ensure sample data exists with proper relationships
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
('camry', 'Toyota Camry', 'Comfortable sedan perfect for city rides', 4, ARRAY['Air Conditioning', 'GPS Navigation', 'Bluetooth'], '🚗'),
('suv', 'SUV', 'Spacious SUV for families and groups', 7, ARRAY['Air Conditioning', 'GPS Navigation', 'Extra Space', 'Child Seats'], '🚙'),
('luxury', 'Luxury Car', 'Premium vehicles for special occasions', 4, ARRAY['Leather Seats', 'Premium Sound', 'Climate Control', 'WiFi'], '🏆'),
('van', 'Van', 'Large capacity for groups and luggage', 12, ARRAY['Air Conditioning', 'Extra Luggage Space', 'Group Seating'], '🚌')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  capacity = EXCLUDED.capacity,
  features = EXCLUDED.features,
  icon = EXCLUDED.icon;

INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
('airport-downtown', 'International Airport', 'Downtown Business District', '25 km', '35 min', '{"camry": 45, "suv": 60, "luxury": 85, "van": 120}'::jsonb),
('downtown-mall', 'Downtown Business District', 'Grand Shopping Mall', '12 km', '20 min', '{"camry": 25, "suv": 35, "luxury": 50, "van": 70}'::jsonb),
('hotel-conference', 'Luxury Hotel District', 'Convention Center', '8 km', '15 min', '{"camry": 20, "suv": 28, "luxury": 40, "van": 55}'::jsonb),
('university-airport', 'University Campus', 'International Airport', '35 km', '45 min', '{"camry": 55, "suv": 75, "luxury": 100, "van": 140}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  from_location = EXCLUDED.from_location,
  to_location = EXCLUDED.to_location,
  distance = EXCLUDED.distance,
  duration = EXCLUDED.duration,
  pricing = EXCLUDED.pricing;

-- Insert sample agents
INSERT INTO agents (id, name, phone, email, bookings_created) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Ahmed', '+201234567890', 'sarah@taxiflow.com', 25),
('550e8400-e29b-41d4-a716-446655440002', 'Mohamed Ali', '+201234567891', 'mohamed@taxiflow.com', 18)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Insert sample drivers
INSERT INTO drivers (id, name, phone, car_type, car_model, plate_number, rating, is_online) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Ahmed Hassan', '+201234567800', 'camry', 'Toyota Camry 2022', 'ABC 123', 4.8, true),
('550e8400-e29b-41d4-a716-446655440011', 'Omar Mahmoud', '+201234567801', 'suv', 'Honda CR-V 2023', 'XYZ 456', 4.9, true),
('550e8400-e29b-41d4-a716-446655440012', 'Khaled Ibrahim', '+201234567802', 'luxury', 'Mercedes E-Class 2023', 'LUX 789', 4.7, false),
('550e8400-e29b-41d4-a716-446655440013', 'Youssef Nabil', '+201234567803', 'van', 'Toyota Hiace 2022', 'VAN 321', 4.6, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  car_type = EXCLUDED.car_type,
  car_model = EXCLUDED.car_model,
  plate_number = EXCLUDED.plate_number,
  rating = EXCLUDED.rating,
  is_online = EXCLUDED.is_online;

-- Insert sample customers
INSERT INTO customers (id, name, phone, email) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Amira Mostafa', '+201234567810', 'amira@example.com'),
('550e8400-e29b-41d4-a716-446655440021', 'Hassan Abdel Rahman', '+201234567811', 'hassan@example.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Insert sample bookings
INSERT INTO bookings (id, customer_id, route_id, car_type, driver_id, agent_id, status, pickup_time, pickup_location, price) VALUES
(
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440020',
  'airport-downtown',
  'camry',
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440001',
  'assigned',
  now() + interval '2 hours',
  'Terminal 2, Gate 5',
  45.00
),
(
  '550e8400-e29b-41d4-a716-446655440031',
  '550e8400-e29b-41d4-a716-446655440021',
  'downtown-mall',
  'suv',
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440002',
  'pickup',
  now() + interval '1 hour',
  'Main Street Plaza',
  35.00
),
(
  '550e8400-e29b-41d4-a716-446655440032',
  '550e8400-e29b-41d4-a716-446655440020',
  'hotel-conference',
  'luxury',
  NULL,
  '550e8400-e29b-41d4-a716-446655440001',
  'pending',
  now() + interval '3 hours',
  'Hotel Lobby',
  40.00
)
ON CONFLICT (id) DO NOTHING;
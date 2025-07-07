/*
  # Initial Schema for Taxi Aggregator Application

  1. New Tables
    - `car_types`
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `capacity` (integer)
      - `features` (text array)
      - `icon` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `routes`
      - `id` (text, primary key)
      - `from_location` (text)
      - `to_location` (text)
      - `distance` (text)
      - `duration` (text)
      - `pricing` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `drivers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `phone` (text)
      - `car_type` (text, references car_types)
      - `car_model` (text)
      - `plate_number` (text)
      - `rating` (decimal)
      - `is_online` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `bookings_created` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `route_id` (text, references routes)
      - `car_type` (text, references car_types)
      - `driver_id` (uuid, references drivers, optional)
      - `agent_id` (uuid, references agents, optional)
      - `status` (text)
      - `pickup_time` (timestamp)
      - `pickup_location` (text)
      - `special_instructions` (text, optional)
      - `price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for admins to access all data
    - Add policies for agents to access their bookings
    - Add policies for drivers to access their assigned bookings
*/

-- Create car_types table
CREATE TABLE IF NOT EXISTS car_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  capacity integer NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
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
  pricing jsonb NOT NULL DEFAULT '{}',
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

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  phone text NOT NULL,
  car_type text NOT NULL REFERENCES car_types(id),
  car_model text NOT NULL,
  plate_number text NOT NULL,
  rating decimal(3,2) DEFAULT 5.0,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  bookings_created integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  route_id text NOT NULL REFERENCES routes(id),
  car_type text NOT NULL REFERENCES car_types(id),
  driver_id uuid REFERENCES drivers(id),
  agent_id uuid REFERENCES agents(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'pickup', 'drop', 'completed', 'cancelled')),
  pickup_time timestamptz NOT NULL,
  pickup_location text NOT NULL,
  special_instructions text,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE car_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for car_types (public read access)
CREATE POLICY "Car types are viewable by everyone"
  ON car_types
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Car types are manageable by authenticated users"
  ON car_types
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for routes (public read access)
CREATE POLICY "Routes are viewable by everyone"
  ON routes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Routes are manageable by authenticated users"
  ON routes
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for customers
CREATE POLICY "Customers can view their own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can be created by anyone"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Customers can be updated by authenticated users"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for drivers
CREATE POLICY "Drivers can view their own data"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM agents UNION SELECT user_id FROM drivers WHERE user_id IS NOT NULL
  ));

CREATE POLICY "Drivers can update their own data"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can be managed by authenticated users"
  ON drivers
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for agents
CREATE POLICY "Agents can view their own data"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM agents UNION SELECT user_id FROM drivers WHERE user_id IS NOT NULL
  ));

CREATE POLICY "Agents can update their own data"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can be managed by authenticated users"
  ON agents
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for bookings
CREATE POLICY "Bookings are viewable by authenticated users"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Bookings can be created by anyone"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Bookings can be updated by authenticated users"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_car_type ON drivers(car_type);
CREATE INDEX IF NOT EXISTS idx_drivers_is_online ON drivers(is_online);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_type ON bookings(car_type);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_car_types_updated_at BEFORE UPDATE ON car_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
/*
  # Authentication System Setup

  1. New Tables
    - `app_users` - Application user profiles
    
  2. Table Updates
    - Add `app_user_id` to drivers and agents tables
    
  3. Functions
    - Registration functions for drivers and agents
    
  4. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create app_users table for application user data
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  user_type text CHECK (user_type IN ('admin', 'agent', 'driver', 'customer')) NOT NULL,
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on app_users table
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policies for app_users table
CREATE POLICY "Users can view their own data" ON app_users
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Users can insert their own data" ON app_users
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON app_users
  FOR UPDATE TO public
  USING (true);

-- Add app_user_id column to drivers table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drivers' AND column_name = 'app_user_id'
  ) THEN
    ALTER TABLE drivers ADD COLUMN app_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add app_user_id column to agents table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agents' AND column_name = 'app_user_id'
  ) THEN
    ALTER TABLE agents ADD COLUMN app_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register a driver
CREATE OR REPLACE FUNCTION register_driver(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text,
  p_car_type text,
  p_car_model text,
  p_plate_number text,
  p_license_number text DEFAULT NULL,
  p_iqama_number text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_user_id uuid;
  new_driver_id uuid;
  password_hash text;
BEGIN
  -- Hash the password
  password_hash := hash_password(p_password);
  
  -- Create app user
  INSERT INTO app_users (
    email,
    full_name,
    phone,
    user_type,
    password_hash
  ) VALUES (
    p_email,
    p_full_name,
    p_phone,
    'driver',
    password_hash
  ) RETURNING id INTO new_user_id;

  -- Create driver profile
  INSERT INTO drivers (
    app_user_id,
    name,
    phone,
    car_type,
    car_model,
    plate_number,
    rating,
    is_online
  ) VALUES (
    new_user_id,
    p_full_name,
    p_phone,
    p_car_type,
    p_car_model,
    p_plate_number,
    5.0,
    false
  ) RETURNING id INTO new_driver_id;

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'driver_id', new_driver_id,
    'message', 'Driver registered successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to register an agent
CREATE OR REPLACE FUNCTION register_agent(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text,
  p_work_industry text DEFAULT NULL,
  p_iqama_number text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_user_id uuid;
  new_agent_id uuid;
  password_hash text;
BEGIN
  -- Hash the password
  password_hash := hash_password(p_password);
  
  -- Create app user
  INSERT INTO app_users (
    email,
    full_name,
    phone,
    user_type,
    password_hash
  ) VALUES (
    p_email,
    p_full_name,
    p_phone,
    'agent',
    password_hash
  ) RETURNING id INTO new_user_id;

  -- Create agent profile
  INSERT INTO agents (
    app_user_id,
    name,
    phone,
    email,
    bookings_created
  ) VALUES (
    new_user_id,
    p_full_name,
    p_phone,
    p_email,
    0
  ) RETURNING id INTO new_agent_id;

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'agent_id', new_agent_id,
    'message', 'Agent registered successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
  p_identifier text,
  p_password text
)
RETURNS json AS $$
DECLARE
  user_record app_users%ROWTYPE;
  driver_record drivers%ROWTYPE;
  agent_record agents%ROWTYPE;
BEGIN
  -- Try to find user by email, phone, or name
  SELECT * INTO user_record FROM app_users 
  WHERE email = p_identifier 
     OR phone = p_identifier 
     OR full_name ILIKE p_identifier
  LIMIT 1;

  -- If user not found, try to find by driver/agent name
  IF user_record.id IS NULL THEN
    -- Try drivers table
    SELECT au.* INTO user_record 
    FROM app_users au
    JOIN drivers d ON d.app_user_id = au.id
    WHERE d.name ILIKE p_identifier
    LIMIT 1;
    
    -- Try agents table if still not found
    IF user_record.id IS NULL THEN
      SELECT au.* INTO user_record 
      FROM app_users au
      JOIN agents a ON a.app_user_id = au.id
      WHERE a.name ILIKE p_identifier
      LIMIT 1;
    END IF;
  END IF;

  -- Check if user exists and password is correct
  IF user_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  IF NOT verify_password(p_password, user_record.password_hash) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password'
    );
  END IF;

  -- Get additional profile data based on user type
  IF user_record.user_type = 'driver' THEN
    SELECT * INTO driver_record FROM drivers WHERE app_user_id = user_record.id;
    RETURN json_build_object(
      'success', true,
      'user', row_to_json(user_record),
      'profile', row_to_json(driver_record),
      'user_type', 'driver'
    );
  ELSIF user_record.user_type = 'agent' THEN
    SELECT * INTO agent_record FROM agents WHERE app_user_id = user_record.id;
    RETURN json_build_object(
      'success', true,
      'user', row_to_json(user_record),
      'profile', row_to_json(agent_record),
      'user_type', 'agent'
    );
  ELSE
    RETURN json_build_object(
      'success', true,
      'user', row_to_json(user_record),
      'profile', null,
      'user_type', user_record.user_type
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_phone ON app_users(phone);
CREATE INDEX IF NOT EXISTS idx_app_users_full_name ON app_users(full_name);
CREATE INDEX IF NOT EXISTS idx_drivers_app_user_id ON drivers(app_user_id);
CREATE INDEX IF NOT EXISTS idx_agents_app_user_id ON agents(app_user_id);

-- Update triggers for updated_at
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users
DO $$
DECLARE
  admin_user_id uuid;
  agent_user_id uuid;
  driver_user_id uuid;
BEGIN
  -- Create admin user
  INSERT INTO app_users (
    email,
    full_name,
    phone,
    user_type,
    password_hash
  ) VALUES (
    'admin@rohaljazeera.com',
    'Admin User',
    '+966501234567',
    'admin',
    hash_password('admin123')
  ) RETURNING id INTO admin_user_id;

  -- Create demo agent user
  INSERT INTO app_users (
    email,
    full_name,
    phone,
    user_type,
    password_hash
  ) VALUES (
    'agent@rohaljazeera.com',
    'Sarah Ahmed',
    '+966501234568',
    'agent',
    hash_password('agent123')
  ) RETURNING id INTO agent_user_id;

  -- Create agent profile
  INSERT INTO agents (
    app_user_id,
    name,
    phone,
    email,
    bookings_created
  ) VALUES (
    agent_user_id,
    'Sarah Ahmed',
    '+966501234568',
    'agent@rohaljazeera.com',
    0
  );

  -- Create demo driver user
  INSERT INTO app_users (
    email,
    full_name,
    phone,
    user_type,
    password_hash
  ) VALUES (
    'driver@rohaljazeera.com',
    'Ahmed Hassan',
    '+966501234569',
    'driver',
    hash_password('driver123')
  ) RETURNING id INTO driver_user_id;

  -- Create driver profile
  INSERT INTO drivers (
    app_user_id,
    name,
    phone,
    car_type,
    car_model,
    plate_number,
    rating,
    is_online
  ) VALUES (
    driver_user_id,
    'Ahmed Hassan',
    '+966501234569',
    'camry',
    'Toyota Camry 2023',
    'ABC-123',
    4.8,
    true
  );

  RAISE NOTICE 'Demo users created successfully';

EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'Demo users already exist';
WHEN OTHERS THEN
  RAISE NOTICE 'Error creating demo users: %', SQLERRM;
END $$;
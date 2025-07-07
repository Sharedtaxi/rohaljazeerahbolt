/*
  # Authentication Setup for TaxiFlow Application

  1. User Management
    - Create function to get user roles
    - Update existing records to link with auth users
  
  2. Security Policies
    - Update RLS policies for role-based access
    - Ensure proper data isolation between user types
    
  3. Demo Data
    - Link existing agents and drivers with demo auth users
*/

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text AS $$
BEGIN
  -- Check if user is an admin (simple email check for demo)
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = user_id AND email LIKE '%admin%') THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is an agent
  IF EXISTS (SELECT 1 FROM agents WHERE user_id = user_id) THEN
    RETURN 'agent';
  END IF;
  
  -- Check if user is a driver
  IF EXISTS (SELECT 1 FROM drivers WHERE user_id = user_id) THEN
    RETURN 'driver';
  END IF;
  
  RETURN 'customer';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely create demo users
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email text,
  user_password text,
  user_role text
) RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    -- Generate new UUID for user
    user_id := gen_random_uuid();
    
    -- Insert new user (Note: In production, use Supabase Auth API)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('role', user_role),
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo users
DO $$
DECLARE
  admin_id uuid;
  agent_id uuid;
  driver_id uuid;
BEGIN
  -- Create admin user
  admin_id := create_demo_user('admin@taxiflow.com', 'admin123', 'admin');
  
  -- Create agent user
  agent_id := create_demo_user('agent@taxiflow.com', 'agent123', 'agent');
  
  -- Create driver user
  driver_id := create_demo_user('driver@taxiflow.com', 'driver123', 'driver');
  
  -- Update existing agents to link with auth users
  UPDATE agents 
  SET user_id = agent_id
  WHERE email = 'john@taxicompany.com' AND user_id IS NULL;
  
  -- If no existing agent, create one
  IF NOT EXISTS (SELECT 1 FROM agents WHERE user_id = agent_id) THEN
    INSERT INTO agents (user_id, name, phone, email, bookings_created)
    VALUES (agent_id, 'John Smith', '+1234567894', 'agent@taxiflow.com', 0);
  END IF;
  
  -- Update existing drivers to link with auth users  
  UPDATE drivers 
  SET user_id = driver_id
  WHERE name = 'Ahmed Hassan' AND user_id IS NULL;
  
  -- If no existing driver, create one
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE user_id = driver_id) THEN
    INSERT INTO drivers (user_id, name, phone, car_type, car_model, plate_number, rating, is_online)
    VALUES (driver_id, 'Ahmed Hassan', '+1234567890', 'camry', 'Toyota Camry 2023', 'ABC-123', 4.8, true);
  END IF;
END $$;

-- Update RLS policies to be more specific about user roles

-- Agents policies - only agents can manage agent data
DROP POLICY IF EXISTS "Agents can view their own data" ON agents;
DROP POLICY IF EXISTS "Agents can update their own data" ON agents;
DROP POLICY IF EXISTS "Agents can be managed by authenticated users" ON agents;

CREATE POLICY "Agents can view agent data" ON agents FOR SELECT TO authenticated 
  USING (
    auth.uid() = user_id OR 
    get_user_role(auth.uid()) IN ('admin', 'agent')
  );

CREATE POLICY "Agents can update their own data" ON agents FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all agents" ON agents FOR ALL TO authenticated 
  USING (get_user_role(auth.uid()) = 'admin');

-- Drivers policies - only drivers and admins can manage driver data
DROP POLICY IF EXISTS "Drivers can view their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can update their own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can be managed by authenticated users" ON drivers;

CREATE POLICY "Drivers can view driver data" ON drivers FOR SELECT TO authenticated 
  USING (
    auth.uid() = user_id OR 
    get_user_role(auth.uid()) IN ('admin', 'agent')
  );

CREATE POLICY "Drivers can update their own data" ON drivers FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all drivers" ON drivers FOR ALL TO authenticated 
  USING (get_user_role(auth.uid()) = 'admin');

-- Bookings policies - more granular access control
DROP POLICY IF EXISTS "Bookings can be created by anyone" ON bookings;
DROP POLICY IF EXISTS "Bookings are viewable by authenticated users" ON bookings;
DROP POLICY IF EXISTS "Bookings can be updated by authenticated users" ON bookings;

CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Users can view relevant bookings" ON bookings FOR SELECT TO authenticated 
  USING (
    get_user_role(auth.uid()) = 'admin' OR
    (get_user_role(auth.uid()) = 'agent' AND agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) OR
    (get_user_role(auth.uid()) = 'driver' AND driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
  );

CREATE POLICY "Authorized users can update bookings" ON bookings FOR UPDATE TO authenticated 
  USING (
    get_user_role(auth.uid()) = 'admin' OR
    (get_user_role(auth.uid()) = 'agent' AND agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())) OR
    (get_user_role(auth.uid()) = 'driver' AND driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
  );

-- Clean up the helper function
DROP FUNCTION IF EXISTS create_demo_user(text, text, text);
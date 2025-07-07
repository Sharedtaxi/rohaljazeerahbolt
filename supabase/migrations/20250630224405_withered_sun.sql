-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to authenticate users
CREATE OR REPLACE FUNCTION authenticate_user(
  p_identifier TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record app_users%ROWTYPE;
  profile_data JSON;
  result JSON;
BEGIN
  -- Find user by identifier (name, mobile, or email)
  SELECT * INTO user_record
  FROM app_users
  WHERE (
    LOWER(full_name) = LOWER(p_identifier) OR
    phone = p_identifier OR
    LOWER(email) = LOWER(p_identifier)
  )
  AND is_active = true
  LIMIT 1;

  -- Check if user exists
  IF user_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Verify password
  IF user_record.password_hash != crypt(p_password, user_record.password_hash) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password'
    );
  END IF;

  -- Get profile data based on user type
  IF user_record.user_type = 'driver' THEN
    SELECT json_build_object(
      'car_type', d.car_type,
      'car_model', d.car_model,
      'plate_number', d.plate_number,
      'rating', d.rating,
      'is_online', d.is_online
    ) INTO profile_data
    FROM drivers d
    WHERE d.app_user_id = user_record.id;
  ELSIF user_record.user_type = 'agent' THEN
    SELECT json_build_object(
      'bookings_created', a.bookings_created
    ) INTO profile_data
    FROM agents a
    WHERE a.app_user_id = user_record.id;
  ELSE
    profile_data := json_build_object();
  END IF;

  -- Return success with user data
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', user_record.id,
      'email', user_record.email,
      'full_name', user_record.full_name,
      'phone', user_record.phone
    ),
    'user_type', user_record.user_type,
    'profile', profile_data
  );
END;
$$;

-- Function to register drivers
CREATE OR REPLACE FUNCTION register_driver(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_car_type TEXT,
  p_car_model TEXT,
  p_plate_number TEXT,
  p_license_number TEXT DEFAULT NULL,
  p_iqama_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  new_driver_id UUID;
BEGIN
  -- Check if user already exists
  IF EXISTS (
    SELECT 1 FROM app_users 
    WHERE email = p_email OR phone = p_phone OR LOWER(full_name) = LOWER(p_full_name)
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already exists with this email, phone, or name'
    );
  END IF;

  -- Insert into app_users
  INSERT INTO app_users (email, full_name, phone, user_type, password_hash)
  VALUES (p_email, p_full_name, p_phone, 'driver', crypt(p_password, gen_salt('bf')))
  RETURNING id INTO new_user_id;

  -- Insert into drivers
  INSERT INTO drivers (app_user_id, name, phone, car_type, car_model, plate_number)
  VALUES (new_user_id, p_full_name, p_phone, p_car_type, p_car_model, p_plate_number)
  RETURNING id INTO new_driver_id;

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'driver_id', new_driver_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to register agents
CREATE OR REPLACE FUNCTION register_agent(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_work_industry TEXT DEFAULT NULL,
  p_iqama_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  new_agent_id UUID;
BEGIN
  -- Check if user already exists
  IF EXISTS (
    SELECT 1 FROM app_users 
    WHERE email = p_email OR phone = p_phone OR LOWER(full_name) = LOWER(p_full_name)
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User already exists with this email, phone, or name'
    );
  END IF;

  -- Insert into app_users
  INSERT INTO app_users (email, full_name, phone, user_type, password_hash)
  VALUES (p_email, p_full_name, p_phone, 'agent', crypt(p_password, gen_salt('bf')))
  RETURNING id INTO new_user_id;

  -- Insert into agents
  INSERT INTO agents (app_user_id, name, phone, email)
  VALUES (new_user_id, p_full_name, p_phone, p_email)
  RETURNING id INTO new_agent_id;

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'agent_id', new_agent_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Insert or update demo users
DO $$
DECLARE
  admin_user_id UUID;
  agent_user_id UUID;
  driver_user_id UUID;
BEGIN
  -- Handle demo admin
  SELECT id INTO admin_user_id FROM app_users WHERE email = 'admin@rohaljazeera.com';
  
  IF admin_user_id IS NULL THEN
    INSERT INTO app_users (email, full_name, phone, user_type, password_hash, is_active)
    VALUES (
      'admin@rohaljazeera.com',
      'admin',
      '+966500000001',
      'admin',
      crypt('admin123', gen_salt('bf')),
      true
    )
    RETURNING id INTO admin_user_id;
  ELSE
    -- Update existing admin user
    UPDATE app_users 
    SET 
      full_name = 'admin',
      phone = '+966500000001',
      user_type = 'admin',
      password_hash = crypt('admin123', gen_salt('bf')),
      is_active = true
    WHERE id = admin_user_id;
  END IF;

  -- Handle demo agent
  SELECT id INTO agent_user_id FROM app_users WHERE email = 'agent@rohaljazeera.com';
  
  IF agent_user_id IS NULL THEN
    INSERT INTO app_users (email, full_name, phone, user_type, password_hash, is_active)
    VALUES (
      'agent@rohaljazeera.com',
      'agent',
      '+966500000002',
      'agent',
      crypt('agent123', gen_salt('bf')),
      true
    )
    RETURNING id INTO agent_user_id;
    
    -- Create corresponding agent record
    INSERT INTO agents (app_user_id, name, phone, email, bookings_created)
    VALUES (agent_user_id, 'agent', '+966500000002', 'agent@rohaljazeera.com', 0);
  ELSE
    -- Update existing agent user
    UPDATE app_users 
    SET 
      full_name = 'agent',
      phone = '+966500000002',
      user_type = 'agent',
      password_hash = crypt('agent123', gen_salt('bf')),
      is_active = true
    WHERE id = agent_user_id;
    
    -- Update or create agent record
    IF NOT EXISTS (SELECT 1 FROM agents WHERE app_user_id = agent_user_id) THEN
      INSERT INTO agents (app_user_id, name, phone, email, bookings_created)
      VALUES (agent_user_id, 'agent', '+966500000002', 'agent@rohaljazeera.com', 0);
    ELSE
      UPDATE agents 
      SET name = 'agent', phone = '+966500000002', email = 'agent@rohaljazeera.com'
      WHERE app_user_id = agent_user_id;
    END IF;
  END IF;

  -- Handle demo driver
  SELECT id INTO driver_user_id FROM app_users WHERE email = 'driver@rohaljazeera.com';
  
  IF driver_user_id IS NULL THEN
    INSERT INTO app_users (email, full_name, phone, user_type, password_hash, is_active)
    VALUES (
      'driver@rohaljazeera.com',
      'driver',
      '+966500000003',
      'driver',
      crypt('driver123', gen_salt('bf')),
      true
    )
    RETURNING id INTO driver_user_id;
    
    -- Create corresponding driver record
    INSERT INTO drivers (app_user_id, name, phone, car_type, car_model, plate_number, rating, is_online)
    VALUES (driver_user_id, 'driver', '+966500000003', 'camry', 'Toyota Camry', 'ABC-1234', 5.0, true);
  ELSE
    -- Update existing driver user
    UPDATE app_users 
    SET 
      full_name = 'driver',
      phone = '+966500000003',
      user_type = 'driver',
      password_hash = crypt('driver123', gen_salt('bf')),
      is_active = true
    WHERE id = driver_user_id;
    
    -- Update or create driver record
    IF NOT EXISTS (SELECT 1 FROM drivers WHERE app_user_id = driver_user_id) THEN
      INSERT INTO drivers (app_user_id, name, phone, car_type, car_model, plate_number, rating, is_online)
      VALUES (driver_user_id, 'driver', '+966500000003', 'camry', 'Toyota Camry', 'ABC-1234', 5.0, true);
    ELSE
      UPDATE drivers 
      SET name = 'driver', phone = '+966500000003', car_type = 'camry', car_model = 'Toyota Camry', plate_number = 'ABC-1234'
      WHERE app_user_id = driver_user_id;
    END IF;
  END IF;
END $$;
/*
  # Add CSR (Customer Service Representative) Support

  1. Database Updates
    - Update app_users table to support 'csr' user type
    - Create CSR registration function
    - Update authentication function to handle CSR
    - Add demo CSR user

  2. Security
    - Maintain existing RLS policies
    - Add CSR-specific data handling
*/

-- Update the user_type check constraint to include 'csr'
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_user_type_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_user_type_check 
  CHECK (user_type IN ('admin', 'agent', 'driver', 'customer', 'csr'));

-- Create function to register CSR
CREATE OR REPLACE FUNCTION register_csr(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_passport_iqama_cnic TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
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
  VALUES (p_email, p_full_name, p_phone, 'csr', crypt(p_password, gen_salt('bf')))
  RETURNING id INTO new_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'CSR registered successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Update authenticate_user function to handle CSR
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

-- Insert demo CSR user
DO $$
DECLARE
  csr_user_id UUID;
BEGIN
  -- Handle demo CSR
  SELECT id INTO csr_user_id FROM app_users WHERE email = 'csr@rohaljazeera.com';
  
  IF csr_user_id IS NULL THEN
    INSERT INTO app_users (email, full_name, phone, user_type, password_hash, is_active)
    VALUES (
      'csr@rohaljazeera.com',
      'csr',
      '+966500000004',
      'csr',
      crypt('csr123', gen_salt('bf')),
      true
    )
    RETURNING id INTO csr_user_id;
  ELSE
    -- Update existing CSR user
    UPDATE app_users 
    SET 
      full_name = 'csr',
      phone = '+966500000004',
      user_type = 'csr',
      password_hash = crypt('csr123', gen_salt('bf')),
      is_active = true
    WHERE id = csr_user_id;
  END IF;

  RAISE NOTICE 'Demo CSR user created/updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating demo CSR user: %', SQLERRM;
END $$;
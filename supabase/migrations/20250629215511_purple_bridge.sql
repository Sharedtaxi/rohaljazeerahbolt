/*
  # Seed Initial Data for Taxi Aggregator

  1. Car Types Data
    - Insert predefined car types (Camry, Starx, GMC, Hiace)

  2. Routes Data
    - Insert predefined routes with pricing for each car type

  3. Sample Drivers
    - Insert sample drivers for testing

  4. Sample Agents
    - Insert sample agents for testing
*/

-- Insert car types
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
('camry', 'Toyota Camry', 'Comfortable sedan for business trips', 4, ARRAY['AC', 'Leather Seats', 'WiFi', 'Phone Charger'], '🚗'),
('starx', 'Starx SUV', 'Spacious SUV for family travel', 6, ARRAY['AC', 'Spacious', 'Entertainment System', 'Child Seats Available'], '🚙'),
('gmc', 'GMC Suburban', 'Premium large SUV for groups', 8, ARRAY['Premium AC', 'Luxury Interior', 'Entertainment', 'Extra Luggage Space'], '🚐'),
('hiace', 'Toyota Hiace', 'Van for large groups and events', 14, ARRAY['AC', 'Multiple Rows', 'Large Capacity', 'Event Transport'], '🚌')
ON CONFLICT (id) DO NOTHING;

-- Insert routes
INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
('airport-downtown', 'International Airport', 'Downtown Business District', '25 km', '35 min', '{"camry": 45, "starx": 60, "gmc": 85, "hiace": 120}'),
('downtown-mall', 'Downtown Business District', 'Grand Shopping Mall', '12 km', '20 min', '{"camry": 25, "starx": 35, "gmc": 50, "hiace": 70}'),
('hotel-conference', 'Luxury Hotel District', 'Convention Center', '8 km', '15 min', '{"camry": 20, "starx": 28, "gmc": 40, "hiace": 55}'),
('university-airport', 'University Campus', 'International Airport', '35 km', '45 min', '{"camry": 55, "starx": 75, "gmc": 100, "hiace": 140}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, name, phone, email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Robert Davis', '+1234567896', 'robert@email.com'),
('550e8400-e29b-41d4-a716-446655440002', 'Maria Garcia', '+1234567897', 'maria@email.com')
ON CONFLICT (id) DO NOTHING;

-- Note: Drivers and agents will be created when users sign up through the authentication system
-- For now, we'll create some sample data without user_id references for testing

INSERT INTO drivers (id, name, phone, car_type, car_model, plate_number, rating, is_online) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Ahmed Hassan', '+1234567890', 'camry', 'Toyota Camry 2023', 'ABC-123', 4.8, true),
('550e8400-e29b-41d4-a716-446655440011', 'Sarah Johnson', '+1234567891', 'starx', 'Starx SUV 2024', 'XYZ-456', 4.9, true),
('550e8400-e29b-41d4-a716-446655440012', 'Mohammed Ali', '+1234567892', 'gmc', 'GMC Suburban 2023', 'GMC-789', 4.7, false),
('550e8400-e29b-41d4-a716-446655440013', 'Lisa Chen', '+1234567893', 'hiace', 'Toyota Hiace 2024', 'VAN-321', 4.6, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (id, name, phone, email, bookings_created) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'John Smith', '+1234567894', 'john@taxicompany.com', 156),
('550e8400-e29b-41d4-a716-446655440021', 'Emma Wilson', '+1234567895', 'emma@taxicompany.com', 243)
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (id, customer_id, route_id, car_type, driver_id, agent_id, status, pickup_time, pickup_location, special_instructions, price) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 'airport-downtown', 'camry', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 'pickup', '2024-01-15T14:30:00Z', 'Terminal 2, Gate 5', 'Customer will be at arrivals with blue jacket', 45),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440002', 'downtown-mall', 'starx', NULL, NULL, 'pending', '2024-01-15T16:00:00Z', 'Main Street Plaza', NULL, 35)
ON CONFLICT (id) DO NOTHING;
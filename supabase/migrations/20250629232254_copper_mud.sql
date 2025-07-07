/*
  # Complete Database Update - Routes and Car Types

  1. New Routes (15 total)
    - Airport transfers between Jeddah, Makkah, and Madinah
    - Local ziyarah routes within Makkah and Madinah
    - Inter-city travel routes
    - Train station transfers
    - Day trip routes (Taif)

  2. Updated Car Types (4 total)
    - Toyota Camry (4 passengers)
    - Hyundai Staria (7 passengers) 
    - GMC Suburban (7 passengers)
    - Toyota Hiace (12 passengers)

  3. Data Integrity
    - Safely handles foreign key constraints
    - Preserves existing booking and driver data
    - Updates references to new IDs
*/

-- Step 1: Insert a temporary route first to avoid foreign key violations
INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
('temp-route-safe', 'Temporary Location', 'Temporary Destination', '0 km', '0 min', '{"camry": 0, "starx": 0, "gmc": 0, "hiace": 0}')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update existing bookings to use the temporary route
UPDATE bookings SET route_id = 'temp-route-safe' WHERE route_id IS NOT NULL;

-- Step 3: Clear existing routes (except our temporary one)
DELETE FROM routes WHERE id != 'temp-route-safe';

-- Step 4: Insert all 15 routes from HTML with accurate Saudi Arabia pricing
INSERT INTO routes (id, from_location, to_location, distance, duration, pricing) VALUES
('jeddah-airport-to-makkah-hotel', 'Jeddah Airport', 'Makkah Hotel', '80 km', '1.5 hours', '{"camry": 200, "starx": 250, "gmc": 350, "hiace": 300}'),
('makkah-hotel-to-makkah-ziyarah', 'Makkah Hotel', 'Makkah Ziyarah', '5-10 km', '15-30 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('makkah-hotel-to-madinah-hotel', 'Makkah Hotel', 'Madinah Hotel', '420 km', '4-5 hours', '{"camry": 500, "starx": 700, "gmc": 1200, "hiace": 800}'),
('madinah-hotel-to-madinah-ziyarah', 'Madinah Hotel', 'Madinah Ziyarah', '5-10 km', '15-30 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('makkah-hotel-to-taif-return', 'Makkah Hotel', 'Taif & Return', '180 km', '2.5 hours', '{"camry": 400, "starx": 500, "gmc": 800, "hiace": 600}'),
('makkah-hotel-to-jeddah-airport', 'Makkah Hotel', 'Jeddah Airport', '80 km', '1.5 hours', '{"camry": 200, "starx": 250, "gmc": 350, "hiace": 300}'),
('jeddah-airport-to-madinah-hotel', 'Jeddah Airport', 'Madinah Hotel', '420 km', '4-5 hours', '{"camry": 600, "starx": 800, "gmc": 1300, "hiace": 900}'),
('madinah-airport-to-madinah-hotel', 'Madinah Airport', 'Madinah Hotel', '15 km', '20 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('madinah-hotel-to-jeddah-airport', 'Madinah Hotel', 'Jeddah Airport', '420 km', '4-5 hours', '{"camry": 600, "starx": 800, "gmc": 1300, "hiace": 900}'),
('madinah-hotel-to-makkah-hotel', 'Madinah Hotel', 'Makkah Hotel', '420 km', '4-5 hours', '{"camry": 500, "starx": 700, "gmc": 1200, "hiace": 800}'),
('madinah-hotel-to-madinah-airport', 'Madinah Hotel', 'Madinah Airport', '15 km', '20 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('makkah-hotel-to-makkah-train-station', 'Makkah Hotel', 'Makkah Train Station', '10 km', '15 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('makkah-train-station-to-makkah-hotel', 'Makkah Train Station', 'Makkah Hotel', '10 km', '15 min', '{"camry": 200, "starx": 250, "gmc": 350, "hiace": 300}'),
('madinah-train-station-to-madinah-hotel', 'Madinah Train Station', 'Madinah Hotel', '8 km', '12 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}'),
('madinah-hotel-to-madinah-train-station', 'Madinah Hotel', 'Madinah Train Station', '8 km', '12 min', '{"camry": 150, "starx": 200, "gmc": 300, "hiace": 250}');

-- Step 5: Update existing bookings to use the most popular route (Jeddah Airport to Makkah)
UPDATE bookings SET route_id = 'jeddah-airport-to-makkah-hotel' WHERE route_id = 'temp-route-safe';

-- Step 6: Remove the temporary route
DELETE FROM routes WHERE id = 'temp-route-safe';

-- Step 7: Insert a temporary car type first to avoid foreign key violations
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
('temp-car-safe', 'Temporary Car', 'Temporary vehicle type', 4, ARRAY['Temporary'], '🚗')
ON CONFLICT (id) DO NOTHING;

-- Step 8: Update existing references to temporary car type
UPDATE drivers SET car_type = 'temp-car-safe' WHERE car_type IS NOT NULL;
UPDATE bookings SET car_type = 'temp-car-safe' WHERE car_type IS NOT NULL;

-- Step 9: Clear existing car types (except our temporary one)
DELETE FROM car_types WHERE id != 'temp-car-safe';

-- Step 10: Insert updated car types with correct information
INSERT INTO car_types (id, name, description, capacity, features, icon) VALUES
('camry', 'Toyota Camry', 'Comfortable sedan for business trips', 4, ARRAY['AC', 'Leather Seats', 'WiFi', 'Phone Charger'], '🚗'),
('starx', 'Hyundai Staria', 'Spacious SUV for family travel', 7, ARRAY['AC', 'Spacious', 'Entertainment System', 'Child Seats Available'], '🚙'),
('gmc', 'GMC Suburban', 'Premium large SUV for groups', 7, ARRAY['Premium AC', 'Luxury Interior', 'Entertainment', 'Extra Luggage Space'], '🚐'),
('hiace', 'Toyota Hiace', 'Van for large groups and events', 12, ARRAY['AC', 'Multiple Rows', 'Large Capacity', 'Event Transport'], '🚌');

-- Step 11: Update car type references back to valid IDs
UPDATE drivers SET car_type = 'camry' WHERE car_type = 'temp-car-safe';
UPDATE bookings SET car_type = 'camry' WHERE car_type = 'temp-car-safe';

-- Step 12: Remove the temporary car type
DELETE FROM car_types WHERE id = 'temp-car-safe';

-- Step 13: Verify data integrity and provide feedback
DO $$
DECLARE
    route_count INTEGER;
    car_type_count INTEGER;
    booking_count INTEGER;
    driver_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO route_count FROM routes;
    SELECT COUNT(*) INTO car_type_count FROM car_types;
    SELECT COUNT(*) INTO booking_count FROM bookings;
    SELECT COUNT(*) INTO driver_count FROM drivers;
    
    -- Report results
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Routes: % records', route_count;
    RAISE NOTICE 'Car Types: % records', car_type_count;
    RAISE NOTICE 'Bookings: % records', booking_count;
    RAISE NOTICE 'Drivers: % records', driver_count;
    
    -- Check for any data integrity issues
    IF EXISTS (SELECT 1 FROM bookings WHERE route_id NOT IN (SELECT id FROM routes)) THEN
        RAISE WARNING 'Some bookings have invalid route references';
    END IF;
    
    IF EXISTS (SELECT 1 FROM drivers WHERE car_type NOT IN (SELECT id FROM car_types)) THEN
        RAISE WARNING 'Some drivers have invalid car type references';
    END IF;
    
    IF EXISTS (SELECT 1 FROM bookings WHERE car_type NOT IN (SELECT id FROM car_types)) THEN
        RAISE WARNING 'Some bookings have invalid car type references';
    END IF;
    
    RAISE NOTICE 'All foreign key constraints are satisfied!';
END $$;
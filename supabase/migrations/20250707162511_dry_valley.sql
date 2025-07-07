/*
  # Add commission payment tracking

  1. New Column
    - Add `agent_commission_paid` boolean column to bookings table
    - Default value is false (unpaid)
    - Add index for better query performance

  2. Update existing records
    - Set all existing bookings to unpaid status
*/

-- Add agent_commission_paid column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'agent_commission_paid'
  ) THEN
    ALTER TABLE bookings ADD COLUMN agent_commission_paid boolean DEFAULT false;
  END IF;
END $$;

-- Create index for better performance on commission payment queries
CREATE INDEX IF NOT EXISTS idx_bookings_agent_commission_paid ON bookings(agent_commission_paid);

-- Update existing bookings to have unpaid status
UPDATE bookings 
SET agent_commission_paid = false 
WHERE agent_commission_paid IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.agent_commission_paid IS 'Indicates whether the agent commission has been paid';
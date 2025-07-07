/*
  # Add Agent Commission to Bookings

  1. Database Changes
    - Add `agent_commission` column to bookings table
    - This will store the dynamic commission amount entered by agents
    - Can be edited by admins if needed

  2. Data Migration
    - Set default commission to 0 for existing bookings
    - Ensure proper indexing for performance
*/

-- Add agent_commission column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'agent_commission'
  ) THEN
    ALTER TABLE bookings ADD COLUMN agent_commission numeric(10,2) DEFAULT 0.00;
  END IF;
END $$;

-- Create index for better performance on agent commission queries
CREATE INDEX IF NOT EXISTS idx_bookings_agent_commission ON bookings(agent_commission);

-- Update existing bookings to have 0 commission if they don't have an agent
UPDATE bookings 
SET agent_commission = 0.00 
WHERE agent_commission IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.agent_commission IS 'Dynamic commission amount entered by agent and editable by admin';
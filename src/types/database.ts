export interface Database {
  public: {
    Tables: {
      car_types: {
        Row: {
          id: string;
          name: string;
          description: string;
          capacity: number;
          features: string[];
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          capacity: number;
          features?: string[];
          icon: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          capacity?: number;
          features?: string[];
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          from_location: string;
          to_location: string;
          distance: string;
          duration: string;
          pricing: Record<string, number>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          from_location: string;
          to_location: string;
          distance: string;
          duration: string;
          pricing: Record<string, number>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          from_location?: string;
          to_location?: string;
          distance?: string;
          duration?: string;
          pricing?: Record<string, number>;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          car_type: string;
          car_model: string;
          plate_number: string;
          rating: number;
          is_online: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          car_type: string;
          car_model: string;
          plate_number: string;
          rating?: number;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          car_type?: string;
          car_model?: string;
          plate_number?: string;
          rating?: number;
          is_online?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      agents: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          phone: string;
          email: string;
          bookings_created: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          phone: string;
          email: string;
          bookings_created?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          phone?: string;
          email?: string;
          bookings_created?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          route_id: string;
          car_type: string;
          driver_id: string | null;
          agent_id: string | null;
          status: string;
          pickup_time: string;
          pickup_location: string;
          special_instructions: string | null;
          price: number;
          agent_commission: number | null;
          agent_commission_paid: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          route_id: string;
          car_type: string;
          driver_id?: string | null;
          agent_id?: string | null;
          status?: string;
          pickup_time: string;
          pickup_location: string;
          special_instructions?: string | null;
          price: number;
          agent_commission?: number | null;
          agent_commission_paid?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          route_id?: string;
          car_type?: string;
          driver_id?: string | null;
          agent_id?: string | null;
          status?: string;
          pickup_time?: string;
          pickup_location?: string;
          special_instructions?: string | null;
          price?: number;
          agent_commission?: number | null;
          agent_commission_paid?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
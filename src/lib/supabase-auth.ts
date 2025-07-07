import { supabase } from './supabase';

export interface RegisterDriverData {
  fullName: string;
  mobile: string;
  email?: string;
  carType: string;
  customCarName?: string;
  make: string;
  model: string;
  registrationExpiry: string;
  plateNumber: string;
  licenseNumber: string;
  iqamaNumber: string;
  password: string;
}

export interface RegisterAgentData {
  fullName: string;
  mobile: string;
  email?: string;
  workIndustry: string;
  iqamaNumber?: string;
  password: string;
}

export interface RegisterCSRData {
  fullName: string;
  mobile: string;
  email?: string;
  passportIqamaCnic?: string;
  password: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export const authHelpers = {
  // Register a new driver
  async registerDriver(data: RegisterDriverData) {
    try {
      const carModel = data.carType === 'luxury' 
        ? data.customCarName! 
        : `${data.make} ${data.model}`;

      const { data: result, error } = await supabase.rpc('register_driver', {
        p_email: data.email || `${data.mobile.replace('+', '')}@temp.rohaljazeera.com`,
        p_password: data.password,
        p_full_name: data.fullName,
        p_phone: data.mobile,
        p_car_type: data.carType === 'luxury' ? 'luxury' : data.carType,
        p_car_model: carModel,
        p_plate_number: data.plateNumber,
        p_license_number: data.licenseNumber,
        p_iqama_number: data.iqamaNumber
      });

      if (error) {
        console.error('Driver registration error:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Driver registration error:', error);
      throw error;
    }
  },

  // Register a new agent
  async registerAgent(data: RegisterAgentData) {
    try {
      const { data: result, error } = await supabase.rpc('register_agent', {
        p_email: data.email || `${data.mobile.replace('+', '')}@temp.rohaljazeera.com`,
        p_password: data.password,
        p_full_name: data.fullName,
        p_phone: data.mobile,
        p_work_industry: data.workIndustry,
        p_iqama_number: data.iqamaNumber
      });

      if (error) {
        console.error('Agent registration error:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Agent registration error:', error);
      throw error;
    }
  },

  // Register a new CSR
  async registerCSR(data: RegisterCSRData) {
    try {
      const { data: result, error } = await supabase.rpc('register_csr', {
        p_email: data.email || `${data.mobile.replace('+', '')}@temp.rohaljazeera.com`,
        p_password: data.password,
        p_full_name: data.fullName,
        p_phone: data.mobile,
        p_passport_iqama_cnic: data.passportIqamaCnic
      });

      if (error) {
        console.error('CSR registration error:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('CSR registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(loginData: LoginData) {
    try {
      const { data: result, error } = await supabase.rpc('authenticate_user', {
        p_identifier: loginData.identifier,
        p_password: loginData.password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Demo login for testing
  async demoLogin(userType: 'admin' | 'agent' | 'driver' | 'csr') {
    const credentials = {
      admin: { identifier: 'admin', password: 'admin123' },
      agent: { identifier: 'agent', password: 'agent123' },
      driver: { identifier: 'driver', password: 'driver123' },
      csr: { identifier: 'csr', password: 'csr123' }
    };

    return this.login(credentials[userType]);
  }
};
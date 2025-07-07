import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff, Mail, Phone, Car, Building2, FileText, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authHelpers, RegisterDriverData, RegisterAgentData, RegisterCSRData } from '../../lib/supabase-auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser, setCurrentPortal, carTypes } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'agent' | 'driver' | 'csr'>('driver');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '', // can be name, mobile, or email
    password: ''
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    carType: '',
    customCarName: '',
    make: '',
    model: '',
    registrationExpiry: '',
    plateNumber: '',
    licenseNumber: '',
    iqamaNumber: '',
    workIndustry: '',
    password: '',
    confirmPassword: '',
    passportIqamaCnic: '',
    acceptTerms: false
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setLoginData({ identifier: '', password: '' });
    setRegisterData({
      fullName: '',
      mobile: '',
      email: '',
      carType: '',
      customCarName: '',
      make: '',
      model: '',
      registrationExpiry: '',
      plateNumber: '',
      licenseNumber: '',
      iqamaNumber: '',
      workIndustry: '',
      passportIqamaCnic: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateRegistration = () => {
    if (!registerData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!registerData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }

    if (!/^\+[1-9]\d{1,14}$/.test(registerData.mobile.trim())) {
      setError('Please enter a valid mobile number with country code (e.g. +966501234567)');
      return false;
    }

    if (userType === 'driver') {
      if (!registerData.carType) {
        setError('Please select a car type');
        return false;
      }

      if (registerData.carType === 'luxury' && !registerData.customCarName.trim()) {
        setError('Please specify your luxury car name');
        return false;
      }

      if (!registerData.make.trim()) {
        setError('Car make is required');
        return false;
      }

      if (!registerData.model.trim()) {
        setError('Car model is required');
        return false;
      }

      if (!registerData.registrationExpiry) {
        setError('Registration expiry date is required');
        return false;
      }

      if (!registerData.plateNumber.trim()) {
        setError('Plate number is required');
        return false;
      }

      if (!registerData.licenseNumber.trim()) {
        setError('Driver license number is required');
        return false;
      }

      if (!registerData.iqamaNumber.trim()) {
        setError('Iqama number is required');
        return false;
      }
    }

    if (userType === 'agent') {
      if (!registerData.workIndustry.trim()) {
        setError('Work industry is required');
        return false;
      }
    }

    if (userType === 'csr') {
      if (!registerData.passportIqamaCnic.trim()) {
        setError('Passport/Iqama/CNIC number is required');
        return false;
      }
    }

    if (!registerData.password) {
      setError('Password is required');
      return false;
    }

    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!registerData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authHelpers.login(loginData);
      
      if (result.success) {
        const user = {
          id: result.user.id,
          name: result.user.full_name,
          email: result.user.email,
          role: result.user_type as 'admin' | 'agent' | 'driver' | 'customer',
          carType: result.profile?.car_type
        };

        setCurrentUser(user);
        setCurrentPortal(result.user_type as 'admin' | 'agent' | 'driver' | 'csr');
        handleClose();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUserType: 'admin' | 'agent' | 'driver') => {
    setLoading(true);
    setError('');

    try {
      const result = await authHelpers.demoLogin(demoUserType);
      
      if (result.success) {
        const user = {
          id: result.user.id,
          name: result.user.full_name,
          email: result.user.email,
          role: result.user_type as 'admin' | 'agent' | 'driver' | 'customer',
          carType: result.profile?.car_type
        };

        setCurrentUser(user);
        setCurrentPortal(result.user_type as 'admin' | 'agent' | 'driver' | 'csr');
        handleClose();
      } else {
        setError(result.error || 'Demo login failed');
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      setError(error.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistration()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (userType === 'driver') {
        const driverData: RegisterDriverData = {
          fullName: registerData.fullName,
          mobile: registerData.mobile,
          email: registerData.email,
          carType: registerData.carType,
          customCarName: registerData.customCarName,
          make: registerData.make,
          model: registerData.model,
          registrationExpiry: registerData.registrationExpiry,
          plateNumber: registerData.plateNumber,
          licenseNumber: registerData.licenseNumber,
          iqamaNumber: registerData.iqamaNumber,
          password: registerData.password
        };

        const result = await authHelpers.registerDriver(driverData);
        
        if (result.success) {
          alert('Driver registration submitted successfully! Your account will be reviewed and activated within 24 hours. You will receive a confirmation via SMS.');
          handleClose();
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (userType === 'agent') {
        const agentData: RegisterAgentData = {
          fullName: registerData.fullName,
          mobile: registerData.mobile,
          email: registerData.email,
          workIndustry: registerData.workIndustry,
          iqamaNumber: registerData.iqamaNumber,
          password: registerData.password
        };

        const result = await authHelpers.registerAgent(agentData);
        
        if (result.success) {
          alert('Agent registration submitted successfully! Your account will be reviewed and activated within 24 hours. You will receive a confirmation via SMS.');
          handleClose();
        } else {
          setError(result.error || 'Registration failed');
        }
      } else if (userType === 'csr') {
        const csrData: RegisterCSRData = {
          fullName: registerData.fullName,
          mobile: registerData.mobile,
          email: registerData.email,
          passportIqamaCnic: registerData.passportIqamaCnic,
          password: registerData.password
        };

        const result = await authHelpers.registerCSR(csrData);
        
        if (result.success) {
          alert('CSR registration submitted successfully! Your account will be reviewed and activated within 24 hours. You will receive a confirmation via SMS.');
          handleClose();
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTermsModal = () => {
    if (!showTerms) return null;

    const csrTerms = `
CUSTOMER SERVICE REPRESENTATIVE TERMS AND CONDITIONS - ROH AL JAZEERA TRANSPORT SERVICES

1. CSR RESPONSIBILITIES
- Provide excellent customer service at all times
- Handle customer inquiries, complaints, and booking requests
- Maintain professional communication standards
- Accurate data entry and record keeping
- Follow company protocols and procedures

2. DATA PRIVACY AND CONFIDENTIALITY
- STRICT CONFIDENTIALITY: All customer information is strictly confidential
- NO DATA SHARING: Customer data must never be shared with unauthorized parties
- SECURE HANDLING: All customer records must be handled securely
- PRIVACY PROTECTION: Customer privacy is paramount and must be protected
- DATA BREACH PREVENTION: Report any potential data breaches immediately

3. CUSTOMER DATA PROTECTION
- Personal information (names, phone numbers, addresses) is confidential
- Payment information must be handled with extreme care
- Travel details and preferences are private customer data
- No screenshots, photos, or copies of customer data allowed
- Access to customer data is for work purposes only

4. COMMUNICATION STANDARDS
- Professional and courteous communication required
- Accurate information provision to customers
- Timely response to customer inquiries
- Proper escalation of complex issues
- Documentation of all customer interactions

5. WORKING HOURS AND AVAILABILITY
- Flexible scheduling with minimum commitment requirements
- 24/7 customer support coverage participation
- Peak hour availability preferred
- Emergency response protocols

6. PERFORMANCE STANDARDS
- Customer satisfaction ratings maintenance
- Response time requirements compliance
- Quality assurance standards adherence
- Continuous improvement and training participation

7. CONFIDENTIALITY AGREEMENT
- Non-disclosure of company information
- Customer data protection compliance
- Trade secrets and business information security
- Violation consequences clearly defined

8. TERMINATION AND DATA SECURITY
- 30 days notice required for termination
- Immediate return of all company materials
- Deletion of any customer data from personal devices
- Final confidentiality compliance verification

9. LEGAL COMPLIANCE
- Saudi Arabia data protection laws compliance
- International privacy standards adherence
- Regular training on privacy regulations
- Audit and compliance monitoring

By accepting these terms, you commit to maintaining the highest standards of customer service and data protection for ROH AL JAZEERA customers.
    `;

    const driverTerms = `
DRIVER TERMS AND CONDITIONS - ROH AL JAZEERA TRANSPORT SERVICES

1. DRIVER REQUIREMENTS
- Valid Saudi driving license
- Valid Iqama (residence permit)
- Vehicle registration and insurance
- Clean driving record
- Professional conduct at all times

2. VEHICLE STANDARDS
- Vehicle must be in excellent condition
- Regular maintenance required
- Cleanliness standards must be maintained
- GPS tracking system installation mandatory

3. COMMISSION STRUCTURE
- Standard commission: 20% of total fare
- Payment processed weekly
- Fuel and maintenance costs borne by driver
- Toll charges reimbursed by company

4. WORKING HOURS
- Flexible scheduling available
- Minimum 6 hours per day commitment
- Peak hour availability preferred
- 24/7 emergency service participation

5. CUSTOMER SERVICE
- Professional appearance required
- Courteous behavior mandatory
- No smoking in vehicle
- Assistance with luggage when needed

6. SAFETY REQUIREMENTS
- Adherence to traffic laws
- Regular vehicle inspections
- Emergency contact availability
- Insurance coverage verification

7. TERMINATION
- Either party may terminate with 30 days notice
- Immediate termination for policy violations
- Final payment within 7 days of termination

By accepting these terms, you agree to represent ROH AL JAZEERA with professionalism and integrity.
    `;

    const agentTerms = `
AGENT TERMS AND CONDITIONS - ROH AL JAZEERA TRANSPORT SERVICES

1. AGENT RESPONSIBILITIES
- Customer service excellence
- Accurate booking information
- Professional communication
- Brand representation

2. COMMISSION STRUCTURE
- Standard commission: 15% per confirmed booking
- Monthly payment schedule
- Performance bonuses available
- Referral incentives included

3. BOOKING REQUIREMENTS
- Complete customer information
- Accurate pickup/drop locations
- Special requirements notation
- Payment method confirmation

4. CUSTOMER RELATIONS
- 24/7 customer support
- Complaint resolution assistance
- Follow-up service quality
- Feedback collection

5. MARKETING SUPPORT
- Company promotional materials
- Digital marketing resources
- Training programs provided
- Regular updates and communication

6. PERFORMANCE STANDARDS
- Minimum monthly booking targets
- Customer satisfaction ratings
- Response time requirements
- Quality assurance compliance

7. CONFIDENTIALITY
- Customer information protection
- Company data security
- Non-disclosure agreement
- Privacy policy adherence

8. TERMINATION
- 30 days notice required
- Performance review process
- Final commission payment
- Return of company materials

By accepting these terms, you commit to maintaining the highest standards of service for ROH AL JAZEERA customers.
    `;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#1a3a5f]">Terms and Conditions</h2>
            <button
              onClick={() => setShowTerms(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {userType === 'driver' ? driverTerms : userType === 'agent' ? agentTerms : csrTerms}
            </pre>
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setShowTerms(false)}
              className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#1a3a5f]">ROH AL JAZEERA</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-[#1a3a5f] border-b-2 border-[#1a3a5f] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'register'
                  ? 'text-[#1a3a5f] border-b-2 border-[#1a3a5f] bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name, Mobile, or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Enter name, mobile, or email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType('agent')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === 'agent'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Agent</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('driver')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === 'driver'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Car className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">Driver</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('csr')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === 'csr'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-medium">CSR</span>
                    </button>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Full Name *"
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={registerData.mobile}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Mobile Number with Country Code (e.g. +966501234567) *"
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                    placeholder="Email (Optional)"
                  />
                </div>

                {/* Driver-specific fields */}
                {userType === 'driver' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Car Type *
                      </label>
                      <select
                        value={registerData.carType}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, carType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        required
                      >
                        <option value="">Select Car Type</option>
                        {carTypes.map((carType) => (
                          <option key={carType.id} value={carType.id}>
                            {carType.name} ({carType.capacity} passengers)
                          </option>
                        ))}
                        <option value="luxury">Luxury Car</option>
                      </select>
                    </div>

                    {registerData.carType === 'luxury' && (
                      <div>
                        <input
                          type="text"
                          value={registerData.customCarName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, customCarName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                          placeholder="Luxury Car Name (e.g. Mercedes S-Class) *"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={registerData.make}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, make: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Car Make *"
                        required
                      />
                      <input
                        type="text"
                        value={registerData.model}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, model: e.target.value }))}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Car Model *"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Expiry *
                      </label>
                      <input
                        type="date"
                        value={registerData.registrationExpiry}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, registrationExpiry: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={registerData.plateNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, plateNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Plate Number *"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={registerData.licenseNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Driver License Number *"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={registerData.iqamaNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, iqamaNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Iqama Number *"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Agent-specific fields */}
                {userType === 'agent' && (
                  <>
                    <div>
                      <select
                        value={registerData.workIndustry}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, workIndustry: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        required
                      >
                        <option value="">Select Work Industry *</option>
                        <option value="hotel">Hotel</option>
                        <option value="tourism">Tourism Company</option>
                        <option value="travel_agency">Travel Agency</option>
                        <option value="hajj_umrah">Hajj & Umrah Services</option>
                        <option value="corporate">Corporate Services</option>
                        <option value="individual">Individual Agent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={registerData.iqamaNumber}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, iqamaNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Iqama Number (Optional)"
                      />
                    </div>
                  </>
                )}

                {/* CSR-specific fields */}
                {userType === 'csr' && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={registerData.passportIqamaCnic}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, passportIqamaCnic: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                        placeholder="Passport/Iqama/CNIC Number *"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Password fields */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Password (min 8 characters) *"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5f] focus:border-transparent"
                      placeholder="Confirm Password *"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={registerData.acceptTerms}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                      className="mt-1 text-[#1a3a5f] focus:ring-[#1a3a5f]"
                      required
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-[#1a3a5f] hover:text-[#152b46] underline font-medium"
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a5f] text-white py-3 rounded-lg font-medium hover:bg-[#152b46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : `Register as ${userType === 'csr' ? 'CSR' : userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {renderTermsModal()}
    </>
  );
};

export default LoginModal;
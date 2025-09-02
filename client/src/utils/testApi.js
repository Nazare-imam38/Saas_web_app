import api from '../config/axios';

export const testLogin = async (email, password) => {
  try {
    console.log('🔍 Testing login with:', { email, password: '***' });
    
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Login response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error headers:', error.response?.headers);
    
    throw error;
  }
};

export const testRegister = async (userData) => {
  try {
    console.log('🔍 Testing registration with:', userData);
    
    const response = await api.post('/auth/register', userData);
    console.log('✅ Registration response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('❌ Error response:', error.response?.data);
    
    throw error;
  }
};

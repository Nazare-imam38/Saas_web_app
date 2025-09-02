import api from '../config/axios';

export const testConnection = async () => {
  try {
    console.log('🔍 Testing frontend-backend connection...');
    console.log('🔍 API base URL:', api.defaults.baseURL);
    
    // Test a simple request
    const response = await api.get('/auth/me');
    console.log('✅ Connection test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    return { success: false, error: error.message };
  }
};

export const testLogin = async (email, password) => {
  try {
    console.log('🔍 Testing login from frontend...');
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Frontend login test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Frontend login test failed:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    return { success: false, error: error.message };
  }
};

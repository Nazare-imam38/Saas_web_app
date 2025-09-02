import React, { useState } from 'react';
import { testLogin } from '../../utils/testConnection';
import api from '../../config/axios';

const LoginTest = () => {
  const [email, setEmail] = useState('nabia34@gmail.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 Testing login with:', { email, password: '***' });
      
      // Test direct API call
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Direct API call successful:', response.data);
      
      setResult({
        success: true,
        message: 'Login successful',
        data: response.data
      });
    } catch (error) {
      console.error('❌ Direct API call failed:', error);
      setResult({
        success: false,
        message: 'Login failed',
        error: error.response?.data || error.message
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Login Debug Test</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </div>
        
        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <h3 className="font-semibold">
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            <p className="mt-2">{result.message}</p>
            {result.data && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
            {result.error && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.error, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>API Base URL:</strong> {api.defaults.baseURL}</p>
          <p><strong>Current URL:</strong> {window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;

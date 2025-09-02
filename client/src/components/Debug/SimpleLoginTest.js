import React, { useState } from 'react';
import api from '../../config/axios';

const SimpleLoginTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔍 SimpleLoginTest: Starting login test...');
      console.log('🔍 SimpleLoginTest: API base URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', {
        email: 'nabia34@gmail.com',
        password: 'password123'
      });
      
      console.log('✅ SimpleLoginTest: Login successful!');
      console.log('✅ SimpleLoginTest: Response:', response);
      console.log('✅ SimpleLoginTest: Response data:', response.data);
      
      setResult({
        success: true,
        message: 'Login successful!',
        data: response.data
      });
    } catch (error) {
      console.error('❌ SimpleLoginTest: Login failed!');
      console.error('❌ SimpleLoginTest: Error:', error);
      console.error('❌ SimpleLoginTest: Error response:', error.response);
      console.error('❌ SimpleLoginTest: Error data:', error.response?.data);
      
      setResult({
        success: false,
        message: 'Login failed!',
        error: error.response?.data || error.message
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Simple Login Test</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            This test will attempt to login with <strong>nabia34@gmail.com</strong> and <strong>password123</strong>
          </p>
          <p className="text-sm text-gray-500">
            API Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{api.defaults.baseURL}</code>
          </p>
        </div>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Testing Login...' : 'Test Login'}
        </button>
        
        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <h3 className="font-semibold text-lg mb-2">
              {result.success ? '✅ Success' : '❌ Error'}
            </h3>
            <p className="mb-3">{result.message}</p>
            
            {result.data && (
              <div className="mt-3">
                <h4 className="font-medium mb-2">Response Data:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            {result.error && (
              <div className="mt-3">
                <h4 className="font-medium mb-2">Error Details:</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginTest;

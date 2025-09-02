import React from 'react';

const BasicTest = () => {
  const testAPI = async () => {
    try {
      console.log('🔍 BasicTest: Testing API call...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nabia34@gmail.com',
          password: 'password123'
        })
      });
      
      console.log('🔍 BasicTest: Response status:', response.status);
      console.log('🔍 BasicTest: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔍 BasicTest: Response data:', data);
      
      if (response.ok) {
        alert('✅ Login successful! Check console for details.');
      } else {
        alert('❌ Login failed! Check console for details.');
      }
    } catch (error) {
      console.error('❌ BasicTest: Error:', error);
      alert('❌ Network error! Check console for details.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Basic API Test</h1>
      <p>This is a simple test to check if the API is working.</p>
      <button 
        onClick={testAPI}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Login API
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Open browser console (F12) to see detailed logs.
      </p>
    </div>
  );
};

export default BasicTest;

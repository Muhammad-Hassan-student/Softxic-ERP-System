// scripts/test-login.js
import axios from "axios"

async function testLogin() {
  try {
    console.log('🔍 Testing login flow...\n');
    
    // Test Employee Login
    console.log('1. Testing Employee Login...');
    const empResponse = await axios.post('http://localhost:3000/api/auth/login', {
      loginType: 'employee',
      rollNo: 'EMP-001',
      fullName: 'Ali Hassan',
      cnic: '35203-3456789-3',
      password: '6789B@'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Employee Login Response:', empResponse.data);
    console.log('Set-Cookie Headers:', empResponse.headers['set-cookie']);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test if cookies are working
    console.log('\n2. Testing Auth Check...');
    const authCheck = await axios.get('http://localhost:3000/api/auth/me', {
      withCredentials: true
    });
    
    console.log('Auth Check Response:', authCheck.data);
    
    // Test Admin Login
    console.log('\n3. Testing Admin Login...');
    const adminResponse = await axios.post('http://localhost:3000/api/auth/login', {
      loginType: 'admin',
      email: 'admin@erp.com',
      password: 'Admin@123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin Login Response:', adminResponse.data);
    console.log('Set-Cookie Headers:', adminResponse.headers['set-cookie']);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLogin();
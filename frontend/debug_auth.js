// Debug script to test authentication
// Copy and paste this into the browser console to debug auth issues

console.log('=== Authentication Debug Script ===');

// Check if token exists
const token = localStorage.getItem('token');
console.log('1. Token in localStorage:', token ? 'EXISTS' : 'MISSING');

if (token) {
  try {
    // Decode JWT payload (basic decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('2. Token payload:', payload);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.warn('3. Token Status: EXPIRED');
    } else {
      console.log('3. Token Status: VALID');
    }
  } catch (error) {
    console.error('2. Error decoding token:', error);
  }
}

// Test debug endpoint
async function testDebugEndpoint() {
  try {
    console.log('4. Testing debug endpoint...');
    const response = await fetch('http://localhost:8000/api/v1/users/debug', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('5. Debug endpoint response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('6. Debug endpoint data:', data);
    } else {
      const errorText = await response.text();
      console.error('6. Debug endpoint error:', errorText);
    }
  } catch (error) {
    console.error('4. Error testing debug endpoint:', error);
  }
}

// Test verification status endpoint
async function testVerificationStatus() {
  try {
    console.log('7. Testing verification status endpoint...');
    const response = await fetch('http://localhost:8000/api/v1/users/verification/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('8. Verification status response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('9. Verification status data:', data);
    } else {
      const errorText = await response.text();
      console.error('9. Verification status error:', errorText);
    }
  } catch (error) {
    console.error('7. Error testing verification status:', error);
  }
}

// Run tests if token exists
if (token) {
  testDebugEndpoint();
  testVerificationStatus();
} else {
  console.error('Cannot run API tests - no authentication token found');
  console.log('Please log in first to get an authentication token');
}

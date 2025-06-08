// Simple test file to directly test the API connection
// Run this in the browser console to test the API connection

async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // First run the diagnostic test
    const { testFoodApiResponse } = await import('./services/foodService');
    await testFoodApiResponse();
    
    // Use the Next.js API route
    const endpoint = '/api/foods';
    console.log(`Testing endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log(`Endpoint ${endpoint} failed with status: ${response.status}`);
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Endpoint ${endpoint} succeeded:`, {
        status: response.status,
        data: data
      });
      
      return {
        success: true,
        endpoint,
        data: data
      };
    } catch (err) {
      console.log(`Endpoint ${endpoint} failed with error:`, err.message);
      throw err;
    }
  } catch (error) {
    console.error('API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export the test function to be used in the browser console
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
}

export default testApiConnection; 
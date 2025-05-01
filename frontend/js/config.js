// frontend/js/config.js

const apiConfig = {
    // Get the API base URL based on the environment
    getBaseUrl: function() {
      // Check if we're running in production (on Vercel or custom domain)
      const isProduction = 
        window.location.hostname.includes('odaville.com') || 
        window.location.hostname.includes('vercel.app');
      
      if (isProduction) {
        // In production, use the current domain
        return window.location.origin + '/api';
      } else {
        // In development, use localhost
        return 'http://localhost:3000/api';
      }
    },
    
    // Method to make authenticated API requests
    fetchWithAuth: async function(endpoint, options = {}) {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}${endpoint}`;
      
      // Get token from storage if available
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Set up headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the request
      try {
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        // Handle unauthorized responses
        if (response.status === 401) {
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          
          if (window.location.pathname.includes('/admin')) {
            window.location.href = '/admin/admin-login.html';
          }
          
          return null;
        }
        
        // Handle other error responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        
        // Parse and return the response
        return await response.json();
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    },
    
    // Method to upload files with authentication
    uploadWithAuth: async function(endpoint, formData, options = {}) {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}${endpoint}`;
      
      // Get token from storage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Set up headers (don't set Content-Type as FormData will set it with the boundary)
      const headers = {
        ...options.headers
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the request
      try {
        const response = await fetch(url, {
          method: 'POST',
          ...options,
          headers,
          body: formData
        });
        
        // Handle unauthorized responses
        if (response.status === 401) {
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          
          if (window.location.pathname.includes('/admin')) {
            window.location.href = '/admin/admin-login.html';
          }
          
          return null;
        }
        
        // Handle other error responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API upload failed with status ${response.status}`);
        }
        
        // Parse and return the response
        return await response.json();
      } catch (error) {
        console.error('API upload error:', error);
        throw error;
      }
    },
    
    // Public method to fetch data without authentication
    fetch: async function(endpoint, options = {}) {
      const baseUrl = this.getBaseUrl();
      const url = `${baseUrl}${endpoint}`;
      
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    }
  };
  
  // Make the API config globally available
  window.apiConfig = apiConfig;
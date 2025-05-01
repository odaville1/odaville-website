/**
 * Odaville API Client with Enhanced Error Handling and WebSocket Compatibility
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Fetches a resource with improved timeout and retry functionality
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Response>} - The fetch response
 */
const fetchWithTimeout = async (
  url,
  options = {},
  timeout = 8000,
  maxRetries = 1
) => {
  let retryCount = 0;
  let lastError = null;

  while (retryCount <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Add controller signal to options (but don't override if already present)
      const fetchOptions = {
        ...options,
        signal: options.signal || controller.signal,
      };

      // Log only on retries to reduce console noise
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount} for ${url}`);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error;

      // Check if the error is a timeout
      if (error.name === "AbortError") {
        console.warn(
          `Request timeout for ${url} (attempt ${retryCount + 1}/${
            maxRetries + 1
          })`
        );
      } else {
        console.error(
          `Fetch error for ${url} (attempt ${retryCount + 1}/${
            maxRetries + 1
          }):`,
          error.message
        );
      }

      // If we've reached max retries, throw the last error
      if (retryCount >= maxRetries) {
        break;
      }

      // Wait before retrying (with exponential backoff)
      const delay = 500 * Math.pow(2, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retryCount++;
    }
  }

  // If all retries failed
  throw new Error(
    lastError
      ? `Request failed after ${maxRetries + 1} attempts: ${lastError.message}`
      : "Request failed"
  );
};

/**
 * Helper function to handle API responses with more detailed error reporting
 * @param {Response} response - The fetch response
 * @returns {Promise<Object|string>} - Parsed response
 */
const handleResponse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage;

      // Try to parse error details from response
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Status: ${response.status}`;
        } catch (e) {
          errorMessage = `Server responded with status: ${response.status}`;
        }
      } else {
        errorMessage = `Server responded with status: ${response.status}`;
      }

      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  } catch (error) {
    if (!error.message.includes("Server responded")) {
      console.error("Error handling response:", error);
    }
    throw error;
  }
};

/**
 * Test API connectivity with enhanced reliability
 * @returns {Promise<Object>} Connection test result
 */
export const testAPI = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/test`);
    return handleResponse(response);
  } catch (error) {
    console.error("API connection test failed:", error);
    throw error;
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login user with retry capability
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} Auth response with token
   */
  login: async (username, password) => {
    try {
      console.log("Attempting login for:", username);
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
        10000 // Longer timeout for login
      );

      const result = await handleResponse(response);
      console.log("Login successful");
      return result;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "admin-login.html";
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Get authentication token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem("token");
  },
};

/**
 * Gallery API with improved error handling
 */
export const galleryAPI = {
  /**
   * Get all gallery items with fallback handling
   * @returns {Promise<Array>} Gallery items
   */
  getAll: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/gallery`);
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      return []; // Return empty array on error for graceful degradation
    }
  },

  /**
   * Get gallery item by ID
   * @param {string} id Item ID
   * @returns {Promise<Object>} Gallery item
   */
  getById: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/gallery/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching gallery item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new gallery item with enhanced upload handling
   * @param {FormData} formData Form data with image
   * @returns {Promise<Object>} Created gallery item
   */
  create: async (formData) => {
    try {
      // Use a longer timeout for image uploads
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/gallery`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      throw error;
    }
  },

  /**
   * Update gallery item with enhanced timeout handling
   * @param {string} id Item ID
   * @param {FormData} formData Updated form data
   * @returns {Promise<Object>} Updated gallery item
   */
  update: async (id, formData) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/gallery/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating gallery item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete gallery item
   * @param {string} id Item ID
   * @returns {Promise<Object>} Delete confirmation
   */
  delete: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authAPI.getToken()}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting gallery item ${id}:`, error);
      throw error;
    }
  },
};

/**
 * Blog API with improved error handling
 */
export const blogAPI = {
  /**
   * Get all blog posts with fallback handling
   * @param {boolean} published Filter by published status
   * @returns {Promise<Array>} Blog posts
   */
  getAll: async (published = false) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/blog?published=${published}`,
        published ? {} : { headers: { Authorization: `Bearer ${authAPI.getToken()}` } }
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return []; // Return empty array on error for graceful degradation
    }
  },

  /**
   * Get blog post by ID
   * @param {string} id Post ID
   * @returns {Promise<Object>} Blog post
   */
  getById: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/blog/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching blog post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new blog post with enhanced upload handling
   * @param {FormData} formData Form data with image
   * @returns {Promise<Object>} Created blog post
   */
  create: async (formData) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/blog`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw error;
    }
  },

  /**
   * Update blog post with enhanced timeout handling
   * @param {string} id Post ID
   * @param {FormData} formData Updated form data
   * @returns {Promise<Object>} Updated blog post
   */
  update: async (id, formData) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/blog/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating blog post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete blog post
   * @param {string} id Post ID
   * @returns {Promise<Object>} Delete confirmation
   */
  delete: async (id) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authAPI.getToken()}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting blog post ${id}:`, error);
      throw error;
    }
  },
};

/**
 * Products API with improved error handling
 */
export const productsAPI = {
  /**
   * Get all products or filter by category with fallback handling
   * @param {string|null} category Optional category filter
   * @returns {Promise<Array>} Products
   */
  getAll: async (category = null) => {
    try {
      const url = category
        ? `${API_BASE_URL}/products?category=${category}`
        : `${API_BASE_URL}/products`;

      const response = await fetchWithTimeout(url, {
        headers: {
          Authorization: `Bearer ${authAPI.getToken()}`,
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error("Error fetching products:", error);
      return []; // Return empty array on error for graceful degradation
    }
  },

  /**
   * Get product by ID
   * @param {string} id Product ID
   * @returns {Promise<Object>} Product
   */
  getById: async (id) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
        }
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new product with enhanced upload handling
   * @param {FormData} formData Form data with image
   * @returns {Promise<Object>} Created product
   */
  create: async (formData) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Update product with enhanced timeout handling
   * @param {string} id Product ID
   * @param {FormData} formData Updated form data
   * @returns {Promise<Object>} Updated product
   */
  update: async (id, formData) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
          body: formData,
        },
        30000 // 30-second timeout for uploads
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete product
   * @param {string} id Product ID
   * @returns {Promise<Object>} Delete confirmation
   */
  delete: async (id) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authAPI.getToken()}`,
          },
        }
      );
      return handleResponse(response);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

/**
 * Health check function to test API status with better diagnostics
 * @returns {Promise<Object>} Detailed health status object
 */
export const checkAPIHealth = async () => {
  try {
    const start = Date.now();
    const response = await fetchWithTimeout(`${API_BASE_URL}/test`, {}, 5000);
    const data = await handleResponse(response);
    const duration = Date.now() - start;

    return {
      status: "online",
      responseTime: `${duration}ms`,
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "offline",
      error: error.message,
      details:
        "Server may be down or unreachable. Please check if the server is running.",
    };
  }
};

// Add WebSocket error suppression
if (typeof window !== "undefined") {
  // Suppress WebSocket related errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    // Filter out websocket related errors
    if (
      typeof args[0] === "string" &&
      (args[0].includes("WebSocket") ||
        args[0].includes("WDS") ||
        args[0].includes("message channel closed"))
    ) {
      console.warn("Suppressed WebSocket error:", ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Add global error handler for unhandled promise rejections related to WebSocket
  window.addEventListener("unhandledrejection", function (event) {
    if (
      event.reason &&
      ((typeof event.reason.message === "string" &&
        (event.reason.message.includes("WebSocket") ||
          event.reason.message.includes("WDS") ||
          event.reason.message.includes("message channel"))) ||
        (event.reason.stack &&
          (event.reason.stack.includes("WebSocket") ||
            event.reason.stack.includes("WDS"))))
    ) {
      console.warn("Suppressed WebSocket promise rejection:", event.reason);
      event.preventDefault();
    }
  });
}

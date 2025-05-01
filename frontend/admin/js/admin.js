// This is a modified version of the admin.js file to fix connection issues

// API Base URL - can be overridden by environment variable
const API_BASE_URL = window.API_BASE_URL || "http://localhost:5000/api";

// Utility function for handling API errors
async function handleAPIResponse(response, errorMessage) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: errorMessage }));
    throw new Error(error.message || errorMessage);
  }
  return response.json();
}

// Authentication API
const authAPI = {
  login: async (username, password) => {
    try {
      console.log("Attempting login for:", username);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid username or password");
      }

      const result = await response.json();
      
      // Store login timestamp
      const loginTime = Date.now();
      result.user.loginTime = loginTime;
      
      console.log("Login successful");
      return result;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.clear(); // Clear any session data
    window.location.href = "admin-login.html";
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    
    if (!token) return false;
    
    // Check if login time is more than 24 hours ago
    const loginTime = user.loginTime;
    if (loginTime && (Date.now() - loginTime > 24 * 60 * 60 * 1000)) {
      console.log("Token expired");
      authAPI.logout();
      return false;
    }
    
    return true;
  },

  getToken: () => {
    if (!authAPI.isAuthenticated()) {
      authAPI.logout();
      return null;
    }
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  refreshSession: () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    if (user) {
      user.loginTime = Date.now();
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
    }
  }
};

// Gallery API
const galleryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    return handleAPIResponse(response, "Failed to fetch gallery items");
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    return handleAPIResponse(response, "Failed to fetch gallery item");
  },
  
  create: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        },
        body: formData
      });
      return handleAPIResponse(response, "Failed to create gallery item");
    } catch (error) {
      console.error("Gallery creation error:", error);
      throw new Error("Failed to create gallery item: " + error.message);
    }
  },
  
  update: async (id, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        },
        body: formData
      });
      return handleAPIResponse(response, "Failed to update gallery item");
    } catch (error) {
      console.error("Gallery update error:", error);
      throw new Error("Failed to update gallery item: " + error.message);
    }
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    return handleAPIResponse(response, "Failed to delete gallery item");
  }
};

// Blog API
const blogAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch blog posts");
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch blog post");
    return response.json();
  },
  
  create: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to create blog post");
    return response.json();
  },
  
  update: async (id, formData) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to update blog post");
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authAPI.getToken()}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete blog post");
    return response.json();
  }
};

// Products API
const productsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  create: async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        },
        body: productData // Keep as FormData for file upload
      });
      if (!response.ok) throw new Error('Failed to create product');
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        },
        body: productData // Keep as FormData for file upload
      });
      if (!response.ok) throw new Error('Failed to update product');
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: {
          "Authorization": `Bearer ${authAPI.getToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};

// Check API health
async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    return { status: response.ok ? "online" : "offline" };
  } catch (error) {
    return { status: "offline", error: error.message };
  }
}

// Check authentication status before any operation
function checkAuth() {
  if (!authAPI.isAuthenticated()) {
    window.location.href = "admin-login.html";
    return false;
  }
  // Refresh session timestamp
  authAPI.refreshSession();
  return true;
}

// Add authentication headers to fetch requests
function getAuthHeaders() {
  const token = authAPI.getToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

// Intercept all API calls
async function authenticatedFetch(url, options = {}) {
  if (!checkAuth()) return;
  
  const headers = {
    ...options.headers,
    ...getAuthHeaders()
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Token expired or invalid
      authAPI.logout();
      return;
    }
    
    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// Update existing API calls to use authenticatedFetch
async function loadProducts() {
  try {
    const response = await authenticatedFetch(`${API_BASE_URL}/products`);
    if (!response) return;
    
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    showAlert("error", "Failed to load products");
  }
}

// Add periodic authentication check
setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes

// Initialize admin panel
document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
  
  // Initialize all admin panel features
  initializeProductManagement();
  initializeBlogManagement();
  initializeOrderManagement();
  
  // Add logout handler
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authAPI.logout();
    });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is authenticated
  if (!authAPI.isAuthenticated()) {
    window.location.href = "admin-login.html";
    return;
  }

  // Set current date
  const currentDateElement = document.getElementById("current-date");
  if (currentDateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent = new Date().toLocaleDateString(
      "en-US",
      options
    );
  }

  // Check API health first
  try {
    const apiStatus = await checkAPIHealth();
    console.log("API Status:", apiStatus);

    if (apiStatus.status === "offline") {
      // Show API connection error to user
      const dashboard = document.getElementById("dashboard");
      if (dashboard) {
        const errorAlert = document.createElement("div");
        errorAlert.className = "api-error-alert";
        errorAlert.innerHTML = `
          <strong>API Connection Error</strong>
          <p>${
            apiStatus.error ||
            "Unable to connect to the server. Please check if the server is running."
          }</p>
          <p>Server URL: ${API_BASE_URL}</p>
          <button id="retry-connection" class="retry-btn">Retry Connection</button>
        `;
        dashboard.insertBefore(errorAlert, dashboard.firstChild);

        // Add retry button listener
        document
          .getElementById("retry-connection")
          .addEventListener("click", () => {
            window.location.reload();
          });
      }

      // Continue with offline mode - initialize UI but disable data modifications
      console.log("Running in offline mode due to API connection failure");
    }
  } catch (error) {
    console.error("Error checking API health:", error);
  }

  // Initialize navigation
  initNavigation();

  // Initialize dashboard with error handling
  initDashboard().catch((error) => {
    console.error("Error initializing dashboard:", error);
    // Load empty placeholders if data couldn't be fetched
    loadPlaceholders();
  });

  // Initialize content sections
  initBlogManagement();
  initGalleryManagement();
  initProductManagement();

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authAPI.logout();
    });
  }
});

// Initialize dashboard with error handling and timeouts
async function initDashboard() {
  try {
    // Use Promise.allSettled instead of Promise.all to handle partial failures
    const results = await Promise.allSettled([
      fetchWithTimeout(blogAPI.getAll(), 5000),
      fetchWithTimeout(galleryAPI.getAll(), 5000),
      fetchWithTimeout(productsAPI.getAll(), 5000),
    ]);

    // Extract successful results
    const [blogsResult, galleryResult, productsResult] = results;

    // Update stats based on available data
    const blogs = blogsResult.status === "fulfilled" ? blogsResult.value : [];
    const gallery = galleryResult.status === "fulfilled" ? galleryResult.value : [];
    const products = productsResult.status === "fulfilled" ? productsResult.value : [];

    // Update counts with proper error handling
    updateCounts(
      blogsResult.status === "fulfilled" ? blogs.length : 0,
      galleryResult.status === "fulfilled" ? gallery.length : 0,
      productsResult.status === "fulfilled" ? products.length : 0
    );

    // Load recent content if any data is available
    const allItems = [
      ...(blogsResult.status === "fulfilled" ? blogs.map((item) => ({ ...item, type: "Blog" })) : []),
      ...(galleryResult.status === "fulfilled" ? gallery.map((item) => ({ ...item, type: "Gallery" })) : []),
      ...(productsResult.status === "fulfilled" ? products.map((item) => ({ ...item, type: "Product" })) : []),
    ];

    if (allItems.length > 0) {
      loadRecentContent(allItems);
    } else {
      // If no data at all, show offline message
      const tbody = document.getElementById("recent-content-table");
      if (tbody) {
        tbody.innerHTML =
          '<tr><td colspan="4" class="text-center">No content available or unable to fetch data from server.</td></tr>';
      }
    }
  } catch (error) {
    console.error("Dashboard initialization error:", error);
    loadPlaceholders();
  }
}

// Helper function to fetch with timeout
function fetchWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

// Update dashboard counts with proper error handling
function updateCounts(blogCount, galleryCount, productCount) {
  const blogCountElement = document.getElementById("blog-count");
  const galleryCountElement = document.getElementById("gallery-count");
  const productCountElement = document.getElementById("product-count");

  if (blogCountElement) {
    blogCountElement.textContent = blogCount || 0;
    blogCountElement.classList.remove("error");
  }
  if (galleryCountElement) {
    galleryCountElement.textContent = galleryCount || 0;
    galleryCountElement.classList.remove("error");
  }
  if (productCountElement) {
    productCountElement.textContent = productCount || 0;
    productCountElement.classList.remove("error");
  }
}

// Load placeholders for dashboard if data can't be fetched
function loadPlaceholders() {
  const blogCountElement = document.getElementById("blog-count");
  const galleryCountElement = document.getElementById("gallery-count");
  const productCountElement = document.getElementById("product-count");

  if (blogCountElement) {
    blogCountElement.textContent = "0";
    blogCountElement.classList.add("error");
  }
  if (galleryCountElement) {
    galleryCountElement.textContent = "0";
    galleryCountElement.classList.add("error");
  }
  if (productCountElement) {
    productCountElement.textContent = "0";
    productCountElement.classList.add("error");
  }

  const recentContentTable = document.getElementById("recent-content-table");
  if (recentContentTable) {
    recentContentTable.innerHTML =
      '<tr><td colspan="4" class="text-center">Could not load recent content. Server connection issue.</td></tr>';
  }
}

// Navigation functionality
function initNavigation() {
  const navLinks = document.querySelectorAll(".admin-nav a");
  const sections = document.querySelectorAll(".admin-section");

  navLinks.forEach((link) => {
    if (link.id === "logout-btn" || !link.getAttribute("data-section")) return;
    
    link.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Navigation clicked:", this.getAttribute("data-section"));

      // Remove active class from all links and sections
      navLinks.forEach((link) => link.classList.remove("active"));
      sections.forEach((section) => {
        section.style.display = "none";
        section.classList.remove("active");
      });

      // Add active class to clicked link
      this.classList.add("active");

      // Show the corresponding section
      const sectionId = this.getAttribute("data-section");
      if (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.display = "block";
          section.classList.add("active");
          console.log("Activated section:", sectionId);
        }
      }
    });
  });

  // Set initial active section
  const activeLink = document.querySelector(".admin-nav a.active");
  if (activeLink && activeLink.getAttribute("data-section")) {
    const initialSection = document.getElementById(activeLink.getAttribute("data-section"));
    if (initialSection) {
      sections.forEach(section => section.style.display = "none");
      initialSection.style.display = "block";
      initialSection.classList.add("active");
    }
  }
}

// Load recent content with error handling
function loadRecentContent(items) {
  const tbody = document.getElementById("recent-content-table");
  if (!tbody) return;

  try {
    // Sort by date (newest first) and take only 5 most recent
    const recentItems = items
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recentItems.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">No recent content available.</td></tr>';
      return;
    }

    tbody.innerHTML = recentItems
      .map((item) => {
        const date = new Date(item.createdAt).toLocaleDateString();
        const contentType = item.type;
        const editFunction = `handle${contentType}Edit`;

        return `
        <tr>
          <td>${item.title}</td>
          <td>${contentType}</td>
          <td>${date}</td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit" onclick="${editFunction}('${item._id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error rendering recent content:", error);
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center">Error displaying recent content.</td></tr>';
  }
}

// Initialize Blog Management
function initBlogManagement() {
  const addBlogBtn = document.getElementById("add-blog-btn");
  const blogForm = document.getElementById("blog-post-form");

  // Initialize TinyMCE
  tinymce.init({
    selector: '#blog-content',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    images_upload_url: `${API_BASE_URL}/blog/upload-content-image`,
    images_upload_handler: async function (blobInfo, progress) {
      try {
        const formData = new FormData();
        formData.append('image', blobInfo.blob(), blobInfo.filename());

        const response = await fetch(`${API_BASE_URL}/blog/upload-content-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authAPI.getToken()}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Image upload failed');
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    },
    height: 500,
    menubar: true,
    automatic_uploads: true
  });

  // Load existing blog posts with error handling
  loadBlogPosts().catch((error) => {
    console.error("Error loading blog posts:", error);
    const tbody = document.getElementById("blog-table");
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">Error loading blog posts. Please check console for details.</td></tr>';
    }
  });

  // Add new blog post
  if (addBlogBtn) {
    addBlogBtn.addEventListener("click", () => {
      resetBlogForm();
      // Show form by scrolling to it
      blogForm.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Cancel button for blog form
  const cancelBtn = blogForm && blogForm.querySelector(".cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetBlogForm();
    });
  }

  // Image preview for blog
  const blogImageInput = document.getElementById("blog-featured-image");
  const blogImagePreview = document.getElementById("blog-image-preview");

  if (blogImageInput && blogImagePreview) {
    blogImageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          blogImagePreview.src = e.target.result;
          blogImagePreview.style.display = "block";
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
}

// Load blog posts with error handling
async function loadBlogPosts() {
  try {
    const blogs = await blogAPI.getAll();
    const tbody = document.getElementById("blog-table");

    if (!tbody) return;

    if (blogs.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center">No blog posts found</td></tr>';
      return;
    }

    tbody.innerHTML = blogs
      .map((blog) => {
        const date = new Date(blog.createdAt).toLocaleDateString();
        const status = blog.isPublished ? "published" : "draft";

        return `
        <tr>
          <td>${blog.title}</td>
          <td>${date}</td>
          <td><span class="status-badge ${status}">${status}</span></td>
          <td>
            <div class="action-buttons">
              <button class="action-btn edit" onclick="handleEditBlog('${blog._id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
              <button class="action-btn delete" onclick="handleDeleteBlog('${blog._id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading blog posts:", error);
    throw error;
  }
}

// Reset blog form
function resetBlogForm() {
  const form = document.getElementById("blog-post-form");
  if (!form) return;

  form.reset();
  document.getElementById("blog-id").value = "";
  document.getElementById("blog-image-preview").style.display = "none";
  document.getElementById("blog-image-preview").src = "";
  
  // Reset TinyMCE content
  tinymce.get('blog-content').setContent('');

  // Scroll back to blog list
  document
    .querySelector('[data-section="blog-manage"]')
    .scrollIntoView({ behavior: "smooth" });
}

// Gallery Management initialization
function initGalleryManagement() {
  const addGalleryBtn = document.getElementById("add-gallery-btn");
  const galleryForm = document.getElementById("gallery-item-form");
  const formContainer = document.getElementById("gallery-form-container");

  // Load existing gallery items with error handling
  loadGalleryItems().catch((error) => {
    console.error("Error loading gallery items:", error);
    const grid = document.getElementById("admin-gallery-grid");
    if (grid) {
      grid.innerHTML = '<div class="error-message">Error loading gallery items. Please check console for details.</div>';
    }
  });

  // Add new gallery item
  if (addGalleryBtn) {
    addGalleryBtn.addEventListener("click", () => {
      resetGalleryForm();
      if (formContainer) formContainer.style.display = "block";
    });
  }

  // Handle form submission
  if (galleryForm) {
    let isSubmitting = false;
    
    galleryForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      if (isSubmitting) return;
      isSubmitting = true;
      
      const formData = new FormData(galleryForm);
      const galleryId = document.getElementById("gallery-id").value;
      
      // Show saving indicator
      const saveBtn = galleryForm.querySelector(".save-btn");
      const originalBtnText = saveBtn.textContent;
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
      
      try {
        if (galleryId) {
          await galleryAPI.update(galleryId, formData);
        } else {
          await galleryAPI.create(formData);
        }
        
        saveBtn.textContent = "Saved!";
        setTimeout(() => {
          saveBtn.textContent = originalBtnText;
          saveBtn.disabled = false;
          
          // Reset form
          galleryForm.reset();
          document.getElementById("gallery-image-preview").style.display = "none";
          
          // Reload gallery items and dashboard
          if (typeof loadGalleryItems === 'function') loadGalleryItems();
          if (typeof initDashboard === 'function') initDashboard();
          
          alert(galleryId ? "Gallery item updated successfully!" : "Gallery item created successfully!");
        }, 1500);
      } catch (error) {
        console.error("Error saving gallery item:", error);
        saveBtn.textContent = originalBtnText;
        saveBtn.disabled = false;
        alert("Error saving gallery item: " + error.message);
      } finally {
        isSubmitting = false;
      }
    });
    
    // Image preview handling
    const galleryImageInput = document.getElementById("gallery-image");
    const galleryImagePreview = document.getElementById("gallery-image-preview");
    
    if (galleryImageInput) {
      galleryImageInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            galleryImagePreview.src = e.target.result;
            galleryImagePreview.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else {
          galleryImagePreview.style.display = "none";
        }
      });
    }
  }
}

// Load gallery items with error handling
async function loadGalleryItems() {
  try {
    const gallery = await galleryAPI.getAll();
    const grid = document.getElementById("admin-gallery-grid");

    if (!grid) return;

    if (!gallery || gallery.length === 0) {
      grid.innerHTML = '<div class="no-items">No gallery items found</div>';
      return;
    }

    grid.innerHTML = gallery
      .map(
        (item) => `
      <div class="gallery-item">
        <div class="gallery-item-image">
          <img src="${item.imageUrl}" alt="${item.title}" onerror="this.src='./images/fallback.jpg'">
        </div>
        <div class="gallery-item-content">
          <h3 class="gallery-item-title">${item.title}</h3>
          <p class="gallery-item-description">${item.description || ""}</p>
          <p class="gallery-item-category">${item.category}</p>
          <div class="gallery-item-actions">
            <button class="action-btn edit" onclick="handleEditGallery('${item._id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button class="action-btn delete" onclick="handleDeleteGallery('${item._id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        ${item.isFeatured ? '<div class="gallery-item-badge">Featured</div>' : ''}
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading gallery items:", error);
    throw error;
  }
}

// Reset gallery form
function resetGalleryForm() {
  const form = document.getElementById("gallery-item-form");
  if (!form) return;

  form.reset();
  document.getElementById("gallery-id").value = "";
  document.getElementById("gallery-image-preview").style.display = "none";
  document.getElementById("gallery-image-preview").src = "";

  const formTitle = document.getElementById("gallery-form-title");
  if (formTitle) formTitle.textContent = "Add New Gallery Item";
}

// Products Management
function initProductManagement() {
  const productsTable = document.getElementById('products-table');
  const productForm = document.getElementById('product-form');
  const productFormContainer = document.getElementById('product-form-container');
  const addProductBtn = document.getElementById('add-product-btn');
  const closeFormBtn = productFormContainer.querySelector('.close-form-btn');
  const cancelBtn = productFormContainer.querySelector('.cancel-btn');
  const productImagePreview = document.getElementById('product-image-preview');
  const productImageInput = document.getElementById('product-image');

  // Load products
  async function loadProducts() {
    try {
      const products = await productsAPI.getAll();
      productsTable.innerHTML = products.map(product => `
        <tr>
          <td><img src="${product.imageUrl}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover;"></td>
          <td>${product.title}</td>
          <td>${product.category}</td>
          <td>${product.featured ? 'Featured' : 'Normal'}</td>
          <td>
            <button class="edit-btn" data-id="${product._id}">Edit</button>
            <button class="delete-btn" data-id="${product._id}">Delete</button>
          </td>
        </tr>
      `).join('');

      // Add event listeners to edit and delete buttons
      productsTable.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
      });
      productsTable.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
      });
    } catch (error) {
      productsTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center error">Error loading products. Please try again.</td>
        </tr>
      `;
    }
  }

  // Show product form
  function showProductForm(product = null) {
    productFormContainer.style.display = 'block';
    document.getElementById('product-form-title').textContent = product ? 'Edit Product' : 'Add New Product';
    document.getElementById('product-id').value = product ? product._id : '';
    document.getElementById('product-title').value = product ? product.title : '';
    document.getElementById('product-subtitle').value = product ? product.subtitle : '';
    document.getElementById('product-description').value = product ? product.description : '';
    document.getElementById('product-category').value = product ? product.category : 'windows';
    document.getElementById('product-featured').checked = product ? product.featured : false;
    document.getElementById('product-order').value = product ? product.order : 0;
    
    if (product && product.imageUrl) {
      productImagePreview.src = product.imageUrl;
      productImagePreview.style.display = 'block';
    } else {
      productImagePreview.style.display = 'none';
    }
  }

  // Hide product form
  function hideProductForm() {
    productFormContainer.style.display = 'none';
    productForm.reset();
    productImagePreview.style.display = 'none';
  }

  // Edit product
  async function editProduct(id) {
    try {
      const product = await productsAPI.getById(id);
      if (product) {
        showProductForm(product);
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      alert('Failed to load product for editing. Please try again.');
    }
  }

  // Delete product
  async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  }

  // Handle image preview
  productImageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        productImagePreview.src = e.target.result;
        productImagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Event listeners
  addProductBtn.addEventListener('click', () => showProductForm());
  closeFormBtn.addEventListener('click', hideProductForm);
  cancelBtn.addEventListener('click', hideProductForm);

  productForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const id = formData.get('id');
    
    try {
      if (id) {
        await productsAPI.update(id, formData);
      } else {
        await productsAPI.create(formData);
      }
      hideProductForm();
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  });

  // Initial load
  loadProducts();
}

// Handle functions for global scope
window.handleEditBlog = async (id) => {
  try {
    const blog = await blogAPI.getById(id);
    const form = document.getElementById("blog-post-form");

    if (!form) return;

    // Set form values
    document.getElementById("blog-id").value = id;
    document.getElementById("blog-title").value = blog.title || "";
    // Set TinyMCE content
    tinymce.get('blog-content').setContent(blog.content || "");
    document.getElementById("blog-author").value = blog.author || "";

    const statusField = document.getElementById("blog-status");
    if (statusField)
      statusField.value = blog.isPublished ? "published" : "draft";

    // Handle image preview
    if (blog.imageUrl) {
      const preview = document.getElementById("blog-image-preview");
      if (preview) {
        preview.src = blog.imageUrl;
        preview.style.display = "block";
      }
    }

    // Scroll to form
    form.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error loading blog post:", error);
    alert(
      "Error loading blog post: " + (error.message || "Server connection issue")
    );
  }
};

window.handleDeleteBlog = async (id) => {
  if (confirm("Are you sure you want to delete this blog post?")) {
    try {
      await blogAPI.delete(id);
      await loadBlogPosts();
      await initDashboard();
      alert("Blog post deleted successfully!");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert(
        "Error deleting blog post: " +
          (error.message || "Server connection issue")
      );
    }
  }
};

window.handleEditGallery = async (id) => {
  try {
    const gallery = await galleryAPI.getById(id);
    const form = document.getElementById("gallery-item-form");
    const formContainer = document.getElementById("gallery-form-container");

    if (!form || !formContainer) return;

    // Set form values
    document.getElementById("gallery-id").value = id;
    document.getElementById("gallery-title").value = gallery.title || "";

    // Optional fields
    const subtitleField = document.getElementById("gallery-subtitle");
    if (subtitleField) subtitleField.value = gallery.subtitle || "";

    const descriptionField = document.getElementById("gallery-description");
    if (descriptionField) descriptionField.value = gallery.description || "";

    const categoryField = document.getElementById("gallery-category");
    if (categoryField) categoryField.value = gallery.category || "";

    const featuredField = document.getElementById("gallery-featured");
    if (featuredField) featuredField.checked = gallery.isFeatured || false;

    // Image preview
    if (gallery.imageUrl) {
      const preview = document.getElementById("gallery-image-preview");
      if (preview) {
        preview.src = gallery.imageUrl;
        preview.style.display = "block";
      }
    }

    // Update form title and show
    document.getElementById("gallery-form-title").textContent =
      "Edit Gallery Item";
    formContainer.style.display = "block";
  } catch (error) {
    console.error("Error loading gallery item:", error);
    alert(
      "Error loading gallery item: " +
        (error.message || "Server connection issue")
    );
  }
};

window.handleDeleteGallery = async (id) => {
  if (confirm("Are you sure you want to delete this gallery item?")) {
    try {
      await galleryAPI.delete(id);
      await loadGalleryItems();
      await initDashboard();
      alert("Gallery item deleted successfully!");
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      alert(
        "Error deleting gallery item: " +
          (error.message || "Server connection issue")
      );
    }
  }
};

window.handleEditProduct = async (id) => {
  try {
    const product = await productsAPI.getById(id);
    const form = document.getElementById("product-form");
    const formContainer = document.getElementById("product-form-container");

    if (!form || !formContainer) {
      console.error("Product form or container not found");
      return;
    }

    // Set form values
    document.getElementById("product-id").value = id;

    const titleInput = document.getElementById("product-title");
    if (titleInput) titleInput.value = product.title || "";

    const subtitleInput = document.getElementById("product-subtitle");
    if (subtitleInput) subtitleInput.value = product.subtitle || "";

    const descriptionInput = document.getElementById("product-description");
    if (descriptionInput) descriptionInput.value = product.description || "";

    const categoryInput = document.getElementById("product-category");
    if (categoryInput) categoryInput.value = product.category || "";

    const featuredInput = document.getElementById("product-featured");
    if (featuredInput) featuredInput.checked = product.featured || false;

    const orderInput = document.getElementById("product-order");
    if (orderInput) orderInput.value = product.order || 0;

    // Handle image preview
    if (product.imageUrl) {
      const preview = document.getElementById("product-image-preview");
      if (preview) {
        preview.src = product.imageUrl;
        preview.style.display = "block";
      }
    }

    // Update form title
    const formTitle = document.getElementById("product-form-title");
    if (formTitle) formTitle.textContent = "Edit Product";

    // Show the form
    formContainer.style.display = "block";
  } catch (error) {
    console.error("Error loading product:", error);
    alert(
      "Error loading product: " + (error.message || "Server connection issue")
    );
  }
};

window.handleDeleteProduct = async (id) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await productsAPI.delete(id);
      await loadProducts();
      await initDashboard();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(
        "Error deleting product: " +
          (error.message || "Server connection issue")
      );
    }
  }
};



// API Base URL
const API_BASE_URL = "http://localhost:5000/api";

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

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginAlert = document.getElementById("login-alert");
  const togglePassword = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  // Check if user is already logged in
  if (authAPI.isAuthenticated()) {
    console.log("Already authenticated, redirecting to admin panel");
    window.location.href = "admin-panel.html";
    return;
  }

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.innerHTML =
      type === "password"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  });

  // Handle form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginAlert.style.display = "none";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember").checked;

    try {
      const response = await authAPI.login(username, password);

      if (rememberMe) {
        // Store token and user info in localStorage for persistence
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Clear sessionStorage to avoid conflicts
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        // Store in sessionStorage if not "remember me"
        sessionStorage.setItem("token", response.token);
        sessionStorage.setItem("user", JSON.stringify(response.user));
        
        // Clear localStorage to avoid conflicts
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      console.log("Login successful, redirecting to admin panel");
      // Redirect to admin panel
      window.location.href = "admin-panel.html";
    } catch (error) {
      console.error("Login error:", error);
      loginAlert.textContent = error.message || "Invalid username or password";
      loginAlert.style.display = "block";
    }
  });
});

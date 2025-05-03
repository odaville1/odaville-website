const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Log environment for troubleshooting
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Running in ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} mode`);

// Increase payload size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS configuration - Include admin subdomain
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://odaville.com', 'https://www.odaville.com', 'https://admin.odaville.com']
  : ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:3001'];

  app.use(cors({
    origin: [
      'https://www.odaville.com',
      'https://odaville.com',
      'https://admin.odaville.com',  // Your admin subdomain
      'https://odaville-website.vercel.app',
      'https://odaville-admin-panel.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Create uploads directory if not in production
if (process.env.NODE_ENV !== 'production') {
  try {
    const uploadsDir = path.join(__dirname, "uploads");
    const blogUploadsDir = path.join(uploadsDir, "blog");
    const galleryUploadsDir = path.join(uploadsDir, "gallery");
    const productsUploadsDir = path.join(uploadsDir, "products");

    // Create directories if they don't exist
    [uploadsDir, blogUploadsDir, galleryUploadsDir, productsUploadsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  } catch (error) {
    console.error("Error creating upload directories:", error);
    // Continue anyway - not critical for API to function
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// In-memory storage for Vercel
const memoryStorage = multer.memoryStorage();
// Configure storage to use memory in production, disk in development
const getStorage = (destination) => {
  if (process.env.NODE_ENV === 'production') {
    return memoryStorage;
  } else {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads', destination));
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });
  }
};

// File upload middleware instances
exports.blogUpload = multer({ storage: getStorage('blog') });
exports.galleryUpload = multer({ storage: getStorage('gallery') });
exports.productsUpload = multer({ storage: getStorage('products') });

// Serve static files based on environment
if (process.env.NODE_ENV !== 'production') {
  // In development, serve static files locally
  app.use(express.static(path.join(__dirname, "..", "frontend")));
  app.use("/admin", express.static(path.join(__dirname, "..", "frontend", "admin")));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/brochures', express.static(path.join(__dirname, '..', 'brochures')));
}

// Add test endpoint that doesn't rely on MongoDB or other services
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API connection successful!", 
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage()
    }
  });
});

// Verify token endpoint for admin panel
app.get("/api/verify-token", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(200).json({ valid: false, message: "No token provided" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ valid: false, message: "Invalid token" });
      }
      
      return res.status(200).json({ 
        valid: true, 
        user: {
          id: decoded.userId,
          username: decoded.username
        } 
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ 
      valid: false, 
      message: "Error verifying token" 
    });
  }
});

// Function to lazily connect to MongoDB
let dbConnection = null;
const connectToMongoDB = async () => {
  if (dbConnection) return dbConnection;
  
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI environment variable is not set");
      throw new Error("MongoDB URI not configured");
    }

    // Mongoose connection with reasonable timeouts
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10s
      retryWrites: true
    });
    
    console.log("Connected to MongoDB");
    dbConnection = mongoose.connection;
    return dbConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't rethrow - let the app continue working with degraded functionality
    return null;
  }
};

// Function to lazily initialize AWS (import only when needed)
const getS3Client = () => {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
      console.warn("AWS credentials not fully configured");
      // Return null instead of throwing - caller should handle this gracefully
      return null;
    }
    
    const AWS = require('aws-sdk');
    return new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  } catch (error) {
    console.error("Error initializing AWS S3:", error);
    return null;
  }
};

// Helper function for file handling that won't crash if S3 is misconfigured
exports.saveFileInVercel = async (file, directory) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const s3 = getS3Client();
      if (!s3) {
        console.warn("S3 client not available, returning mock URL");
        return `/mock-uploads/${directory}/${Date.now()}-${file.originalname}`;
      }

      const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      const key = `${directory}/${fileName}.${fileExtension}`;
      
      await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      }).promise();
      
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error saving file to S3:", error);
      // Return a placeholder URL rather than crashing
      return `/error-uploads/${directory}/${Date.now()}-${file.originalname}`;
    }
  } else {
    // Development - use local path
    return `/uploads/${directory}/${file.filename}`;
  }
};

// Import routes (only importing the references, not executing any code yet)
const { router: authRouter } = require("./routes/auth");
const galleryRoutes = require("./routes/gallery");
const blogRoutes = require("./routes/blog");
const productRoutes = require("./routes/products");
const brochureRoutes = require('./routes/brochureRoutes');

// Add admin-specific routes
const adminRoutes = express.Router();

// Admin authentication check (used for admin-only routes)
adminRoutes.use(authenticateToken);

// Admin dashboard stats endpoint
adminRoutes.get("/dashboard-stats", async (req, res) => {
  try {
    await connectToMongoDB();
    
    // Collect stats from various collections
    const blogCount = await mongoose.model('Blog').countDocuments();
    const galleryCount = await mongoose.model('Gallery').countDocuments();
    const productCount = await mongoose.model('Product').countDocuments();
    const brochureCount = await mongoose.model('BrochureRequest').countDocuments();
    
    // Get recent brochure requests
    const recentBrochures = await mongoose.model('BrochureRequest')
      .find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      counts: {
        blogs: blogCount,
        galleryItems: galleryCount,
        products: productCount,
        brochureRequests: brochureCount
      },
      recentBrochures: recentBrochures
    });
  } catch (error) {
    console.error("Error getting admin stats:", error);
    res.status(500).json({ message: "Error getting admin dashboard stats" });
  }
});

// Apply admin routes
app.use("/api/admin", adminRoutes);

// Routes - applied lazily after testing connectivity
app.use("/api/auth", authRouter);

// Connect to DB before applying data-dependent routes
// Note: this approach still lets the API work even if DB connection fails
connectToMongoDB().then(() => {
  console.log("MongoDB connection initialized, setting up routes");
}).catch(err => {
  console.warn("MongoDB initialization error, some routes may have limited functionality:", err);
});

// Apply routes regardless of DB connection status
app.use("/api/gallery", galleryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/products", productRoutes);
app.use('/api/brochure', brochureRoutes);

// Add another test endpoint specifically for checking DB connectivity
app.get("/api/db-test", async (req, res) => {
  try {
    const dbConn = await connectToMongoDB();
    if (dbConn) {
      res.json({ 
        message: "Database connection successful!", 
        status: "connected",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        message: "Database connection failed", 
        status: "disconnected",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking database connection",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add an S3 test endpoint
app.get("/api/s3-test", async (req, res) => {
  try {
    const s3 = getS3Client();
    if (!s3) {
      return res.status(500).json({
        message: "S3 client initialization failed",
        status: "disconnected", 
        timestamp: new Date().toISOString()
      });
    }
    
    // List buckets as a simple test
    const data = await s3.listBuckets().promise();
    
    res.json({
      message: "S3 connection successful",
      status: "connected",
      buckets: data.Buckets.map(b => b.Name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error connecting to S3",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // Extract useful error info without leaking implementation details
  const errorResponse = {
    message: "Something went wrong on the server",
    errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    timestamp: new Date().toISOString()
  };

  // Add more details in development
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.details = err.message;
    errorResponse.stack = err.stack;
  }

  if (err instanceof multer.MulterError) {
    errorResponse.message = "File upload error";
    errorResponse.details = err.message;
    return res.status(400).json(errorResponse);
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    errorResponse.message = "Database error";
    return res.status(500).json(errorResponse);
  }

  res.status(500).json(errorResponse);
});

// API routes should be above this line
if (process.env.NODE_ENV === 'production') {
  // In production, let Vercel handle the static file serving
  app.all('*', (req, res) => {
    res.status(200).json({ message: 'Backend API is running' });
  });
} else {
  // Development routes
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'admin', 'admin-login.html'));
  });

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });
}

// Start server locally in development mode
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

// Export the Express app for Vercel serverless function
module.exports = app;
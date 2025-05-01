const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Import routes
const { router: authRouter } = require("./routes/auth");
const galleryRoutes = require("./routes/gallery");
const blogRoutes = require("./routes/blog");
const productRoutes = require("./routes/products");
const brochureRoutes = require('./routes/brochureRoutes');

const app = express();

// Increase payload size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Create uploads directory if it doesn't exist (only in development)
if (process.env.NODE_ENV !== 'production') {
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
}

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://odaville.com', 'https://www.odaville.com', 'https://admin.odaville.com', 'https://odaville.vercel.app']
  : ['http://localhost:5000', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Configure storage based on environment
const getStorage = (destination) => {
  if (process.env.NODE_ENV === 'production') {
    // For Vercel, use memory storage since filesystem access is read-only
    return multer.memoryStorage();
  } else {
    // For development, use disk storage
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

// File handlers (for routes that need them)
// These will be used in your route files
exports.blogUpload = multer({ storage: getStorage('blog') });
exports.galleryUpload = multer({ storage: getStorage('gallery') });
exports.productsUpload = multer({ storage: getStorage('products') });

// Serve static files based on environment
if (process.env.NODE_ENV === 'production') {
  // In production, static files are handled by Vercel's static file hosting
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} else {
  // In development, serve static files locally
  app.use(express.static(path.join(__dirname, "..", "frontend")));
  app.use("/admin", express.static(path.join(__dirname, "..", "frontend", "admin")));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/brochures', express.static(path.join(__dirname, '..', 'brochures')));
}

// Add simple test endpoint for connection testing
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API connection successful!", 
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB with better error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log(
      "Check that MongoDB service is running and connection string is correct."
    );
  });

// Helper function for file handling in Vercel (serverless)
// This will be used in your route files
exports.saveFileInVercel = async (file, directory) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, you'd typically use a cloud storage service
    // For this example, we're just returning a path
    // In a real app, implement AWS S3 or similar cloud storage
    const fileName = Date.now() + path.extname(file.originalname);
    
    // Return the path that would be used in database
    return `/uploads/${directory}/${fileName}`;
  } else {
    // In development, files are already saved by multer disk storage
    return `/uploads/${directory}/${file.filename}`;
  }
};

// Routes
app.use("/api/auth", authRouter);
app.use("/api/gallery", galleryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/products", productRoutes);
app.use('/api/brochure', brochureRoutes);

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message });
  }

  if (err.name === "MongoError" || err.name === "MongoServerError") {
    return res.status(500).json({ message: "Database error: " + err.message });
  }

  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
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

const PORT = process.env.PORT || 5000;

// Only start the server if not being imported by Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

// Export the app for Vercel serverless function
module.exports = app;
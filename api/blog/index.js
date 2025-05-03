// Update api/blog/index.js to use real MongoDB
const mongoose = require('mongoose');
const { setCorsHeaders } = require('../utils/cors');

// Define Blog schema inline for this function
const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  category: String,
  imageUrl: String,
  tags: [String],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Create model
let Blog;
try {
  // Try to get the model if it exists
  Blog = mongoose.model('Blog');
} catch {
  // Create the model if it doesn't exist
  Blog = mongoose.model('Blog', BlogSchema);
}

// Connect to MongoDB
async function connectToMongoDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }
  return true;
}

module.exports = async (req, res) => {
  // Set CORS headers with specific origin handling
  const allowedOrigins = [
    'https://www.odaville.com',
    'https://odaville.com', 
    'https://admin.odaville.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to connect to MongoDB
    const isConnected = await connectToMongoDB();
    
    if (!isConnected) {
      // Fall back to mock data if MongoDB connection fails
      return res.status(200).json([
        { 
          _id: 'blog1',
          title: 'Sample Blog Post 1',
          content: '<p>This is a sample blog post.</p>',
          author: 'Admin',
          imageUrl: '/images/placeholder.jpg',
          createdAt: new Date().toISOString(),
          isPublished: true
        },
        { 
          _id: 'blog2',
          title: 'Sample Blog Post 2',
          content: '<p>This is another sample blog post.</p>',
          author: 'Admin',
          imageUrl: '/images/placeholder.jpg',
          createdAt: new Date().toISOString(),
          isPublished: true
        }
      ]);
    }
    
    // Get query parameters
    const { published } = req.query;
    let query = {};

    if (published === "true") {
      query.isPublished = true;
    }

    // Get blog posts from the database
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    // Return empty array if no blogs found
    if (!blogs || blogs.length === 0) {
      return res.status(200).json([]);
    }
    
    return res.status(200).json(blogs);
  } catch (error) {
    console.error('Blog API error:', error);
    
    // Return mock data in case of error
    return res.status(200).json([
      { 
        _id: 'fallback1',
        title: 'Fallback Blog Post',
        content: '<p>This is a fallback blog post when database is unavailable.</p>',
        author: 'System',
        imageUrl: '/images/placeholder.jpg',
        createdAt: new Date().toISOString(),
        isPublished: true
      }
    ]);
  }
};
// api/blog/index.js
const mongoose = require('mongoose');

// Define Blog schema
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
  Blog = mongoose.model('Blog');
} catch {
  Blog = mongoose.model('Blog', BlogSchema);
}

// Connect to MongoDB
async function connectToMongoDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
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
  // Set proper CORS headers for cross-domain requests
  const allowedOrigins = [
    'https://www.odaville.com',
    'https://admin.odaville.com',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to MongoDB
    const isConnected = await connectToMongoDB();
    
    if (!isConnected) {
      console.error('Failed to connect to MongoDB');
      return res.status(500).json({ 
        message: 'Database connection failed',
        error: 'Could not connect to MongoDB'
      });
    }
    
    // Get query parameters
    const { published } = req.query;
    let query = {};

    if (published === "true") {
      query.isPublished = true;
    }

    // Fetch blog posts from MongoDB
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    
    return res.status(200).json(blogs);
    
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ 
      message: 'Error fetching blog posts',
      error: error.message
    });
  }
};
// api/blog/[id].js
const mongoose = require('mongoose');
const Blog = require('../../backend/models/Blog');

// Connect to MongoDB (lazy connection)
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS (preflight) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get blog ID from the URL
  const id = req.query.id;
  
  try {
    await connectDB();
    
    if (req.method === 'GET') {
      const blog = await Blog.findById(id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      
      return res.status(200).json(blog);
    }
    
    // Handle other methods like PUT, DELETE here
    // For now, return 405 Method Not Allowed for unsupported methods
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// api/products/index.js
const mongoose = require('mongoose');
const Product = require('../../backend/models/Product');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS (preflight) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    await connectDB();
    
    if (req.method === 'GET') {
      // Get category from query params
      const { category } = req.query;
      let query = {};

      if (category) {
        query.category = category;
      }

      const products = await Product.find(query).sort({
        order: 1,
        createdAt: -1,
      });
      
      return res.status(200).json(products);
    }
    
    // Handle other methods like POST here
    // For now, return 405 Method Not Allowed for unsupported methods
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
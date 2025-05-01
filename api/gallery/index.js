// api/gallery/index.js
const mongoose = require('mongoose');
const Gallery = require('../../backend/models/Gallery');

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
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      return res.status(200).json(gallery);
    }
    
    // Handle other methods like POST here
    // For now, return 405 Method Not Allowed for unsupported methods
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
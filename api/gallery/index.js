// api/gallery/index.js
const mongoose = require('mongoose');

// Define Gallery schema
const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  category: String,
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create model
let Gallery;
try {
  Gallery = mongoose.model('Gallery');
} catch {
  Gallery = mongoose.model('Gallery', GallerySchema);
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to MongoDB
    const isConnected = await connectToMongoDB();
    
    if (!isConnected) {
      // If connection fails, return empty array or fallback data
      console.error('Failed to connect to MongoDB');
      return res.status(500).json({ 
        message: 'Database connection failed',
        error: 'Could not connect to MongoDB'
      });
    }
    
    // Fetch gallery items from MongoDB
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    
    return res.status(200).json(galleryItems);
    
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ 
      message: 'Error fetching gallery items',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
};
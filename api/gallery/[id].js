// api/gallery/[id].js
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
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isConnected = await connectToMongoDB();
  if (!isConnected) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  try {
    const { id } = req.query;

    if (req.method === 'GET') {
      const item = await Gallery.findById(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      return res.status(200).json(item);
    }

    if (req.method === 'DELETE') {
      const item = await Gallery.findByIdAndDelete(id);
      
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      return res.status(200).json({ message: 'Gallery item deleted successfully' });
    }

    if (req.method === 'PUT') {
      // For PUT requests, update an existing item
      const { title, description, category, isFeatured } = req.body;
      
      const updatedItem = await Gallery.findByIdAndUpdate(
        id,
        {
          title,
          description,
          category,
          isFeatured: isFeatured === 'true' || isFeatured === true
        },
        { new: true }
      );
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      
      return res.status(200).json(updatedItem);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
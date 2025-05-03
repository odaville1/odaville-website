// api/gallery/[id].js
const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  isFeatured: Boolean,
  createdAt: { type: Date, default: Date.now }
});

let Gallery;
try {
  Gallery = mongoose.model('Gallery');
} catch {
  Gallery = mongoose.model('Gallery', GallerySchema);
}

async function connectToMongoDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return false;
    }
  }
  return true;
}

module.exports = async (req, res) => {
  // CORS headers
  const allowedOrigins = [
    'https://www.odaville.com',
    'https://admin.odaville.com',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isConnected = await connectToMongoDB();
  if (!isConnected) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await Gallery.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      return res.json(item);
    }

    if (req.method === 'DELETE') {
      const item = await Gallery.findByIdAndDelete(id);
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      return res.json({ message: 'Gallery item deleted successfully' });
    }

    if (req.method === 'PUT') {
      // Handle update logic here
      const item = await Gallery.findByIdAndUpdate(id, req.body, { new: true });
      if (!item) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }
      return res.json(item);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
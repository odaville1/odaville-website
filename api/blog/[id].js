// api/blog/[id].js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  imageUrl: String,
  isPublished: Boolean,
  createdAt: { type: Date, default: Date.now }
});

let Blog;
try {
  Blog = mongoose.model('Blog');
} catch {
  Blog = mongoose.model('Blog', BlogSchema);
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
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      return res.json(blog);
    }

    if (req.method === 'DELETE') {
      const blog = await Blog.findByIdAndDelete(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      return res.json({ message: 'Blog post deleted successfully' });
    }

    if (req.method === 'PUT') {
      const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      return res.json(blog);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Blog API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
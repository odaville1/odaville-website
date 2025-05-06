// api/gallery/index.js
const mongoose = require('mongoose');
const formidable = require('formidable');
const fs = require('fs');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
    try {
      // Return mock data for now
      return res.status(200).json([

        { 
          _id: 'gallery2',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G1.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery3',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G2.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery4',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G3.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery5',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G4.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery6',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G5.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery7',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G6.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery8',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G8.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery9',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G9.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery10',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G7.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        }

        
        
      ]);
    } catch (error) {
      console.error('Gallery API error:', error);
      return res.status(500).json({ 
        message: 'Error processing request', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    }
  };
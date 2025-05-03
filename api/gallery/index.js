// api/gallery/index.js
const mongoose = require('mongoose');
const formidable = require('formidable');
const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Gallery Schema
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isConnected = await connectToMongoDB();
  if (!isConnected) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  try {
    if (req.method === 'GET') {
      const galleries = await Gallery.find().sort({ createdAt: -1 });
      return res.json(galleries);
    }

    if (req.method === 'POST') {
      return new Promise((resolve, reject) => {
        const form = formidable({
          multiples: true,
          keepExtensions: true
        });

        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Form parse error:', err);
            res.status(500).json({ message: 'Error parsing form data' });
            return resolve();
          }

          try {
            let imageUrl = '';

            // Handle image upload
            if (files.image) {
              const file = Array.isArray(files.image) ? files.image[0] : files.image;
              const fileContent = fs.readFileSync(file.filepath);
              
              // Create unique filename
              const timestamp = Date.now();
              const fileName = `gallery/${timestamp}-${file.originalFilename}`;
              
              // S3 upload parameters
              const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: fileContent,
                ContentType: file.mimetype,
                ACL: 'public-read' // Makes the file publicly accessible
              };

              // Upload to S3
              const uploadResult = await s3.upload(params).promise();
              imageUrl = uploadResult.Location; // This will be the full S3 URL
              
              console.log('Image uploaded to S3:', imageUrl);
            }

            // Create gallery item with S3 URL
            const newGallery = new Gallery({
              title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
              description: Array.isArray(fields.description) ? fields.description[0] : fields.description,
              imageUrl: imageUrl,
              category: Array.isArray(fields.category) ? fields.category[0] : fields.category,
              isFeatured: fields.isFeatured === 'true' || fields.isFeatured === true
            });

            await newGallery.save();
            res.status(201).json(newGallery);
            resolve();
          } catch (error) {
            console.error('Error saving gallery item:', error);
            res.status(500).json({ message: 'Error saving gallery item', error: error.message });
            resolve();
          }
        });
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Gallery API error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
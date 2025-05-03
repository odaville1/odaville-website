// scripts/fix-gallery-urls.js
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const GallerySchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  category: String,
  isFeatured: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.model('Gallery', GallerySchema);

async function fixGalleryUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const galleries = await Gallery.find();
    console.log(`Found ${galleries.length} gallery items`);

    for (const gallery of galleries) {
      if (gallery.imageUrl && gallery.imageUrl.startsWith('/uploads/')) {
        // Extract filename from current path
        const filename = gallery.imageUrl.split('/').pop();
        
        // Construct S3 URL
        const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/gallery/${filename}`;
        
        console.log(`Updating ${gallery.title}: ${gallery.imageUrl} -> ${s3Url}`);
        
        gallery.imageUrl = s3Url;
        await gallery.save();
      }
    }

    console.log('All gallery URLs updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixGalleryUrls();
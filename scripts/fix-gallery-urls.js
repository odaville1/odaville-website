// scripts/fix-gallery-urls.js
const mongoose = require('mongoose');
require('dotenv').config();

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
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const galleries = await Gallery.find();
    console.log(`Found ${galleries.length} gallery items`);

    let updatedCount = 0;

    for (const gallery of galleries) {
      if (gallery.imageUrl && gallery.imageUrl.startsWith('/uploads/')) {
        // Extract filename from current path
        const filename = gallery.imageUrl.split('/').pop();
        
        // Construct S3 URL
        const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/gallery/${filename}`;
        
        console.log(`Updating ${gallery.title}:`);
        console.log(`  From: ${gallery.imageUrl}`);
        console.log(`  To: ${s3Url}`);
        
        gallery.imageUrl = s3Url;
        await gallery.save();
        updatedCount++;
      }
    }

    console.log(`\nMigration completed. Updated ${updatedCount} gallery items.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixGalleryUrls();
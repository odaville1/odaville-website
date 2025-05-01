// backend/routes/gallery.js
const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const { auth } = require("./auth");

// Import S3 upload utility
const { uploadToS3 } = require('../utils/s3-upload');
const upload = uploadToS3('gallery');

// Get all gallery items
router.get("/", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new gallery item
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, isFeatured } = req.body;
    
    // Get image URL from S3
    const imageUrl = req.file ? req.file.location : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image is required for gallery items" });
    }

    const galleryItem = new Gallery({
      title,
      description,
      imageUrl,
      category,
      isFeatured: isFeatured === "true",
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update gallery item
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, isFeatured } = req.body;
    const updateData = {
      title,
      description,
      category,
      isFeatured: isFeatured === "true",
    };

    // Only update the image if a new one is uploaded
    if (req.file) {
      updateData.imageUrl = req.file.location;
    }

    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete gallery item
router.delete("/:id", auth, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }
    res.json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
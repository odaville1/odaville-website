const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Gallery = require("../models/Gallery");
const { auth } = require("./auth");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/gallery");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
    const imageUrl = req.file ? `/uploads/gallery/${req.file.filename}` : null;

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

    if (req.file) {
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
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

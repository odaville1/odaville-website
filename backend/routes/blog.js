const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Blog = require("../models/Blog");
const auth = require("./auth").auth;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/blog");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get all blog posts
router.get("/", async (req, res) => {
  try {
    const { published } = req.query;
    let query = {};

    if (published === "true") {
      query.isPublished = true;
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single blog post
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new blog post
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, author, category, tags, isPublished } = req.body;
    const imageUrl = req.file ? `/uploads/blog/${req.file.filename}` : null;

    // FIX: Correctly convert isPublished string value from form to boolean
    const publishStatus = isPublished === "published";

    const blog = new Blog({
      title,
      content,
      author,
      category,
      imageUrl,
      tags: tags ? tags.split(",") : [],
      isPublished: publishStatus,
      publishedAt: publishStatus ? new Date() : null,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update blog post
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, author, category, tags, isPublished } = req.body;

    // FIX: Correctly convert isPublished string value from form to boolean
    const publishStatus = isPublished === "published";

    const updateData = {
      title,
      content,
      author,
      category,
      tags: tags ? tags.split(",") : [],
      isPublished: publishStatus,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/blog/${req.file.filename}`;
    }

    // Set publishedAt date if newly published
    if (publishStatus) {
      const existingPost = await Blog.findById(req.params.id);
      if (!existingPost.isPublished) {
        updateData.publishedAt = new Date();
      }
    } else {
      // If unpublishing, remove the publishedAt date
      updateData.publishedAt = null;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete blog post
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

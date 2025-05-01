const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      enum: ["windows", "doors", "signature", "architectural"],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

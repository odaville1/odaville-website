// api/diagnostic.js - Helper endpoint to check environment variables and dependencies
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    try {
      // Create diagnostic object with safe information
      const diagnostics = {
        environment: process.env.NODE_ENV || 'not set',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        envVarsPresent: {
          MONGODB_URI: !!process.env.MONGODB_URI,
          JWT_SECRET: !!process.env.JWT_SECRET,
          AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
          AWS_REGION: !!process.env.AWS_REGION,
          AWS_BUCKET_NAME: !!process.env.AWS_BUCKET_NAME
        }
      };
      
      // Try to import mongoose to check if it's available
      try {
        const mongoose = require('mongoose');
        diagnostics.dependencies = {
          ...diagnostics.dependencies,
          mongoose: {
            version: mongoose.version,
            available: true
          }
        };
      } catch (error) {
        diagnostics.dependencies = {
          ...diagnostics.dependencies,
          mongoose: {
            available: false,
            error: error.message
          }
        };
      }
      
      // Try to import express
      try {
        const express = require('express');
        diagnostics.dependencies = {
          ...diagnostics.dependencies,
          express: {
            available: true
          }
        };
      } catch (error) {
        diagnostics.dependencies = {
          ...diagnostics.dependencies,
          express: {
            available: false,
            error: error.message
          }
        };
      }
      
      return res.status(200).json(diagnostics);
    } catch (error) {
      return res.status(500).json({
        message: 'Error running diagnostics',
        error: error.message
      });
    }
  };
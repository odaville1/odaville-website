// backend/utils/s3-upload.js

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK with environment variables
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create upload middleware for different folders
const uploadToS3 = (folder) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${folder}/${fileName}.${fileExtension}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
  });
};

module.exports = { uploadToS3 };
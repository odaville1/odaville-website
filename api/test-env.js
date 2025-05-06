module.exports = function handler(req, res) {
  res.status(200).json({
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + "..." : null,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
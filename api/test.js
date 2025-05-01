// Simple serverless function for testing API connectivity
module.exports = (req, res) => {
    res.status(200).json({
      message: 'API test endpoint is working!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  };
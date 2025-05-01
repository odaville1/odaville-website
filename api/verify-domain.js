// api/verify-domain.js
module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Get hostname from request
    const hostname = req.headers.host || 'unknown';
    
    // Return domain information
    res.status(200).json({
      hostname: hostname,
      isAdmin: hostname.includes('admin'),
      timestamp: new Date().toISOString(),
      headers: req.headers
    });
  };
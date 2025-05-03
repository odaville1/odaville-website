// api/utils/cors.js
function setCorsHeaders(req, res) {
    const allowedOrigins = [
      'https://www.odaville.com',
      'https://odaville.com',
      'https://admin.odaville.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
  
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  }
  
  module.exports = { setCorsHeaders };
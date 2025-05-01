// api/blog/index.js - Simplified version with better error handling
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    try {
      // Check if we're in a production environment
      if (process.env.NODE_ENV === 'production') {
        // In production mode, just return some mock data for now
        // This will help us verify the endpoint works without database connectivity
        return res.status(200).json([
          { 
            _id: 'blog1',
            title: 'Sample Blog Post 1',
            content: '<p>This is a sample blog post.</p>',
            author: 'Admin',
            imageUrl: '/images/placeholder.jpg',
            createdAt: new Date().toISOString(),
            isPublished: true
          },
          { 
            _id: 'blog2',
            title: 'Sample Blog Post 2',
            content: '<p>This is another sample blog post.</p>',
            author: 'Admin',
            imageUrl: '/images/placeholder.jpg',
            createdAt: new Date().toISOString(),
            isPublished: true
          }
        ]);
      } else {
        // We'll add real database connectivity later
        return res.status(200).json([
          { 
            _id: 'blog1',
            title: 'Development Sample Post',
            content: '<p>This is a development sample.</p>',
            author: 'Dev',
            imageUrl: '/images/placeholder.jpg',
            createdAt: new Date().toISOString(),
            isPublished: true
          }
        ]);
      }
    } catch (error) {
      console.error('Blog API error:', error);
      return res.status(500).json({ 
        message: 'Error processing request', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    }
  };
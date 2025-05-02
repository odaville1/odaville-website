// api/gallery/index.js - Simplified version without DB dependency
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
      // Return mock data for now
      return res.status(200).json([
        { 
          _id: 'gallery1',
          title: 'Sample Gallery Item 1',
          description: 'Beautiful windows with ocean view',
          imageUrl: '/images/gallery/Gallery-1 (1).jpg',
          category: 'windows',
          isFeatured: true,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery2',
          title: 'Sample Gallery Item 2',
          description: 'Elegant door design for modern homes',
          imageUrl: '/images/gallery/Gallery-1 (2).jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery3',
          title: 'Sample Gallery Item 3',
          description: 'Elegant door design for modern homes',
          imageUrl: '/images/gallery/Gallery-1 (3).jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        }
        
      ]);
    } catch (error) {
      console.error('Gallery API error:', error);
      return res.status(500).json({ 
        message: 'Error processing request', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    }
  };
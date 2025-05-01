// api/products/index.js - Simplified version without DB dependency
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
      // Check if category filter is provided
      const category = req.query.category;
      
      // Sample product data
      let products = [
        { 
          _id: 'prod1',
          title: 'Premium Window',
          subtitle: 'Energy efficient design',
          description: 'Our premium window offers exceptional insulation and elegant design.',
          category: 'windows',
          imageUrl: '/images/placeholder.jpg',
          featured: true,
          order: 1,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'prod2',
          title: 'Classic Door',
          subtitle: 'Timeless elegance',
          description: 'Classic door design that combines durability with aesthetic appeal.',
          category: 'doors',
          imageUrl: '/images/placeholder.jpg',
          featured: true,
          order: 1,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'prod3',
          title: 'Modern Window',
          subtitle: 'Contemporary style',
          description: 'Modern window design with clean lines and maximum light exposure.',
          category: 'windows',
          imageUrl: '/images/placeholder.jpg',
          featured: false,
          order: 2,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Filter by category if provided
      if (category) {
        products = products.filter(product => product.category === category);
      }
      
      return res.status(200).json(products);
    } catch (error) {
      console.error('Products API error:', error);
      return res.status(500).json({ 
        message: 'Error processing request', 
        error: error.message,
        timestamp: new Date().toISOString() 
      });
    }
  };
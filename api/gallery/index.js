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
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/Gallery-1 (1).jpg',
          category: 'windows',
          isFeatured: true,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery2',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G1.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery3',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G2.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery4',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G3.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery5',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G4.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery6',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G5.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery7',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G6.jpg',
          category: 'doors',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        { 
          _id: 'gallery8',
          title: 'Odaville',
          description: 'Odaville is a company that specializes in the design and installation of windows and doors.',
          imageUrl: '/images/gallery/G7.jpg',
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
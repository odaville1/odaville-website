import React, { useState, useEffect } from 'react';
import './ProductGallery.css';

const ProductGallery = ({ products }) => {
  const [activeProduct, setActiveProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProductClick = (product) => {
    if (isMobile) {
      setActiveProduct(activeProduct === product ? null : product);
    }
  };

  return (
    <div className="product-gallery">
      {products.map((product) => (
        <div
          key={product.id}
          className={`product-item ${activeProduct === product ? 'active' : ''}`}
          onClick={() => handleProductClick(product)}
        >
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          {isMobile && activeProduct !== product && <div className="overlay" />}
        </div>
      ))}
    </div>
  );
};

export default ProductGallery; 
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS styles for responsive product cards with button-only navigation

    
    // Product data - using your existing data
    const products = [
        {
            id: 1,
            name: 'Corner Window',
            category: 'windows',
            description: 'Stylish corner window design with panoramic views',
            image: 'images/products/p1.jpg',
            model: 'SKYLINE'
        },
        {
            id: 2,
            name: 'Premium Glass',
            category: 'windows',
            description: 'High-quality insulated glass for maximum efficiency',
            image: 'images/products/p2.jpg',
            model: 'CLEARVIEW'
        },
        {
            id: 3,
            name: 'Window System',
            category: 'windows',
            description: 'Complete window system with sophisticated design',
            image: 'images/products/p3.jpg',
            model: 'PANORAMA'
        },
        {
            id: 4,
            name: 'Sliding Door',
            category: 'doors',
            description: 'Smooth sliding door system for modern homes',
            image: 'images/products/p4.jpg',
            model: 'HORIZON'
        },
        {
            id: 5,
            name: 'French Door',
            category: 'doors',
            description: 'Elegant French door design with premium finish',
            image: 'images/products/p5.jpg',
            model: 'CLASSIC'
        },
        {
            id: 6,
            name: 'Signature Skylight',
            category: 'signature',
            description: 'Luxury skylight with advanced climate control',
            image: 'images/products/p6.jpg',
            model: 'CELESTIAL'
        }
    ];

    // Elements
    const productTrack = document.getElementById('productTrack');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const prevBtn = document.querySelector('.prev-product');
    const nextBtn = document.querySelector('.next-product');
    
    // Check if elements exist
    if (!productTrack) {
        console.error('Product track element not found');
        return;
    }
    
    let currentIndex = 0;
    let filteredProducts = [...products];
    let cardWidth = 0;
    
    // Set product track height based on viewport
    function setProductTrackHeight() {
        if (window.innerWidth <= 480) {
            productTrack.style.height = '400px';
        } else if (window.innerWidth <= 768) {
            productTrack.style.height = '400px';
        } else {
            productTrack.style.height = '560px';
        }
    }
    
    // Call the function initially
    setProductTrackHeight();

    // Initialize the product carousel with button-only navigation
    function initProductCarousel() {
        renderProducts();
        setupEventListeners();
        setupClones();
        setCenterProduct(currentIndex + filteredProducts.length); // Start from the first real item
    }

    // Create clones for infinite carousel effect
    function setupClones() {
        const cards = document.querySelectorAll('.product-card');
        if (cards.length === 0) return;
        
        // Calculate card width including margin
        let cardMargin = 40;
        if (window.innerWidth <= 480) {
            cardMargin = 16;
        } else if (window.innerWidth <= 768) {
            cardMargin = 20;
        }
        
        cardWidth = cards[0].offsetWidth + cardMargin;
        
        // Remove existing clones
        document.querySelectorAll('.product-card.clone').forEach(clone => clone.remove());
        
        // Clone start and end cards for infinite effect
        const firstClones = [...cards].slice(0, filteredProducts.length).map(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            return clone;
        });
        
        const lastClones = [...cards].slice(-filteredProducts.length).map(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            return clone;
        });
        
        // Add clones to track
        firstClones.forEach(clone => {
            productTrack.appendChild(clone);
        });
        
        lastClones.forEach(clone => {
            productTrack.insertBefore(clone, productTrack.firstChild);
        });
        
        // Update all data-index attributes
        updateProductIndices();
    }
    
    // Update all product card indices
    function updateProductIndices() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.setAttribute('data-index', index);
        });
    }

    // Render products in the track
    function renderProducts() {
        productTrack.innerHTML = '';
        
        filteredProducts.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = `product-card ${index === currentIndex ? 'active' : ''}`;
            productCard.setAttribute('data-index', index);
            productCard.setAttribute('data-category', product.category);
            
            // Set consistent styling for margin to ensure proper centering
            productCard.style.margin = '0 15px';
            
            // Create product description based on model
            let productDescription = product.description;
            
            // Simplify description for mobile
            const useSimpleDescription = window.innerWidth <= 480;
            
            if (product.model === 'SKYLINE') {
                productDescription = useSimpleDescription ? 'CORNER WINDOW WITH PANORAMIC VIEWS' : 'STYLISH CORNER WINDOW DESIGN<br>WITH PANORAMIC VIEWS';
            } else if (product.model === 'CLEARVIEW') {
                productDescription = useSimpleDescription ? 'HIGH-QUALITY INSULATED GLASS' : 'HIGH-QUALITY INSULATED<br>GLASS FOR MAXIMUM<br>EFFICIENCY';
            } else if (product.model === 'PANORAMA') {
                productDescription = useSimpleDescription ? 'COMPLETE WINDOW SYSTEM' : 'COMPLETE WINDOW SYSTEM<br>WITH SOPHISTICATED DESIGN';
            } else if (product.model === 'HORIZON') {
                productDescription = useSimpleDescription ? 'SLIDING DOOR SYSTEM' : 'SMOOTH SLIDING DOOR<br>SYSTEM FOR MODERN HOMES';
            }
            
            productCard.innerHTML = `
                <span class="product-category">${product.model}</span>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${productDescription}</p>
                </div>
            `;
            
            productTrack.appendChild(productCard);
        });
    }

    // Set up event listeners for button-only navigation
    function setupEventListeners() {
        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                navigateProducts('prev');
            });
        }
        
        // Next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                navigateProducts('next');
            });
        }
        
        // Filter tabs click
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                filterTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                filterProducts(category);
            });
        });

        // Product card click handler (only select product, no dragging)
        productTrack.addEventListener('click', function(e) {
            const card = e.target.closest('.product-card');
            if (card) {
                const index = parseInt(card.getAttribute('data-index'));
                setCenterProduct(index);
            }
        });
        
        // Handle transition end for infinite loop effect
        productTrack.addEventListener('transitionend', handleTransitionEnd);
    }

    // Center a specific product
    function setCenterProduct(index, animate = true) {
        currentIndex = index;
        
        // Update active class on products
        const productCards = document.querySelectorAll('.product-card');
        if (productCards.length === 0) return;
        
        const isMobileView = window.innerWidth <= 480;
        
        productCards.forEach((card, i) => {
            // Remove active class from all cards
            card.classList.remove('active');
            
            // In mobile view, only show the active card
            if (isMobileView) {
                if (i === index) {
                    // Make center card active and visible
                    card.classList.add('active');
                    card.style.opacity = '1';
                    card.style.zIndex = '5';
                    card.style.display = 'flex';
                } else {
                    // Hide other cards on mobile
                    card.style.opacity = '0';
                    card.style.zIndex = '1';
                    card.style.display = 'none';
                }
            } else {
                // Regular desktop behavior - all cards visible
                card.style.display = 'flex';
                
                // Apply visual styling to indicate active card
                if (i === index) {
                    card.classList.add('active');
                    card.style.opacity = '1';
                    card.style.zIndex = '5';
                } else {
                    card.style.opacity = '0.7';
                    card.style.zIndex = '1';
                }
            }
        });
        
        // Get the container width
        const containerWidth = productTrack.parentElement.offsetWidth;
        
        // Calculate the position to center the active product
        // We need to center the card with index 'index'
        const cardPositions = [];
        let totalWidth = 0;
        
        // First calculate the absolute position of each card
        productCards.forEach((card) => {
            const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginLeft) + 
                            parseInt(getComputedStyle(card).marginRight);
            cardPositions.push(totalWidth);
            totalWidth += cardWidth;
        });
        
        // Now find the center position of the container
        const containerCenter = containerWidth / 2;
        
        // Find the center of the target card
        const activeCard = productCards[index];
        const activeCardWidth = activeCard.offsetWidth;
        const activeCardCenter = cardPositions[index] + (activeCardWidth / 2);
        
        // Calculate the offset needed to center the active card
        let offset = containerCenter - activeCardCenter;
        
        // In mobile view, we just center the single visible card
        if (isMobileView) {
            offset = (containerWidth - activeCardWidth) / 2;
        }
        
        // Apply transition only if animate is true
        if (animate) {
            productTrack.style.transition = 'transform 0.5s ease-in-out';
        } else {
            productTrack.style.transition = 'none';
        }
        
        // Set the transform
        productTrack.style.transform = `translateX(${offset}px)`;
    }

    // Handle transition end for infinite loop effect
    function handleTransitionEnd() {
        const cards = document.querySelectorAll('.product-card');
        const totalCards = cards.length;
        const cloneCount = filteredProducts.length;
        
        if (totalCards === 0 || cloneCount === 0) return;
        
        // If we've scrolled to a clone at the end, jump to the real item without animation
        if (currentIndex >= totalCards - cloneCount) {
            currentIndex = cloneCount + (currentIndex % cloneCount);
            productTrack.style.transition = 'none';
            setCenterProduct(currentIndex, false);
            // Force reflow
            void productTrack.offsetWidth;
            productTrack.style.transition = 'transform 0.5s ease-in-out';
        }
        // If we've scrolled to a clone at the beginning, jump to the real item without animation
        else if (currentIndex < cloneCount) {
            currentIndex = totalCards - (2 * cloneCount) + (currentIndex % cloneCount);
            productTrack.style.transition = 'none';
            setCenterProduct(currentIndex, false);
            // Force reflow
            void productTrack.offsetWidth;
            productTrack.style.transition = 'transform 0.5s ease-in-out';
        }
    }

    // Navigate products (prev/next) - button-only navigation
    function navigateProducts(direction) {
        const totalCards = document.querySelectorAll('.product-card').length;
        
        if (direction === 'prev') {
            currentIndex = Math.max(0, currentIndex - 1);
        } else {
            currentIndex = Math.min(totalCards - 1, currentIndex + 1);
        }
        
        setCenterProduct(currentIndex);
    }

    // Filter products by category
    function filterProducts(category) {
        if (category === 'all') {
            filteredProducts = [...products];
        } else {
            filteredProducts = products.filter(product => product.category === category);
        }
        
        // Reset carousel
        productTrack.innerHTML = '';
        renderProducts();
        
        // Ensure we have products before setting up clones
        if (filteredProducts.length > 0) {
            setupClones();
            
            // Reset current index and center the first product
            currentIndex = filteredProducts.length; // Start with the first real item (after clones)
            setCenterProduct(currentIndex);
        } else {
            productTrack.innerHTML = '<div class="no-products">No products found in this category</div>';
        }
    }

    // Initialize the carousel
    initProductCarousel();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateProducts('prev');
        } else if (e.key === 'ArrowRight') {
            navigateProducts('next');
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setProductTrackHeight();
            setupClones(); // Rebuild clones on resize
            setCenterProduct(currentIndex);
        }, 250);
    });
});
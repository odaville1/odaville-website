document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.querySelector('.gallery-grid');
    const filterButtons = document.querySelectorAll('.gallery-filter-button');
    let galleryItems = [];
    const ITEMS_TO_SHOW = 6; // Number of items to show in the gallery section

    // Fetch gallery items from the backend
    async function fetchGalleryItems() {
        try {
            const response = await fetch('/api/gallery/latest');
            const data = await response.json();
            galleryItems = data.slice(0, ITEMS_TO_SHOW); // Only take the latest items
            renderGalleryItems(galleryItems);
        } catch (error) {
            console.error('Error fetching gallery items:', error);
        }
    }

    // Render gallery items
    function renderGalleryItems(items) {
        galleryGrid.innerHTML = '';
        
        items.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = `gallery-grid-item ${index === 0 || index === 3 ? 'large' : ''}`;
            galleryItem.setAttribute('data-category', item.category);
            
            galleryItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="gallery-overlay">
                    <div class="gallery-caption">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;
            
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter items
            const filteredItems = category === 'all' 
                ? galleryItems 
                : galleryItems.filter(item => item.category === category);
            
            renderGalleryItems(filteredItems);
        });
    });

    // Initialize
    fetchGalleryItems();

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight * 0.8) {
                element.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
}); 
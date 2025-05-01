document.addEventListener('DOMContentLoaded', function() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const filterButtons = document.querySelectorAll('.portfolio-filter-button');
    let portfolioItems = [];

    // Fetch all gallery items from the backend
    async function fetchPortfolioItems() {
        try {
            const response = await fetch('/api/gallery/all');
            const data = await response.json();
            portfolioItems = data;
            renderPortfolioItems(portfolioItems);
        } catch (error) {
            console.error('Error fetching portfolio items:', error);
        }
    }

    // Render portfolio items
    function renderPortfolioItems(items) {
        portfolioGrid.innerHTML = '';
        
        items.forEach(item => {
            const portfolioItem = document.createElement('div');
            portfolioItem.className = 'portfolio-item';
            portfolioItem.setAttribute('data-category', item.category);
            
            portfolioItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="portfolio-overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `;
            
            // Add click event for modal
            portfolioItem.addEventListener('click', () => openModal(item));
            
            portfolioGrid.appendChild(portfolioItem);
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
                ? portfolioItems 
                : portfolioItems.filter(item => item.category === category);
            
            renderPortfolioItems(filteredItems);
        });
    });

    // Modal functionality
    function openModal(item) {
        const modal = document.createElement('div');
        modal.className = 'portfolio-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="${item.imageUrl}" alt="${item.title}">
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add animation frame for smooth transition
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // Initialize
    fetchPortfolioItems();
}); 
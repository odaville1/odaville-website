/**
 * Text Animations for Odaville Website
 * This script handles the swipe up animation for text elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Select all text elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-text');
    
    // Force immediate display on page load
    setTimeout(function() {
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
    }, 500);
    
    // Function to check if element is in viewport (for future scrolling animations)
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Function to add 'visible' class to elements in viewport (for future sections)
    function handleScroll() {
        const scrollAnimatedElements = document.querySelectorAll('.animate-on-scroll');
        
        scrollAnimatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }
    
    // Listen for scroll events (for future elements)
    window.addEventListener('scroll', handleScroll);
    
    // Handle elements on resize
    window.addEventListener('resize', handleScroll);
});

// Script to handle animation
document.addEventListener('DOMContentLoaded', function() {
    // Make glass panel and CTA visible after a short delay
    setTimeout(function() {
        const glassElement = document.querySelector('.glass-panel');
        const ctaElement = document.querySelector('.services-bottom-cta');
        
        if (glassElement) {
            glassElement.classList.add('visible');
        }
        
        if (ctaElement) {
            ctaElement.classList.add('visible');
        }
    }, 500);
});

/**
 * Odaville Website - Gallery Section
 * This script handles the gallery animations and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Animation for gallery items on scroll
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    function handleScroll() {
        const galleryAnimatedElements = document.querySelectorAll('.gallery-section .animate-on-scroll');
        
        galleryAnimatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Check elements on page load
    handleScroll();
    
    // Optional: Image lazy loading
    const galleryImages = document.querySelectorAll('.gallery-grid-item img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        
        galleryImages.forEach(img => {
            // Convert src to data-src for lazy loading
            if (img.src) {
                img.setAttribute('data-src', img.src);
                img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // Tiny transparent gif
                imageObserver.observe(img);
            }
        });
    }
    
    // Optional: Click handler for gallery items (for future lightbox functionality)
    const galleryItems = document.querySelectorAll('.gallery-grid-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imageSrc = this.querySelector('img').getAttribute('data-src') || this.querySelector('img').src;
            const captionTitle = this.querySelector('.gallery-caption h3').textContent;
            
            console.log(`Gallery item clicked: ${captionTitle} - ${imageSrc}`);
            // Future lightbox implementation would go here
        });
    });
});
/**
 * Odaville Website - Contact Form Validation and Animation
 * This script handles form validation and scroll animations for Contact section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            let isValid = true;
            const inputs = contactForm.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else if (input.type === 'email' && input.value.trim()) {
                    // Basic email validation
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(input.value.trim())) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Form is valid, we would typically submit to server here
                // For demo purposes, show success message
                const submitButton = contactForm.querySelector('.submit-button');
                const originalText = submitButton.textContent;
                
                submitButton.textContent = 'MESSAGE SENT';
                submitButton.disabled = true;
                submitButton.classList.add('success');
                
                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.classList.remove('success');
                }, 3000);
            }
        });
        
        // Clear error state on input focus
        const formInputs = contactForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.classList.remove('error');
            });
        });
    }
    
    // Animation for scroll
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    function handleScroll() {
        const contactAnimatedElements = document.querySelectorAll('.contact-section .animate-on-scroll');
        
        contactAnimatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Check elements on page load
    handleScroll();
    
    // Map interaction enhancements (optional)
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.addEventListener('click', function() {
            const iframe = this.querySelector('iframe');
            if (iframe) {
                // Enable pointer events when clicked (for better map interaction)
                iframe.style.pointerEvents = 'auto';
            }
        });
        
        mapContainer.addEventListener('mouseleave', function() {
            const iframe = this.querySelector('iframe');
            if (iframe) {
                // Disable pointer events when mouse leaves (to prevent scrolling issues)
                iframe.style.pointerEvents = 'none';
            }
        });
    }
});
/**
 * Odaville Website - About Us Animations
 * This script handles the scroll animations for the About Us page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Animation for elements on scroll
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    function handleScroll() {
        const aboutAnimatedElements = document.querySelectorAll('.about-section .animate-on-scroll');
        
        aboutAnimatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Check elements on page load
    handleScroll();
    
    // Optional: Counter animation for stats or years in business
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Optional: Add smooth scroll to CTA button
    const ctaButton = document.querySelector('.about-cta .cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            // If it links to contact section on same page
            if (this.getAttribute('href') === '#contact') {
                e.preventDefault();
                const contactSection = document.querySelector('.contact-section');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    // Interactive hover effects for leadership cards
    const leaderCards = document.querySelectorAll('.leader-card');
    leaderCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            leaderCards.forEach(c => {
                if (c !== this) {
                    c.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            leaderCards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });
});
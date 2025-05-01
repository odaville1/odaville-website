// Mobile menu functionality
// Updated: Always use existing .mobile-nav and .mobile-nav-close, do not create new ones if present

document.addEventListener('DOMContentLoaded', function() {
    let hamburger = document.querySelector('.hamburger');
    // Only create hamburger if missing
    if (!hamburger) {
        hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.querySelector('.site-header').appendChild(hamburger);
    }

    // Do NOT create a new .mobile-nav if it already exists (let HTML control it)
    // Do NOT overwrite .mobile-nav.innerHTML
    
    // Create overlay for mobile menu if it doesn't exist
    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }
    
    const mobileNav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.mobile-nav-close');
    
    function toggleMenu() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
    }
    
    // Remove any existing event listeners
    const newHamburger = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(newHamburger, hamburger);
    hamburger = newHamburger;
    
    // Add event listeners
    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    
    // Close menu when a link is clicked
    if (mobileNav) {
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
    }
    
    // Close menu when Escape key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Scroll down functionality
    const scrollDown = document.querySelector('.scroll-down');
    if (scrollDown) {
        scrollDown.addEventListener('click', function() {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
});
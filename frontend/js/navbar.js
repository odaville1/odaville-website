document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');
    
    // Add click event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if the link is an anchor link (starts with #)
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Get the target section ID
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    // Calculate the offset to account for the fixed header
                    const headerHeight = document.querySelector('.site-header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    // Smooth scroll to the target section
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active state in navigation
                    navLinks.forEach(link => link.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Close mobile menu if open
                    const mobileNav = document.querySelector('.mobile-nav');
                    const overlay = document.querySelector('.overlay');
                    const hamburger = document.querySelector('.hamburger');
                    
                    if (mobileNav && mobileNav.classList.contains('active')) {
                        mobileNav.classList.remove('active');
                        overlay.classList.remove('active');
                        hamburger.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });
    
    // Update active state based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100; // Add offset for better accuracy
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});

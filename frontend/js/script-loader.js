/**
 * Odaville Website - JavaScript Loader
 * Ensures proper loading order of scripts
 */

// This self-executing function ensures scripts load in the correct order
(function() {
    console.log("Script loader initialized");
    
    // Set a flag to track if Swiper is loaded
    window.odaville = window.odaville || {};
    window.odaville.swiperLoaded = typeof Swiper !== 'undefined';
    
    // Function to load a script
    function loadScript(src, callback) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // This ensures scripts load in sequence
      
      // Set up callback
      if (callback) {
        script.onload = callback;
      }
      
      // Add to document
      document.body.appendChild(script);
      return script;
    }
    
    // Function to load Swiper if not already loaded
    function ensureSwiperLoaded(callback) {
      if (window.odaville.swiperLoaded || typeof Swiper !== 'undefined') {
        console.log("Swiper already loaded");
        window.odaville.swiperLoaded = true;
        if (callback) callback();
        return;
      }
      
      console.log("Loading Swiper");
      loadScript("https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js", function() {
        console.log("Swiper loaded successfully");
        window.odaville.swiperLoaded = true;
        if (callback) callback();
      });
    }
    
    // Load scripts in order
    window.addEventListener('DOMContentLoaded', function() {
      // First ensure jQuery is loaded (if needed)
      const jqueryNeeded = false; // Set to true if jQuery is needed
      
      if (jqueryNeeded && typeof jQuery === 'undefined') {
        loadScript("https://code.jquery.com/jquery-3.6.0.min.js", function() {
          loadMainScripts();
        });
      } else {
        loadMainScripts();
      }
    });
    
    function loadMainScripts() {
      // First load general scripts
      loadScript("./js/script.js", function() {
        loadScript("./js/hamburger-menu.js", function() {
          loadScript("./js/text-animations.js", function() {
            
            // Then ensure Swiper is loaded before loading product-related scripts
            ensureSwiperLoaded(function() {
              // Now load product scripts in the correct order
              loadScript("./js/products.js", function() {
                loadScript("./js/product-navigation.js", function() {
                  // After all scripts are loaded
                  loadScript("./js/about.js", function() {
                    loadScript("./js/db-loader.js", function() {
                      console.log("All scripts loaded successfully");
                    });
                  });
                });
              });
            });
            
          });
        });
      });
    }
  })();
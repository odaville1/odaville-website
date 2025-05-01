/**
 * Odaville Website - Background Image Slider
 * This script handles the automatic and manual image transitions
 * for the hero section background using CSS variables with smooth transitions.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Get images from CSS variables
  const style = getComputedStyle(document.documentElement);
  const imageCount = parseInt(
    style.getPropertyValue("--slider-image-count") || "0"
  );
  const backgroundImages = [];

  // Read all image paths from CSS variables
  if (imageCount > 0) {
    for (let i = 1; i <= imageCount; i++) {
      const imageUrl = style.getPropertyValue(`--slider-image-${i}`).trim();
      // Remove url() wrapper and quotes if present
      const cleanUrl = imageUrl.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
      backgroundImages.push(cleanUrl);
    }
  }

  // Fallback images in case CSS variables aren't available
  if (backgroundImages.length === 0) {
    backgroundImages.push(
      "/api/placeholder/1920/1080",
      "/api/placeholder/1920/1081",
      "/api/placeholder/1920/1082"
    );
  }

  // Slider state
  let currentImageIndex = 0;
  const hero = document.querySelector(".hero");
  const prevArrow = document.querySelector(".slider-arrow.prev");
  const nextArrow = document.querySelector(".slider-arrow.next");
  let isAnimating = false;

  // Set initial background
  updateBackgroundImage();

  // Slide interval (change image every 7 seconds)
  let slideInterval = setInterval(nextSlide, 7000);

  // Next slide function
  function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;

    currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    updateBackgroundImage("slide-left");

    setTimeout(() => {
      isAnimating = false;
    }, 1200); // Slightly longer than animation to prevent rapid-fire clicks
  }

  // Previous slide function
  function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;

    currentImageIndex =
      (currentImageIndex - 1 + backgroundImages.length) %
      backgroundImages.length;
    updateBackgroundImage("slide-right");

    setTimeout(() => {
      isAnimating = false;
    }, 1200); // Slightly longer than animation to prevent rapid-fire clicks
  }

  // Update background image with animation
  function updateBackgroundImage(animation = null) {
    // Create new slide element
    const newSlide = document.createElement("div");
    newSlide.className = "hero-bg-transition";
    newSlide.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
    newSlide.style.position = "absolute";
    newSlide.style.top = "0";
    newSlide.style.left = "0";
    newSlide.style.width = "100%";
    newSlide.style.height = "100%";
    newSlide.style.zIndex = "0";
    newSlide.style.backgroundSize = "cover";
    newSlide.style.backgroundPosition = "center";
    newSlide.style.backgroundRepeat = "no-repeat";

    // Create overlay for new slide
    newSlide.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    newSlide.style.backgroundBlendMode = "darken";

    // Position the new slide based on animation direction
    if (animation === "slide-left") {
      newSlide.style.transform = "translateX(100%)";
    } else if (animation === "slide-right") {
      newSlide.style.transform = "translateX(-100%)";
    }

    // Insert the new slide
    hero.insertBefore(newSlide, hero.firstChild);

    // Force a reflow to ensure the initial transform is applied
    void newSlide.offsetWidth;

    // Apply smooth transition
    newSlide.style.transition = "transform 1s ease-out";
    newSlide.style.transform = "translateX(0)";

    // Get the current slide (if any)
    const currentSlides = document.querySelectorAll(
      ".hero-bg-transition:not(:first-child)"
    );

    // Animate current slides out in the opposite direction
    if (currentSlides.length > 0) {
      currentSlides.forEach((slide) => {
        slide.style.transition = "transform 1s ease-out";
        if (animation === "slide-left") {
          slide.style.transform = "translateX(-100%)";
        } else if (animation === "slide-right") {
          slide.style.transform = "translateX(100%)";
        }
      });
    }

    // Remove old slides after animation completes
    setTimeout(() => {
      currentSlides.forEach((slide) => {
        slide.remove();
      });

      // Update the hero background (for initial load or if JS fails)
      hero.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
    }, 1000);
  }

  // Add event listeners to arrows
  if (nextArrow) {
    nextArrow.addEventListener("click", function () {
      clearInterval(slideInterval);
      nextSlide();
      slideInterval = setInterval(nextSlide, 7000);
    });
  }

  if (prevArrow) {
    prevArrow.addEventListener("click", function () {
      clearInterval(slideInterval);
      prevSlide();
      slideInterval = setInterval(nextSlide, 7000);
    });
  }
});

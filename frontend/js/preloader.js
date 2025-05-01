// /**
//  * Odaville Website - Responsive Fullscreen Video Preloader with Delay
//  */

// document.addEventListener('DOMContentLoaded', function() {
//     const preloader = document.querySelector('.preloader');
//     const preloaderVideo = document.querySelector('.preloader-video');
//     const content = document.querySelector('.site-content');
    
//     // Delay time in milliseconds before showing the home screen
//     const transitionDelay = 1000; // 1 second delay (adjust as needed)
    
//     // Function to adjust video positioning based on device and orientation
//     function adjustVideoForDevice() {
//         const windowWidth = window.innerWidth;
//         const windowHeight = window.innerHeight;
//         const videoRatio = 16/9; // Assuming standard video ratio
//         const screenRatio = windowWidth/windowHeight;
        
//         if (windowWidth <= 480) { // Mobile devices
//             if (windowHeight > windowWidth) { // Portrait
//                 // Fill width, may crop top/bottom
//                 preloaderVideo.style.width = '100%';
//                 preloaderVideo.style.height = 'auto';
//                 // Center vertically
//                 const videoHeight = windowWidth / videoRatio;
//                 if (videoHeight < windowHeight) {
//                     preloaderVideo.style.height = '100%';
//                     preloaderVideo.style.width = 'auto';
//                 }
//             } else { // Landscape
//                 // Fill height, may crop sides
//                 preloaderVideo.style.height = '100%';
//                 preloaderVideo.style.width = 'auto';
//                 // Center horizontally
//                 const videoWidth = windowHeight * videoRatio;
//                 if (videoWidth < windowWidth) {
//                     preloaderVideo.style.width = '100%';
//                     preloaderVideo.style.height = 'auto';
//                 }
//             }
//         }
//     }
    
//     // Function to transition to the home screen with delay
//     function transitionToHome() {
//         // First, fade out the preloader
//         preloader.classList.add('fade-out');
        
//         // Then, after preloader fade-out plus additional delay, show content
//         setTimeout(() => {
//             preloader.style.display = 'none';
//             content.classList.add('visible');
            
//             // Trigger animations
//             const animatedElements = document.querySelectorAll('.animate-text');
//             animatedElements.forEach(element => {
//                 element.classList.add('visible');
//             });
//         }, 500 + transitionDelay); // 500ms for fade-out + additional delay
//     }
    
//     // Adjust video size initially
//     adjustVideoForDevice();
    
//     // Adjust when window is resized or orientation changes
//     window.addEventListener('resize', adjustVideoForDevice);
//     window.addEventListener('orientationchange', adjustVideoForDevice);
    
//     // Force video play
//     if (preloaderVideo) {
//         const playPromise = preloaderVideo.play();
        
//         if (playPromise !== undefined) {
//             playPromise.then(_ => {
//                 console.log("Video is playing");
//             })
//             .catch(error => {
//                 console.log("Video play was prevented:", error);
//                 setTimeout(() => {
//                     transitionToHome();
//                 }, 2000);
//             });
//         }
        
//         // Handle video end
//         preloaderVideo.addEventListener('ended', function() {
//             transitionToHome();
//         });
//     }
    
//     // Fallback
//     window.addEventListener('load', function() {
//         setTimeout(() => {
//             if (!preloader.classList.contains('fade-out')) {
//                 transitionToHome();
//             }
//         }, 8000);
//     });
// });
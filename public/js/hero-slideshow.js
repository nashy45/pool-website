// Hero Background Slideshow
// Automatically cycles through venue photos with smooth fade transitions

(function() {
  'use strict';
  
  // Array of background images (your venue photos)
  const backgroundImages = [
    '/media/gallery/venue-1.jpg',
    '/media/gallery/venue-2.jpg',
    '/media/gallery/venue-3.jpg',
    '/media/gallery/venue-4.jpg',
    '/media/gallery/venue-5.jpg'
  ];
  
  let currentIndex = 0;
  const heroPoster = document.getElementById('heroPoster');
  const heroSection = document.querySelector('.hero');
  
  // Don't run if elements don't exist
  if (!heroSection) return;
  
  // Create slideshow container
  const slideshowContainer = document.createElement('div');
  slideshowContainer.className = 'hero-slideshow';
  slideshowContainer.setAttribute('aria-hidden', 'true');
  
  // Create image elements for smooth transitions
  backgroundImages.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'hero-slide';
    img.alt = '';
    if (index === 0) {
      img.classList.add('active');
    }
    slideshowContainer.appendChild(img);
  });
  
  // Insert slideshow before other hero content
  heroSection.insertBefore(slideshowContainer, heroSection.firstChild);
  
  // Hide the old poster/video container if exists
  if (heroPoster) {
    const videoContainer = document.querySelector('.hero-video-container');
    if (videoContainer) {
      videoContainer.style.display = 'none';
    }
  }
  
  // Transition to next image
  function nextSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    
    // Remove active from current
    slides[currentIndex].classList.remove('active');
    
    // Move to next index
    currentIndex = (currentIndex + 1) % backgroundImages.length;
    
    // Add active to new current
    slides[currentIndex].classList.add('active');
  }
  
  // Auto-advance slideshow every 5 seconds
  const slideshowInterval = setInterval(nextSlide, 5000);
  
  // Pause slideshow when page is not visible (battery saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(slideshowInterval);
    } else {
      setInterval(nextSlide, 5000);
    }
  });
  
  // Preload all images for smooth transitions
  backgroundImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
  
})();

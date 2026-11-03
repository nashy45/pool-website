// Gallery Lightbox
// Keyboard-accessible, responsive image gallery with prev/next navigation

(function() {
  'use strict';
  
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  
  let currentIndex = 0;
  const images = [];
  
  // Build image array from gallery
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
      // Use the image source directly (owner's actual photos)
      const largeSrc = img.src;
      const alt = img.alt || 'Gallery image';
      
      images.push({ src: largeSrc, webp: largeSrc, alt: alt });
      
      // Add click handler
      item.addEventListener('click', () => {
        openLightbox(index);
      });
      
      // Add keyboard handler
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `View ${alt} in full size`);
      
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    }
  });
  
  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus close button for accessibility
    setTimeout(() => {
      lightboxClose?.focus();
    }, 100);
  }
  
  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to gallery item
    if (galleryItems[currentIndex]) {
      galleryItems[currentIndex].focus();
    }
  }
  
  function updateLightboxImage() {
    if (!images[currentIndex]) return;
    
    const imageData = images[currentIndex];
    
    // Try to use WebP if browser supports it
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    lightboxImage.src = supportsWebP ? imageData.webp : imageData.src;
    lightboxImage.alt = imageData.alt;
    
    // Update prev/next button states
    if (lightboxPrev && lightboxNext) {
      lightboxPrev.disabled = currentIndex === 0;
      lightboxNext.disabled = currentIndex === images.length - 1;
      
      lightboxPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
      lightboxNext.style.opacity = currentIndex === images.length - 1 ? '0.3' : '1';
    }
  }
  
  function showPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      updateLightboxImage();
    }
  }
  
  function showNext() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateLightboxImage();
    }
  }
  
  // Event listeners
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', showPrevious);
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', showNext);
  }
  
  // Click outside image to close
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          showPrevious();
          break;
        case 'ArrowRight':
          showNext();
          break;
      }
    }
  });
  
  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }
  
  function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - next image
      showNext();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - previous image
      showPrevious();
    }
  }
  
})();

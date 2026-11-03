// Hero Video & Media Controls
// Handles intelligent video loading based on connection, motion preferences, and Data Saver

(function() {
  'use strict';
  
  const videoElement = document.getElementById('heroVideo');
  const posterElement = document.getElementById('heroPoster');
  const videoControl = document.getElementById('videoControl');
  const iconPause = videoControl?.querySelector('.icon-pause');
  const iconPlay = videoControl?.querySelector('.icon-play');
  
  let videoShouldPlay = false;
  let isPlaying = false;
  
  // Check if video should play based on user preferences and connection
  function shouldLoadVideo() {
    // 1. Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.log('Video disabled: user prefers reduced motion');
      return false;
    }
    
    // 2. Check for Save-Data header (Data Saver mode)
    if ('connection' in navigator && navigator.connection.saveData) {
      console.log('Video disabled: Data Saver is on');
      return false;
    }
    
    // 3. Check connection type and speed
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      // Only load video on 4G or better
      if (effectiveType !== '4g') {
        console.log(`Video disabled: connection is ${effectiveType}`);
        return false;
      }
    }
    
    // 4. Check if video sources actually exist (not placeholder)
    const sources = videoElement?.querySelectorAll('source');
    let hasRealVideo = false;
    
    if (sources) {
      sources.forEach(source => {
        // Check if video file exists (not placeholder)
        if (!source.src.includes('placeholder')) {
          hasRealVideo = true;
        }
      });
    }
    
    if (!hasRealVideo) {
      console.log('Video disabled: no real video file available yet');
      return false;
    }
    
    return true;
  }
  
  // Initialize video behavior
  function initHeroVideo() {
    if (!videoElement) return;
    
    videoShouldPlay = shouldLoadVideo();
    
    if (videoShouldPlay) {
      // Hide poster, show video
      if (posterElement) posterElement.style.display = 'none';
      videoElement.style.display = 'block';
      
      // Start playing
      videoElement.play().then(() => {
        isPlaying = true;
        console.log('Hero video playing');
      }).catch(err => {
        console.log('Video autoplay failed:', err);
        // Fallback to poster
        showPoster();
      });
      
      // Show video control
      if (videoControl) videoControl.style.display = 'flex';
    } else {
      // Use poster only
      showPoster();
      if (videoControl) videoControl.style.display = 'none';
    }
  }
  
  function showPoster() {
    if (posterElement) posterElement.style.display = 'block';
    if (videoElement) videoElement.style.display = 'none';
    isPlaying = false;
  }
  
  // Video control button
  if (videoControl) {
    videoControl.addEventListener('click', () => {
      if (!videoElement) return;
      
      if (isPlaying) {
        videoElement.pause();
        isPlaying = false;
        iconPause.style.display = 'none';
        iconPlay.style.display = 'block';
        videoControl.setAttribute('aria-label', 'Play background video');
        videoControl.setAttribute('title', 'Play video');
      } else {
        videoElement.play();
        isPlaying = true;
        iconPause.style.display = 'block';
        iconPlay.style.display = 'none';
        videoControl.setAttribute('aria-label', 'Pause background video');
        videoControl.setAttribute('title', 'Pause video');
      }
    });
  }
  
  // Subtle parallax on poster (only if motion not reduced)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const heroHeight = document.querySelector('.hero')?.offsetHeight || 0;
          
          if (scrolled < heroHeight && posterElement) {
            const parallaxValue = scrolled * 0.3;
            posterElement.style.transform = `translateY(${parallaxValue}px)`;
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVideo);
  } else {
    initHeroVideo();
  }
  
  // Listen for connection changes
  if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
      console.log('Connection changed, re-evaluating video playback');
      // Don't auto-reload video if connection improves (bandwidth consideration)
      // But do pause if connection degrades
      if (isPlaying && !shouldLoadVideo()) {
        if (videoElement) videoElement.pause();
        isPlaying = false;
      }
    });
  }
  
})();

# Hero Video Placeholder

Currently, the hero section uses a static poster image because no video file has been uploaded yet.

## To Add Hero Video:

1. Upload a short video (10-20 seconds) of the venue via the Staff Dashboard
2. Video should show the pool tables, bar, or lounge area
3. Recommended specs:
   - Duration: 10-20 seconds
   - Format: MP4 (H.264) and WebM
   - Resolution: 1920x1080 (Full HD)
   - File size: Under 4MB (compressed)
   - No audio needed (will be muted)
   - Good lighting, steady camera

## Current Behavior:

- ✅ Poster image displays from owner's photos
- ✅ Slow zoom animation on poster
- ✅ Dark overlay for text readability
- ✅ Respects prefers-reduced-motion
- ✅ Connection-aware (won't load video on slow connections)
- ✅ Data Saver detection (shows poster only if enabled)

## When Video is Added:

The system will automatically:
- Display video on 4G+ connections
- Show poster on slower connections
- Show poster if Data Saver is on
- Show poster if user prefers reduced motion
- Provide play/pause control for accessibility

Until then, the beautiful poster image provides an excellent first impression!

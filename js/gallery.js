// ========================================
// Gallery & Lightbox JavaScript
// ========================================

'use strict';

// ========================================
// Gallery Items and Lightbox Setup
// ========================================
const galleryItems = document.querySelectorAll('.gallery-item:not(.placeholder)');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentImageIndex = 0;
const images = [];

// Collect all gallery images
galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img) {
        images.push({
            src: img.src,
            alt: img.alt
        });

        // Click handler for gallery item
        item.addEventListener('click', () => {
            openLightbox(index);
        });

        // Keyboard accessibility
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `View ${img.alt} in lightbox`);

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    }
});

// ========================================
// Lightbox Functions
// ========================================
function openLightbox(index) {
    if (images.length === 0) return;

    currentImageIndex = index;
    lightbox.classList.add('active');
    updateLightboxImage();
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Announce to screen readers
    announceToScreenReader(`Viewing image ${currentImageIndex + 1} of ${images.length}`);
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling

    // Return focus to the gallery item that was clicked
    const currentItem = galleryItems[currentImageIndex];
    if (currentItem) {
        currentItem.focus();
    }
}

function updateLightboxImage() {
    if (images.length === 0) return;

    const currentImage = images[currentImageIndex];
    lightboxImage.src = currentImage.src;
    lightboxImage.alt = currentImage.alt;

    // Update button states
    updateNavigationButtons();

    // Preload adjacent images for smooth navigation
    preloadAdjacentImages();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateLightboxImage();
    announceToScreenReader(`Image ${currentImageIndex + 1} of ${images.length}`);
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateLightboxImage();
    announceToScreenReader(`Image ${currentImageIndex + 1} of ${images.length}`);
}

function updateNavigationButtons() {
    // Disable prev/next buttons if there's only one image
    if (images.length <= 1) {
        lightboxPrev.style.display = 'none';
        lightboxNext.style.display = 'none';
    } else {
        lightboxPrev.style.display = 'block';
        lightboxNext.style.display = 'block';
    }
}

function preloadAdjacentImages() {
    if (images.length <= 1) return;

    // Preload next image
    const nextIndex = (currentImageIndex + 1) % images.length;
    const nextImg = new Image();
    nextImg.src = images[nextIndex].src;

    // Preload previous image
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    const prevImg = new Image();
    prevImg.src = images[prevIndex].src;
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
        if (announcement.parentNode) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

// ========================================
// Event Listeners
// ========================================

// Close button
if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// Navigation buttons
if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
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
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next image
            nextImage();
        } else {
            // Swipe right - previous image
            prevImage();
        }
    }
}

// ========================================
// Gallery Grid Animation on Scroll
// ========================================
const galleryObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                entry.target.style.opacity = '1';
            }, index * 100);
            galleryObserver.unobserve(entry.target);
        }
    });
}, galleryObserverOptions);

// Observe all gallery items
document.querySelectorAll('.gallery-item').forEach(item => {
    item.style.opacity = '0';
    galleryObserver.observe(item);
});

// ========================================
// Image Loading States
// ========================================
if (lightboxImage) {
    lightboxImage.addEventListener('load', () => {
        lightboxImage.style.opacity = '1';
    });

    lightboxImage.addEventListener('error', () => {
        console.error('Failed to load image:', lightboxImage.src);
        lightboxImage.alt = 'Image failed to load';
    });
}

// ========================================
// Gallery Hover Effects
// ========================================
galleryItems.forEach(item => {
    const overlay = item.querySelector('.gallery-overlay');

    if (overlay) {
        item.addEventListener('mouseenter', () => {
            overlay.style.transition = 'opacity 0.3s ease';
        });
    }
});

// ========================================
// Lazy Load Gallery Images
// ========================================
if ('IntersectionObserver' in window) {
    const lazyGalleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    lazyGalleryObserver.unobserve(entry.target);
                }
            }
        });
    });

    galleryItems.forEach(item => {
        lazyGalleryObserver.observe(item);
    });
}

// ========================================
// Gallery Filter (Optional Enhancement)
// ========================================
const createGalleryFilter = () => {
    // This can be extended if you want to add category filters
    // For example: Interior, Exterior, Food, Drinks, etc.
    console.log('Gallery initialized with', images.length, 'images');
};

// ========================================
// Initialize Gallery
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    createGalleryFilter();
    console.log('🖼️ Gallery initialized with', images.length, 'images');
});

// ========================================
// Export for testing (if needed)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openLightbox,
        closeLightbox,
        nextImage,
        prevImage
    };
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(30, 41, 59, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(30, 41, 59, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and other elements
    const animatedElements = document.querySelectorAll('.feature-card, .stat-item, .tech-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Download button click tracking
    const downloadBtn = document.querySelector('a[href="InvestPro.apk"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            // You can add analytics tracking here
            console.log('Download button clicked');
            
            // Add loading state
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Downloading...';
            this.classList.add('disabled');
            
            // Simulate download delay for better UX
            setTimeout(() => {
                this.classList.remove('loading');
                this.innerHTML = '<i class="fas fa-download me-2"></i>Download APK';
                this.classList.remove('disabled');
                
                // Show success message
                showNotification('Download started!', 'success');
            }, 2000);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Mobile menu close on link click
    const mobileMenuLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // Counter animation for stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // Trigger counter animation when stats section is visible
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-item h3');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.textContent);
                    if (!isNaN(target)) {
                        animateCounter(stat, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        statsObserver.observe(aboutSection);
    }

    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Check if image is already loaded
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
            
            img.addEventListener('error', function() {
                console.error('Failed to load image:', this.src);
                this.style.opacity = '1'; // Show anyway to avoid blank space
            });
        }
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });

    // Form validation for any forms (if added later)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Add your form validation logic here
            console.log('Form submitted');
        });
    });

    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('.btn, .feature-card, .tech-item');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Mobile-specific optimizations
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Optimize touch interactions
    if (isMobile()) {
        // Add touch feedback to interactive elements
        const touchElements = document.querySelectorAll('.btn, .feature-card, .tech-item');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });

        // Optimize scroll performance
        let ticking = false;
        function updateOnScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Update scroll-based animations here
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', updateOnScroll, { passive: true });
    }

    // Review Slider Functionality
    const reviewCards = document.querySelectorAll('.review-card');
    const sliderDots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;

    function showSlide(index) {
        // Hide all slides
        reviewCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Remove active class from all dots
        sliderDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current slide
        if (reviewCards[index]) {
            reviewCards[index].classList.add('active');
        }
        
        // Activate current dot
        if (sliderDots[index]) {
            sliderDots[index].classList.add('active');
        }
        
        currentSlide = index;
    }

    // Add click events to dots
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Auto-slide functionality
    function autoSlide() {
        const nextSlide = (currentSlide + 1) % reviewCards.length;
        showSlide(nextSlide);
    }

    // Start auto-slide every 5 seconds
    let slideInterval = setInterval(autoSlide, 5000);

    // Pause auto-slide on hover
    const reviewsSlider = document.querySelector('.reviews-slider');
    if (reviewsSlider) {
        reviewsSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        reviewsSlider.addEventListener('mouseleave', () => {
            slideInterval = setInterval(autoSlide, 5000);
        });
    }

    // Touch/swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                const nextSlide = (currentSlide + 1) % reviewCards.length;
                showSlide(nextSlide);
            } else {
                // Swipe right - previous slide
                const prevSlide = currentSlide === 0 ? reviewCards.length - 1 : currentSlide - 1;
                showSlide(prevSlide);
            }
        }
    }

    if (reviewsSlider) {
        reviewsSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        reviewsSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    // Prevent zoom on double tap (iOS)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Ensure app screenshot is always visible
    const appScreenshot = document.querySelector('.app-screenshot');
    if (appScreenshot) {
        // Force show the app screenshot
        setTimeout(() => {
            appScreenshot.style.opacity = '1';
        }, 100);
        
        // Also show it immediately if it's already loaded
        if (appScreenshot.complete) {
            appScreenshot.style.opacity = '1';
        }
    }

    // Console welcome message
    console.log('%c🚀 Welcome to InvestPro!', 'color: #2563eb; font-size: 20px; font-weight: bold;');
    console.log('%cProfessional Investment Platform', 'color: #64748b; font-size: 14px;');
    console.log('%cMobile Optimized', 'color: #10b981; font-size: 12px;');
});

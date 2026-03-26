document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header ---
    const header = document.querySelector('.header');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const header = document.querySelector('.header');
        header.classList.toggle('menu-open', nav.classList.contains('active'));
        
        // Toggle hamburger animation (optional, but good UX)
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'translateY(8px) rotate(45deg)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
            spans.forEach(span => {
                span.style.transform = 'none';
                span.style.opacity = '1';
            });
        }
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                mobileMenuBtn.click();
            }
        });
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80; // Height of the sticky header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Scroll Animations (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.fade-in-up');

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    });

    animatedElements.forEach(el => animationObserver.observe(el));

    // --- Animated Number Counter ---
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const stepTime = Math.abs(Math.floor(duration / target));

            // To ensure smooth animation for large numbers, use requestAnimationFrame
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);

                // Ease out cubic function for smoother ending
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = Math.floor(easeProgress * target);

                counter.innerText = currentVal.toLocaleString();

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    counter.innerText = target.toLocaleString() + '+';
                }
            };
            window.requestAnimationFrame(step);
        });
    };

    const impactSection = document.querySelector('.impact');
    if (impactSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateCounters();
            }
        }, { threshold: 0.5 });

        counterObserver.observe(impactSection);
    }

    // --- Set Current Year in Footer ---
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Sponsorship Estimator Logic ---
    const estType = document.getElementById('est-type');
    const estCount = document.getElementById('est-count');
    const estTotal = document.getElementById('est-total');

    function calculateEstimate() {
        if (!estType || !estCount || !estTotal) return;
        
        // Fetch pricing from localStorage (set by Admin) or use defaults
        const pricing = JSON.parse(localStorage.getItem('admin_pricing')) || {
            education: 1500,  // Base cost per student in INR
            health: 800,      // Base cost per patient
            livelihood: 5000  // Base cost per trainee
        };
        
        const type = estType.value;
        const count = parseInt(estCount.value) || 0;
        const total = (pricing[type] || 0) * count;
        
        estTotal.innerText = '₹' + total.toLocaleString('en-IN');
    }

    if (estType && estCount) {
        estType.addEventListener('change', calculateEstimate);
        estCount.addEventListener('input', calculateEstimate);
        calculateEstimate(); // Initial calc
    }

    // --- Form Handling & LocalStorage Saving (For Admin Panel) ---
    const contactForm = document.getElementById('contactForm');
    const subjectSelect = document.getElementById('subject');
    const datePickerGroup = document.getElementById('datePickerGroup');

    if (subjectSelect && datePickerGroup) {
        subjectSelect.addEventListener('change', (e) => {
            if (e.target.value === 'appointment') {
                datePickerGroup.style.display = 'block';
                document.getElementById('appointmentDate').required = true;
            } else {
                datePickerGroup.style.display = 'none';
                document.getElementById('appointmentDate').required = false;
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Gather Data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const type = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const date = type === 'appointment' ? document.getElementById('appointmentDate').value : null;

            const submission = {
                id: Date.now(),
                name,
                email,
                type,
                message,
                date,
                timestamp: new Date().toISOString(),
                isImportant: false,
                isRead: false
            };

            // Save to LocalStorage
            let adminMessages = JSON.parse(localStorage.getItem('admin_messages')) || [];
            // Prepend new message
            adminMessages.unshift(submission);
            localStorage.setItem('admin_messages', JSON.stringify(adminMessages));

            // Simple success visual feedback
            btn.innerText = 'Sent Successfully! ✓';
            btn.style.backgroundColor = 'var(--clr-success)';
            btn.style.color = 'white';

            setTimeout(() => {
                contactForm.reset();
                if(datePickerGroup) datePickerGroup.style.display = 'none';
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 3000);
        });
    }

    // Generic handler for other forms (like newsletter)
    const forms = document.querySelectorAll('form:not(#contactForm)');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            if(!btn) return;
            const originalText = btn.innerText;
            btn.innerText = 'Subscribed! ✓';
            btn.style.backgroundColor = 'var(--clr-success)';
            btn.style.color = 'white';
            setTimeout(() => {
                form.reset();
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 3000);
        });
    });


    // --- Localization (i18n) ---
    const langBtns = document.querySelectorAll('.lang-btn');
    let currentLang = 'en';

    const updateContent = (lang) => {
        // Update regular text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = currentLang === 'en' ? 'ml' : 'en';

            // Update button text for all instances (mobile and desktop)
            const btnText = currentLang === 'en' ? 'മലയാളം' : 'English';
            langBtns.forEach(b => b.textContent = btnText);

            // Update page content
            updateContent(currentLang);
        });
    });

    // --- Gallery Lightbox & Carousel ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    let currentLightboxIndex = 0;

    // Will be populated by the fetch below
    let allGalleryImages = [];

    const updateLightboxImage = () => {
        if (allGalleryImages.length > 0) {
            lightboxImg.src = `assets/gallery-images/${allGalleryImages[currentLightboxIndex]}`;
        }
    };

    const showNextImage = (e) => {
        if (e) e.stopPropagation(); // prevent closing lightbox
        currentLightboxIndex = (currentLightboxIndex + 1) % allGalleryImages.length;
        updateLightboxImage();
    };

    const showPrevImage = (e) => {
        if (e) e.stopPropagation();
        currentLightboxIndex = (currentLightboxIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
        updateLightboxImage();
    };

    // Open Lightbox
    const openLightbox = (index) => {
        currentLightboxIndex = index;
        updateLightboxImage();
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling in background
    };

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('show');
        setTimeout(() => { lightboxImg.src = ''; }, 400); // Clear after fade out
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
    if (nextBtn) nextBtn.addEventListener('click', showNextImage);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('show')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    // --- Static Gallery (Bento Box Edition) ---
    const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    let currentGalleryVisible = 8;

    // Helper to apply visibility
    const updateGalleryVisibility = () => {
        galleryItems.forEach((item, index) => {
            if (index < currentGalleryVisible) {
                item.style.display = ''; // Restore default display for grid participation
                // Give it a tiny delay for animation if newly revealed
                if (!item.classList.contains('visible')) {
                    setTimeout(() => item.classList.add('visible'), 50);
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        if (loadMoreBtn) {
            if (currentGalleryVisible >= galleryItems.length) {
                loadMoreBtn.classList.add('d-none');
            } else {
                loadMoreBtn.classList.remove('d-none');
            }
        }
    };

    // Build the allGalleryImages array from the DOM elements
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('.gallery-img');
        if (img) {
            // Extract the filename from the src path
            const filename = img.getAttribute('src').split('/').pop();
            allGalleryImages.push(filename);
        }
        
        // Attach lightbox click to open at the correct index
        item.addEventListener('click', () => openLightbox(index));
    });

    // Handle "Load More" click
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentGalleryVisible += 8;
            updateGalleryVisibility();
        });
    }

    // Initial visibility state
    updateGalleryVisibility();

});

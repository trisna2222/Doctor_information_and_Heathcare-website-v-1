document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.hero-nav-btn.prev');
    const nextBtn = document.querySelector('.hero-nav-btn.next');
    let currentSlide = 0;
    const slideInterval = 6000; // 6 seconds per slide
    let autoSlideTimer;

    // Initial setup
    function initSlider() {
        if (slides.length > 0) {
            slides[0].classList.add('active');
            startAutoSlide();
        }
    }

    function showSlide(index) {
        // Handle wrapping
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Remove active class from all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Add active class to current slide
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        resetAutoSlide();
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
        resetAutoSlide();
    }

    function startAutoSlide() {
        autoSlideTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, slideInterval);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }

    // Event Listeners
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
    }

    // Initialize
    initSlider();

    // Video Modal Logic
    const videoModal = document.getElementById('video-modal');
    const videoPlayBtn = document.querySelector('.video-play-btn');
    const videoCloseBtn = document.querySelector('.video-modal-close');
    const videoFrame = document.getElementById('video-frame');
    const videoSrc = "https://www.youtube.com/embed/TziWnfLYXUs?si=7c7DwjKkZzN9Ejei&autoplay=1";

    if (videoPlayBtn && videoModal) {
        videoPlayBtn.addEventListener('click', function (e) {
            e.preventDefault();
            videoModal.classList.add('show');
            videoFrame.src = videoSrc;
        });
    }

    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('show');
            videoFrame.src = ""; // Stop video
        }
    }

    if (videoCloseBtn) {
        videoCloseBtn.addEventListener('click', closeVideoModal);
    }

    if (videoModal) {
        videoModal.addEventListener('click', function (e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }

    /* --- Testimonial Carousel Logic --- */
    const testimonialTrack = document.querySelector('.testimonial-track');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.querySelectorAll('.testi-dot');

    if (testimonialTrack && testimonialCards.length > 0) {
        let testiIndex = 0;
        const testiIntervalTime = 5000;
        let testiAutoSlide;

        function updateTestimonialSlide() {
            // Get the width of a single card dynamically to handle responsive resizing
            const cardWidth = testimonialCards[0].offsetWidth;

            // Move the track
            testimonialTrack.style.transform = `translateX(-${testiIndex * cardWidth}px)`;

            // Update active dot
            testimonialDots.forEach(dot => dot.classList.remove('active'));
            if (testimonialDots[testiIndex]) {
                testimonialDots[testiIndex].classList.add('active');
            }
        }

        function nextTestimonial() {
            testiIndex++;
            // Basic looping logic
            if (testiIndex >= testimonialCards.length) {
                testiIndex = 0;
            }
            updateTestimonialSlide();
        }

        // Event Listeners for Dots
        testimonialDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    testiIndex = index;
                    updateTestimonialSlide();
                    resetTestiAutoSlide();
                }
            });
        });

        // Auto Slide
        function startTestiAutoSlide() {
            testiAutoSlide = setInterval(nextTestimonial, testiIntervalTime);
        }

        function resetTestiAutoSlide() {
            clearInterval(testiAutoSlide);
            startTestiAutoSlide();
        }

        // Handle Window Resize (re-calculate width)
        window.addEventListener('resize', updateTestimonialSlide);

        // Initialize
        updateTestimonialSlide(); // Set initial state
        startTestiAutoSlide();
    }

});


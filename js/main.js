// JavaScript for MovieVerse Homepage

// Slider for Trending Movies
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.movies-slider');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3; // Scroll speed
            slider.scrollLeft = scrollLeft - walk;
        });

        // Auto-scroll functionality
        let autoScrollInterval = setInterval(() => {
            slider.scrollLeft += 1; // Slow auto-scroll
            if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
                slider.scrollLeft = 0; // Reset to start
            }
        }, 50);

        // Pause auto-scroll on hover
        slider.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });

        slider.addEventListener('mouseleave', () => {
            autoScrollInterval = setInterval(() => {
                slider.scrollLeft += 1;
                if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
                    slider.scrollLeft = 0;
                }
            }, 50);
        });
    }

    // Basic animations for cards
    const cards = document.querySelectorAll('.movie-card, .review-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });

    console.log('MovieVerse homepage loaded with slider and animations.');
});

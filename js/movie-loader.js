// Movie Loader Script for CardCraft Movies
// This script dynamically loads movie cards from the /movies/ folder

document.addEventListener('DOMContentLoaded', function() {
    const movieGrid = document.getElementById('movie-grid');
    const loading = document.getElementById('loading');

    if (!movieGrid) return; // Only run on pages with movie grid

    // Show loading animation
    if (loading) loading.style.display = 'block';

    // Simulate fetching movie files (in a real deployment, this would be server-side or use a file list API)
    // For static hosting, we'll use a predefined list or fetch from a JSON file
    const movies = [
        { name: 'inception', title: 'Inception', year: '2010' },
        // Add more movies here as they are added
    ];

    // Function to create movie card
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <div class="poster" style="background-image: url('movies/posters/${movie.name}.jpg');"></div>
            <div class="watermark">CardCraft</div>
            <div class="content">
                <h3>${movie.title} (${movie.year})</h3>
                <a href="movies/${movie.name}.html" class="btn">View Details</a>
            </div>
        `;
        return card;
    }

    // Load movies
    setTimeout(() => {
        if (loading) loading.style.display = 'none';

        if (movies.length === 0) {
            movieGrid.innerHTML = '<p>No movies added yet.</p>';
            return;
        }

        movies.forEach(movie => {
            const card = createMovieCard(movie);
            movieGrid.appendChild(card);
        });

        // Add fade-in animation
        const cards = movieGrid.querySelectorAll('.movie-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 1000); // Simulate loading time
});

// For dynamic loading in production, you would need server-side support or a static file list.
// This is a basic implementation for demonstration.

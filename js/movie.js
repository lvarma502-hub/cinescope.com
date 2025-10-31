// JavaScript for Movie Detail Page

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));

    if (!movieId) {
        document.getElementById('movie-details').innerHTML = '<p>Movie not found.</p>';
        return;
    }

    fetch('data/movies.json')
        .then(response => response.json())
        .then(movies => {
            const movie = movies.find(m => m.id === movieId);
            if (!movie) {
                document.getElementById('movie-details').innerHTML = '<p>Movie not found.</p>';
                return;
            }

            // Set meta tags
            document.getElementById('page-title').textContent = `${movie.title} - MovieVerse`;
            document.getElementById('meta-description').content = movie.synopsis;
            document.getElementById('meta-image').content = movie.poster;

            // Render movie details
            renderMovieDetails(movie);

            // Render cast
            renderCast(movie.cast);

            // Render trailer
            renderTrailer(movie.trailer);

            // Render related movies
            renderRelatedMovies(movies, movie);
        })
        .catch(error => console.error('Error loading movie:', error));
});

function renderMovieDetails(movie) {
    const detailsSection = document.getElementById('movie-details');
    detailsSection.innerHTML = `
        <div class="movie-poster-large">
            <img src="${movie.poster}" alt="${movie.title}">
        </div>
        <div class="movie-info-large">
            <h1 class="movie-title-large">${movie.title}</h1>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span>${movie.runtime}</span>
                <span>${movie.genre}</span>
                <span class="movie-rating-large">⭐ ${movie.rating}</span>
            </div>
            <p class="movie-synopsis">${movie.synopsis}</p>
        </div>
    `;
}

function renderCast(cast) {
    const castList = document.getElementById('cast-list');
    castList.innerHTML = cast.map(actor => `
        <div class="cast-member">
            <div class="cast-name">${actor.name}</div>
            <div class="cast-role">${actor.role}</div>
        </div>
    `).join('');
}

function renderTrailer(trailerId) {
    const trailerContainer = document.getElementById('trailer-container');
    trailerContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailerId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
    `;
}

function renderRelatedMovies(allMovies, currentMovie) {
    const relatedMovies = allMovies
        .filter(m => m.id !== currentMovie.id && m.genre === currentMovie.genre)
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 3); // Take 3

    const relatedGrid = document.getElementById('related-grid');
    relatedGrid.innerHTML = relatedMovies.map(movie => `
        <div class="related-card">
            <img src="${movie.poster}" alt="${movie.title}" class="related-poster">
            <div class="related-info">
                <h3 class="related-title">${movie.title}</h3>
                <p class="related-rating">⭐ ${movie.rating}</p>
                <a href="movie.html?id=${movie.id}" class="more-info-btn">More Info</a>
            </div>
        </div>
    `).join('');
}

console.log('Movie detail page loaded.');

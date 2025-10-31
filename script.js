// CineScope - AI Movie Info Website
// OMDb API Integration

const API_KEY = '39eab6dd';
const API_URL = 'https://www.omdbapi.com/';

// Sample trending movies IMDb IDs
const TRENDING_MOVIES = [
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0071562', // The Godfather: Part II
    'tt0468569', // The Dark Knight
    'tt0050083', // 12 Angry Men
    'tt0108052', // Schindler's List
    'tt0167260', // The Lord of the Rings: The Return of the King
    'tt0110912', // Pulp Fiction
    'tt0060196', // The Good, the Bad and the Ugly
    'tt0137523', // Fight Club
    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
    'tt0109830'  // Forrest Gump
];

// DOM Elements
const searchForm = document.getElementById('searchForm');
const movieResult = document.getElementById('movieResult');
const searchResults = document.getElementById('searchResults');
const loadingModal = document.getElementById('loadingModal');
const trendingMovies = document.getElementById('trendingMovies');
const movieDetails = document.getElementById('movieDetails');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineScope initialized');

    // Set up event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Load trending movies
    if (trendingMovies) {
        loadTrendingMovies();
    }

    // Check for movie ID in URL parameters (for movie details page)
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (movieId && movieDetails) {
        loadMovieDetails(movieId);
    }

    // Mobile navigation
    setupMobileNav();
});

// Handle movie search
async function handleSearch(e) {
    e.preventDefault();

    const movieName = document.getElementById('movieSearch').value.trim();

    if (!movieName) {
        showError('Please enter a movie name');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_URL}?t=${encodeURIComponent(movieName)}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovieResult(data);
            searchResults.style.display = 'block';
            searchResults.scrollIntoView({ behavior: 'smooth' });
        } else {
            showError('Movie not found. Please try another title.');
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

// Load trending movies
async function loadTrendingMovies() {
    const moviesData = [];

    for (const imdbId of TRENDING_MOVIES.slice(0, 12)) {
        try {
            const response = await fetch(`${API_URL}?i=${imdbId}&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.Response === 'True') {
                moviesData.push(data);
            }
        } catch (error) {
            console.error(`Error loading movie ${imdbId}:`, error);
        }
    }

    displayTrendingMovies(moviesData);
}

// Load movie details for movie.html page
async function loadMovieDetails(movieId) {
    showLoading();

    try {
        const response = await fetch(`${API_URL}?i=${movieId}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === 'True') {
            displayMovieDetails(data);
        } else {
            showError('Movie details not found.');
        }
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

// Display search result
function displayMovieResult(movie) {
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=No+Poster';
    const rating = movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
    const genre = movie.Genre !== 'N/A' ? movie.Genre : 'N/A';
    const plot = movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.';
    const year = movie.Year !== 'N/A' ? movie.Year : 'N/A';
    const director = movie.Director !== 'N/A' ? movie.Director : 'N/A';
    const actors = movie.Actors !== 'N/A' ? movie.Actors : 'N/A';
    const runtime = movie.Runtime !== 'N/A' ? movie.Runtime : 'N/A';
    const released = movie.Released !== 'N/A' ? movie.Released : 'N/A';

    movieResult.innerHTML = `
        <div class="movie-card">
            <div class="movie-poster" style="background-image: url('${poster}')"></div>
            <div class="movie-content">
                <h1 class="movie-title">${movie.Title}</h1>
                <div class="movie-meta">
                    <div class="movie-meta-item">
                        <strong>Year:</strong> ${year}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Runtime:</strong> ${runtime}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Released:</strong> ${released}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Genre:</strong> ${genre}
                    </div>
                </div>
                <div class="movie-rating">
                    ⭐ IMDb Rating: ${rating}
                </div>
                <p class="movie-plot">${plot}</p>
                <div class="movie-details-grid">
                    <div class="detail-item">
                        <h4>Director</h4>
                        <p>${director}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Cast</h4>
                        <p>${actors}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Genre</h4>
                        <p>${genre}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Runtime</h4>
                        <p>${runtime}</p>
                    </div>
                </div>
                <button onclick="viewFullDetails('${movie.imdbID}')" class="search-btn" style="margin-top: 20px;">
                    View Full Details
                </button>
            </div>
        </div>
    `;
}

// Display trending movies
function displayTrendingMovies(movies) {
    trendingMovies.innerHTML = movies.map(movie => {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/1a1a1a/ffffff?text=No+Poster';
        const rating = movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
        const year = movie.Year !== 'N/A' ? movie.Year : 'N/A';

        return `
            <div class="trending-card" onclick="viewFullDetails('${movie.imdbID}')">
                <div class="trending-poster" style="background-image: url('${poster}')"></div>
                <div class="trending-content">
                    <h3 class="trending-title">${movie.Title}</h3>
                    <div class="trending-meta">
                        <span>${year}</span>
                        <span class="trending-rating">⭐ ${rating}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display full movie details
function displayMovieDetails(movie) {
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/400x600/1a1a1a/ffffff?text=No+Poster';
    const rating = movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
    const genre = movie.Genre !== 'N/A' ? movie.Genre : 'N/A';
    const plot = movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.';
    const year = movie.Year !== 'N/A' ? movie.Year : 'N/A';
    const director = movie.Director !== 'N/A' ? movie.Director : 'N/A';
    const actors = movie.Actors !== 'N/A' ? movie.Actors : 'N/A';
    const runtime = movie.Runtime !== 'N/A' ? movie.Runtime : 'N/A';
    const released = movie.Released !== 'N/A' ? movie.Released : 'N/A';
    const writer = movie.Writer !== 'N/A' ? movie.Writer : 'N/A';
    const language = movie.Language !== 'N/A' ? movie.Language : 'N/A';
    const country = movie.Country !== 'N/A' ? movie.Country : 'N/A';
    const awards = movie.Awards !== 'N/A' ? movie.Awards : 'N/A';

    movieDetails.innerHTML = `
        <div class="movie-card">
            <div class="movie-poster" style="background-image: url('${poster}')"></div>
            <div class="movie-content">
                <h1 class="movie-title">${movie.Title}</h1>
                <div class="movie-meta">
                    <div class="movie-meta-item">
                        <strong>Year:</strong> ${year}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Runtime:</strong> ${runtime}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Released:</strong> ${released}
                    </div>
                    <div class="movie-meta-item">
                        <strong>Genre:</strong> ${genre}
                    </div>
                </div>
                <div class="movie-rating">
                    ⭐ IMDb Rating: ${rating}
                </div>
                <p class="movie-plot">${plot}</p>
                <div class="movie-details-grid">
                    <div class="detail-item">
                        <h4>Director</h4>
                        <p>${director}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Writer</h4>
                        <p>${writer}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Cast</h4>
                        <p>${actors}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Genre</h4>
                        <p>${genre}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Language</h4>
                        <p>${language}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Country</h4>
                        <p>${country}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Runtime</h4>
                        <p>${runtime}</p>
                    </div>
                    <div class="detail-item">
                        <h4>Awards</h4>
                        <p>${awards}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// View full movie details
function viewFullDetails(imdbId) {
    window.location.href = `movie.html?id=${imdbId}`;
}

// Show loading modal
function showLoading() {
    if (loadingModal) {
        loadingModal.style.display = 'flex';
    }
}

// Hide loading modal
function hideLoading() {
    if (loadingModal) {
        loadingModal.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    movieResult.innerHTML = `<div class="error">${message}</div>`;
    searchResults.style.display = 'block';
}

// Setup mobile navigation
function setupMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('mobile');
            hamburger.classList.toggle('active');
        });
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

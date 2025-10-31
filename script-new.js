// CineScope - AI Movie Info Website
// OMDb API Integration

const API_KEY = '39eab6dd';
const API_URL = 'https://www.omdbapi.com/';

// Pre-defined trending movies
const TRENDING_MOVIES = [
    'Inception',
    'Interstellar',
    'The Dark Knight',
    'Joker',
    'Avengers: Endgame',
    'Oppenheimer'
];

// DOM Elements
const searchForm = document.getElementById('searchForm');
const movieResult = document.getElementById('movieResult');
const searchResults = document.getElementById('searchResults');
const loadingModal = document.getElementById('loadingModal');
const trendingMovies = document.getElementById('trendingMovies');
const categoryMovies = document.getElementById('categoryMovies');
const suggestedMovies = document.getElementById('suggestedMovies');
const aiSuggested = document.getElementById('aiSuggested');
const movieDetails = document.getElementById('movieDetails');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('CineScope initialized');

    // Set up event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Set up category click handlers
    setupCategoryHandlers();

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

    // Load AI suggested movies if user has searched before
    loadAISuggestedMovies();

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

            // Store search genre for AI suggestions
            storeSearchGenre(data.Genre);
            loadAISuggestedMovies();
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

    for (const movieTitle of TRENDING_MOVIES) {
        try {
            const response = await fetch(`${API_URL}?t=${encodeURIComponent(movieTitle)}&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.Response === 'True') {
                moviesData.push(data);
            }
        } catch (error) {
            console.error(`Error loading movie ${movieTitle}:`, error);
        }
    }

    displayTrendingMovies(moviesData);
}

// Load movies by category
async function loadMoviesByCategory(genre) {
    showLoading();

    try {
        // Search for movies in the genre (using a broad search term)
        const searchTerm = getSearchTermForGenre(genre);
        const response = await fetch(`${API_URL}?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === 'True' && data.Search) {
            // Get detailed info for first 6 movies
            const moviesData = [];
            const moviesToLoad = data.Search.slice(0, 6);

            for (const movie of moviesToLoad) {
                try {
                    const detailResponse = await fetch(`${API_URL}?i=${movie.imdbID}&apikey=${API_KEY}`);
                    const detailData = await detailResponse.json();

                    if (detailData.Response === 'True') {
                        moviesData.push(detailData);
                    }
                } catch (error) {
                    console.error(`Error loading movie details for ${movie.Title}:`, error);
                }
            }

            displayCategoryMovies(moviesData, genre);
        } else {
            showError(`No ${genre} movies found.`);
        }
    } catch (error) {
        console.error('Category search error:', error);
        showError('Network error. Please try again.');
    } finally {
        hideLoading();
    }
}

// Get search term for genre
function getSearchTermForGenre(genre) {
    const genreMap = {
        'Action': 'action hero',
        'Comedy': 'comedy',
        'Drama': 'drama',
        'Sci-Fi': 'sci-fi',
        'Horror': 'horror',
        'Romance': 'romance'
    };
    return genreMap[genre] || genre.toLowerCase();
}

// Load AI suggested movies
function loadAISuggestedMovies() {
    const storedGenres = getStoredGenres();

    if (storedGenres.length > 0) {
        aiSuggested.style.display = 'block';
        loadSuggestedMovies(storedGenres);
    } else {
        aiSuggested.style.display = 'none';
    }
}

// Load suggested movies based on stored genres
async function loadSuggestedMovies(genres) {
    const moviesData = [];
    const loadedTitles = new Set();

    for (const genre of genres.slice(0, 2)) { // Use first 2 genres
        try {
            const searchTerm = getSearchTermForGenre(genre);
            const response = await fetch(`${API_URL}?s=${encodeURIComponent(searchTerm)}&type=movie&apikey=${API_KEY}`);
            const data = await response.json();

            if (data.Response === 'True' && data.Search) {
                // Get 2-3 movies per genre, avoiding duplicates
                const moviesToLoad = data.Search
                    .filter(movie => !loadedTitles.has(movie.Title))
                    .slice(0, 3);

                for (const movie of moviesToLoad) {
                    if (loadedTitles.size >= 4) break; // Limit to 4 total

                    try {
                        const detailResponse = await fetch(`${API_URL}?i=${movie.imdbID}&apikey=${API_KEY}`);
                        const detailData = await detailResponse.json();

                        if (detailData.Response === 'True') {
                            moviesData.push(detailData);
                            loadedTitles.add(detailData.Title);
                        }
                    } catch (error) {
                        console.error(`Error loading suggested movie ${movie.Title}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading suggested movies for genre ${genre}:`, error);
        }
    }

    displaySuggestedMovies(moviesData);
}

// Store search genre in localStorage
function storeSearchGenre(genreString) {
    if (!genreString || genreString === 'N/A') return;

    const genres = genreString.split(', ').map(g => g.trim());
    let storedGenres = getStoredGenres();

    // Add new genres to the beginning
    genres.forEach(genre => {
        if (!storedGenres.includes(genre)) {
            storedGenres.unshift(genre);
        }
    });

    // Keep only last 3 genres
    storedGenres = storedGenres.slice(0, 3);

    localStorage.setItem('cinescope_genres', JSON.stringify(storedGenres));
}

// Get stored genres from localStorage
function getStoredGenres() {
    try {
        const stored = localStorage.getItem('cinescope_genres');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading stored genres:', error);
        return [];
    }
}

// Setup category click handlers
function setupCategoryHandlers() {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const genre = this.getAttribute('data-genre');
            loadMoviesByCategory(genre);
        });
    });
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

// Display category movies
function displayCategoryMovies(movies, genre) {
    categoryMovies.innerHTML = `
        <h3 style="text-align: center; color: #e50914; margin-bottom: 30px; font-size: 1.8rem;">
            ${genre} Movies
        </h3>
        ${movies.map(movie => {
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
        }).join('')}
    `;

    categoryMovies.style.display = 'grid';
    categoryMovies.scrollIntoView({ behavior: 'smooth' });
}

// Display suggested movies
function displaySuggestedMovies(movies) {
    suggestedMovies.innerHTML = movies.map(movie => {
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

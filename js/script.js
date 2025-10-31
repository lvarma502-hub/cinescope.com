// AI Movie Auto Generator Script

// Note: Get your free API key from http://www.omdbapi.com/apikey.aspx
const API_KEY = '39eab6dd'; // Replace with your own API key if this one doesn't work
const API_URL = 'https://www.omdbapi.com/';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded successfully');
    const searchForm = document.getElementById('searchForm');
    const movieResult = document.getElementById('movieResult');

    if (!searchForm) {
        console.error('Search form not found');
        return;
    }

    console.log('Search form found, adding event listener');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        const movieName = document.getElementById('movieSearch').value.trim();
        console.log('Movie name:', movieName);
        if (movieName) {
            searchMovie(movieName);
        } else {
            displayError('Please enter a movie name');
        }
    });

    function searchMovie(movieName) {
        // Show loading animation
        movieResult.style.display = 'block';
        movieResult.innerHTML = '<div class="loading"></div>';

        fetch(`${API_URL}?t=${encodeURIComponent(movieName)}&apikey=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    displayMovie(data);
                } else {
                    displayError('Movie not found. Please try another title.');
                }
            })
            .catch(error => {
                console.error('Error fetching movie data:', error);
                displayError('An error occurred while fetching movie data. Please try again.');
            });
    }

    function displayMovie(movie) {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/000000/ffffff?text=No+Poster';
        const rating = movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
        const genre = movie.Genre !== 'N/A' ? movie.Genre : 'N/A';
        const plot = movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.';
        const year = movie.Year !== 'N/A' ? movie.Year : 'N/A';
        const director = movie.Director !== 'N/A' ? movie.Director : 'N/A';
        const actors = movie.Actors !== 'N/A' ? movie.Actors : 'N/A';

        movieResult.innerHTML = `
            <div class="movie-card" style="max-width: 600px; margin: 0 auto;">
                <div class="poster" style="background-image: url('${poster}'); height: 450px;"></div>
                <div class="watermark">AI Generated</div>
                <div class="content">
                    <h3>${movie.Title}</h3>
                    <div class="rating">IMDb: ${rating}</div>
                    <p><strong>Year:</strong> ${year}</p>
                    <p><strong>Genre:</strong> ${genre}</p>
                    <p><strong>Director:</strong> ${director}</p>
                    <p><strong>Actors:</strong> ${actors}</p>
                    <p><strong>Plot:</strong> ${plot}</p>
                </div>
            </div>
        `;
    }

    function displayError(message) {
        movieResult.innerHTML = `<div class="error">${message}</div>`;
    }
});

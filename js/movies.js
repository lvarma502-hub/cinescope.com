// JavaScript for Movies Page

document.addEventListener('DOMContentLoaded', function() {
    let movies = [];
    let filteredMovies = [];

    // Fetch movies data
    fetch('data/movies.json')
        .then(response => response.json())
        .then(data => {
            movies = data;
            filteredMovies = [...movies];
            renderMovies(filteredMovies);
        })
        .catch(error => console.error('Error loading movies:', error));

    // Render movies
    function renderMovies(movieList) {
        const container = document.getElementById('movies-container');
        container.innerHTML = '';
        movieList.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.year}</p>
                    <p class="movie-rating">⭐ ${movie.rating}</p>
                    <a href="movie.html?id=${movie.id}" class="more-info-btn">More Info</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Search functionality
    const searchBar = document.getElementById('search-bar');
    searchBar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        filteredMovies = movies.filter(movie =>
            movie.title.toLowerCase().includes(query)
        );
        applyFilters();
    });

    // Filter functionality
    const filterChips = document.querySelectorAll('.chip');
    let activeGenre = 'all';
    let activeYear = 'all';

    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            if (filter.startsWith('genre-')) {
                activeGenre = filter.split('-')[1];
                // Remove active from other genre chips
                document.querySelectorAll('.chip[data-filter^="genre-"]').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            } else if (filter.startsWith('year-')) {
                activeYear = filter.split('-')[1];
                // Remove active from other year chips
                document.querySelectorAll('.chip[data-filter^="year-"]').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            } else if (filter === 'all') {
                activeGenre = 'all';
                activeYear = 'all';
                // Remove active from all chips except 'all'
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            }
            applyFilters();
        });
    });

    function applyFilters() {
        let filtered = [...movies];

        // Apply search
        const query = searchBar.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(movie =>
                movie.title.toLowerCase().includes(query)
            );
        }

        // Apply genre filter
        if (activeGenre !== 'all') {
            filtered = filtered.filter(movie => movie.genre === activeGenre);
        }

        // Apply year filter
        if (activeYear !== 'all') {
            const decade = activeYear;
            let startYear, endYear;
            if (decade === '1990s') {
                startYear = 1990;
                endYear = 1999;
            } else if (decade === '2000s') {
                startYear = 2000;
                endYear = 2009;
            } else if (decade === '2010s') {
                startYear = 2010;
                endYear = 2019;
            }
            filtered = filtered.filter(movie => movie.year >= startYear && movie.year <= endYear);
        }

        filteredMovies = filtered;
        renderMovies(filteredMovies);
    }

    console.log('Movies page loaded.');
});

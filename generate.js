// Movie Generator Script for CardCraft Movies
// This script helps generate new movie pages, update the movie list, and auto-download posters

const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to download poster
function downloadPoster(posterUrl, fileName) {
    return new Promise((resolve, reject) => {
        const posterPath = path.join('movies', 'posters', fileName);

        // Check if poster already exists
        if (fs.existsSync(posterPath)) {
            console.log(`Poster already exists: ${posterPath}`);
            resolve();
            return;
        }

        if (posterUrl === 'N/A') {
            console.log('No poster available for this movie');
            resolve();
            return;
        }

        console.log(`Downloading poster from ${posterUrl}...`);

        const file = fs.createWriteStream(posterPath);
        const request = https.get(posterUrl, (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`Poster downloaded: ${posterPath}`);
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(posterPath, () => {}); // Delete the file if error
            console.error(`Error downloading poster: ${err.message}`);
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(posterPath, () => {}); // Delete the file if error
            console.error(`Error writing poster: ${err.message}`);
            reject(err);
        });
    });
}

// Function to generate a new movie page
async function generateMoviePage(movieData) {
    try {
        // Download poster first
        await downloadPoster(movieData.poster, `${movieData.name}.jpg`);

        const template = fs.readFileSync('movie-template.html', 'utf8');

        let moviePage = template
            .replace(/<!-- EDIT: Movie Title --> Inception \(2010\)/g, `${movieData.title} (${movieData.year})`)
            .replace(/Inception \(2010\) - CardCraft Movies/g, `${movieData.title} (${movieData.year}) - CardCraft Movies`)
            .replace(/background-image: url\('https:\/\/via\.placeholder\.com\/1200x600\/000000\/ffffff\?text=Inception\+Poster'\);/g, `background-image: url('movies/posters/${movieData.name}.jpg');`)
            .replace(/Inception/g, movieData.title)
            .replace(/Your mind is the scene of the crime\./g, movieData.tagline || 'Discover the story.')
            .replace(/8\.8/g, movieData.rating)
            .replace(/Sci-Fi, Thriller/g, movieData.genre)
            .replace(/Christopher Nolan/g, movieData.director)
            .replace(/2h 28m/g, movieData.duration)
            .replace(/English/g, movieData.language)
            .replace(/July 16, 2010/g, movieData.releaseDate)
            .replace(/A skilled thief who steals secrets through the use of dream-sharing technology is given a chance at redemption if he can successfully perform inception — planting an idea into someone's subconscious\. The mission seems impossible, but Cobb and his team must navigate through layers of dreams to achieve their goal\./g, movieData.plot)
            .replace(/Leonardo DiCaprio as Dom Cobb/g, movieData.cast[0] || 'Actor 1')
            .replace(/Joseph Gordon-Levitt as Arthur/g, movieData.cast[1] || 'Actor 2')
            .replace(/Ellen Page as Ariadne/g, movieData.cast[2] || 'Actor 3')
            .replace(/Tom Hardy as Eames/g, movieData.cast[3] || 'Actor 4')
            .replace(/Marion Cotillard as Mal/g, movieData.cast[4] || 'Actor 5')
            .replace(/https:\/\/www\.youtube\.com\/embed\/YoHD9XEInc0/g, movieData.trailer || 'https://www.youtube.com/embed/dQw4w9WgXcQ');

        const fileName = `movies/${movieData.name}.html`;
        fs.writeFileSync(fileName, moviePage);
        console.log(`Generated ${fileName}`);
    } catch (error) {
        console.error(`Error generating movie page: ${error.message}`);
    }
}

// Function to update the movie loader script
function updateMovieLoader(movies) {
    const loaderScript = `
// Movie Loader Script for CardCraft Movies
// This script dynamically loads movie cards from the /movies/ folder

document.addEventListener('DOMContentLoaded', function() {
    const movieGrid = document.getElementById('movie-grid');
    const loading = document.getElementById('loading');

    if (!movieGrid) return; // Only run on pages with movie grid

    // Show loading animation
    if (loading) loading.style.display = 'block';

    // List of movies (update this list when adding new movies)
    const movies = ${JSON.stringify(movies, null, 4)};

    // Function to create movie card
    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = \`
            <div class="poster" style="background-image: url('movies/posters/\${movie.name}.jpg');"></div>
            <div class="watermark">CardCraft</div>
            <div class="content">
                <h3>\${movie.title} (\${movie.year})</h3>
                <div class="rating">IMDb: \${movie.rating}</div>
                <a href="movies/\${movie.name}.html" class="btn">View Details</a>
            </div>
        \`;
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
`;

    fs.writeFileSync('js/movie-loader.js', loaderScript);
    console.log('Updated js/movie-loader.js');
}

// Function to fetch movie data from OMDb API
async function fetchMovieData(movieName, apiKey) {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'False') {
        throw new Error(data.Error);
    }

    return {
        name: movieName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        title: data.Title,
        year: data.Year,
        genre: data.Genre,
        director: data.Director,
        plot: data.Plot,
        rating: data.imdbRating,
        poster: data.Poster,
        actors: data.Actors.split(', '),
        runtime: data.Runtime,
        language: data.Language,
        released: data.Released,
        tagline: 'Discover the story.', // Default tagline
        trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Default trailer
    };
}

// Function to generate movie from API
async function generateMovieFromAPI(movieName, apiKey) {
    try {
        console.log(`Fetching data for "${movieName}"...`);
        const movieData = await fetchMovieData(movieName, apiKey);

        console.log(`Generating page for "${movieData.title}"...`);
        await generateMoviePage(movieData);

        console.log(`Movie "${movieData.title}" generated successfully!`);
        return movieData;
    } catch (error) {
        console.error(`Error generating movie: ${error.message}`);
        throw error;
    }
}

// Example usage:
// (async () => {
//     const apiKey = 'YOUR_OMDB_API_KEY';
//     const movieData = await generateMovieFromAPI('Dune: Part Two', apiKey);
//     updateMovieLoader([movieData]); // Update the loader with new movie
// })();

console.log('Movie generator script ready. Uncomment the example usage to test.');

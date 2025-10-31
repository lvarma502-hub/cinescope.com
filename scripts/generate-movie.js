#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Environment variables
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const MOVIE_NAME = process.env.MOVIE_NAME;

if (!OMDB_API_KEY || !MOVIE_NAME) {
    console.error('Error: OMDB_API_KEY and MOVIE_NAME environment variables are required');
    process.exit(1);
}

// Function to create slug from movie name
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

// Function to download poster
function downloadPoster(posterUrl, filePath) {
    return new Promise((resolve, reject) => {
        if (posterUrl === 'N/A') {
            console.log('No poster available for this movie');
            resolve();
            return;
        }

        console.log(`Downloading poster from ${posterUrl}...`);

        const file = fs.createWriteStream(filePath);
        const request = https.get(posterUrl, (response) => {
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`Poster downloaded: ${filePath}`);
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(filePath, () => {}); // Delete the file if error
            reject(err);
        });

        file.on('error', (err) => {
            fs.unlink(filePath, () => {}); // Delete the file if error
            reject(err);
        });
    });
}

// Function to generate movie HTML
function generateMovieHTML(movieData, slug) {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${movieData.Title} (${movieData.Year}) - CardCraft Movies</title>
    <meta name="description" content="${movieData.Plot.substring(0, 150)}...">
    <meta property="og:title" content="${movieData.Title} (${movieData.Year}) - CardCraft Movies">
    <meta property="og:description" content="${movieData.Plot.substring(0, 150)}...">
    <meta property="og:image" content="https://your-domain.com/movies/posters/${slug}.jpg">
    <meta property="og:type" content="website">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #0d0d0d;
            color: #fff;
            line-height: 1.6;
        }
        nav {
            background-color: #1a1a1a;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f6c90e;
        }
        .nav-links a {
            color: #fff;
            text-decoration: none;
            margin-left: 2rem;
            transition: color 0.3s;
        }
        .nav-links a:hover { color: #f6c90e; }
        .hero {
            position: relative;
            height: 60vh;
            background-image: url('movies/posters/${slug}.jpg');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
        }
        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 800px;
            padding: 2rem;
        }
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #f6c90e;
        }
        .hero p {
            font-size: 1.2rem;
            color: #ccc;
        }
        .adsense {
            text-align: center;
            padding: 2rem;
            background-color: #1a1a1a;
            margin: 2rem 0;
            border: 2px dashed #333;
        }
        .movie-details {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .poster {
            position: relative;
            width: 100%;
            height: 450px;
            background-image: url('movies/posters/${slug}.jpg');
            background-size: cover;
            background-position: center;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .watermark {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(246, 201, 14, 0.8);
            color: #0d0d0d;
            padding: 5px 10px;
            border-radius: 5px;
            font-weight: 600;
            font-size: 0.8rem;
        }
        .details h2 {
            color: #f6c90e;
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .details p {
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        .highlight {
            color: #f6c90e;
            font-weight: 600;
        }
        .storyline {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .storyline h2 {
            color: #f6c90e;
            margin-bottom: 1rem;
        }
        .cast {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .cast h2 {
            color: #f6c90e;
            margin-bottom: 1rem;
        }
        .cast-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        .actor-card {
            background-color: #1a1a1a;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .actor-card .actor-img {
            width: 80px;
            height: 80px;
            background-color: #f6c90e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
            font-weight: 700;
            color: #0d0d0d;
        }
        .trailer {
            text-align: center;
            padding: 2rem;
        }
        .trailer h2 {
            color: #f6c90e;
            margin-bottom: 1rem;
        }
        .trailer iframe {
            width: 100%;
            max-width: 560px;
            height: 315px;
            border: none;
            border-radius: 10px;
        }
        footer {
            background-color: #1a1a1a;
            text-align: center;
            padding: 2rem;
            margin-top: 3rem;
        }
        footer p {
            margin-bottom: 1rem;
            color: #ccc;
        }
        footer a {
            color: #f6c90e;
            text-decoration: none;
            margin: 0 1rem;
        }
        footer a:hover {
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .movie-details {
                grid-template-columns: 1fr;
            }
            .hero h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav>
        <div class="logo">🎬 CardCraft Movies</div>
        <div class="nav-links">
            <a href="../index.html">Home</a>
            <a href="../movies.html">Movies</a>
            <a href="../about.html">About</a>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>${movieData.Title} (${movieData.Year})</h1>
            <p>Discover the story.</p>
        </div>
    </section>

    <!-- AdSense #1 -->
    <div class="adsense"><!-- Google AdSense Placeholder: 728x90 Banner Ad -->[728x90 Banner Ad Placeholder]</div>

    <!-- Movie Details -->
    <section class="movie-details">
        <div class="poster">
            <div class="watermark">CardCraft</div>
        </div>
        <div class="details">
            <h2>${movieData.Title}</h2>
            <p><span class="highlight">IMDb Rating:</span> ${movieData.imdbRating} ⭐</p>
            <p><span class="highlight">Genre:</span> ${movieData.Genre}</p>
            <p><span class="highlight">Director:</span> ${movieData.Director}</p>
            <p><span class="highlight">Duration:</span> ${movieData.Runtime}</p>
            <p><span class="highlight">Language:</span> ${movieData.Language}</p>
            <p><span class="highlight">Release Date:</span> ${movieData.Released}</p>
        </div>
    </section>

    <!-- Storyline -->
    <section class="storyline">
        <h2>📖 Storyline</h2>
        <p>${movieData.Plot}</p>
    </section>

    <!-- AdSense #2 -->
    <div class="adsense"><!-- Google AdSense Placeholder: 336x280 Rectangle Ad -->[336x280 Rectangle Ad Placeholder]</div>

    <!-- Cast -->
    <section class="cast">
        <h2>🎭 Cast</h2>
        <div class="cast-grid">
            ${movieData.Actors.split(', ').slice(0, 5).map(actor => `
                <div class="actor-card">
                    <div class="actor-img">${actor.split(' ')[0][0]}${actor.split(' ')[1] ? actor.split(' ')[1][0] : ''}</div>
                    <p>${actor}</p>
                </div>
            `).join('')}
        </div>
    </section>

    <!-- Trailer -->
    <section class="trailer">
        <h2>🎬 Watch Trailer</h2>
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
        <p style="margin-top: 1rem; color: #ccc; font-size: 0.9rem;">💡 Search YouTube for "${movieData.Title} ${movieData.Year} trailer" to find the official trailer</p>
    </section>

    <!-- AdSense #3 -->
    <div class="adsense"><!-- Google AdSense Placeholder: 728x90 Banner Ad -->[728x90 Banner Ad Placeholder]</div>

    <!-- Footer -->
    <footer>
        <p>&copy; 2025 CardCraft Movies</p>
        <a href="../index.html">Home</a> | <a href="../movies.html">Movies</a> | <a href="../contact.html">Contact</a>
    </footer>
</body>
</html>`;

    return template;
}

// Main function
async function main() {
    try {
        console.log(`Fetching movie data for: "${MOVIE_NAME}"`);

        // Fetch movie data from OMDb API
        const apiUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(MOVIE_NAME)}&apikey=${OMDB_API_KEY}`;
        const response = await fetch(apiUrl);
        const movieData = await response.json();

        if (movieData.Response === 'False') {
            console.error(`Error: Movie "${MOVIE_NAME}" not found`);
            process.exit(1);
        }

        console.log(`Found movie: ${movieData.Title} (${movieData.Year})`);

        // Create slug
        const slug = createSlug(movieData.Title);
        console.log(`Generated slug: ${slug}`);

        // Ensure posters directory exists
        const postersDir = path.join(__dirname, '..', 'movies', 'posters');
        if (!fs.existsSync(postersDir)) {
            fs.mkdirSync(postersDir, { recursive: true });
        }

        // Download poster
        const posterPath = path.join(postersDir, `${slug}.jpg`);
        await downloadPoster(movieData.Poster, posterPath);

        // Generate HTML
        const htmlContent = generateMovieHTML(movieData, slug);
        const htmlPath = path.join(__dirname, '..', 'movies', `${slug}.html`);
        fs.writeFileSync(htmlPath, htmlContent);

        console.log(`✅ Successfully generated movie page: movies/${slug}.html`);
        console.log(`Movie: ${movieData.Title} (${movieData.Year})`);

    } catch (error) {
        console.error(`Error generating movie: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
main();

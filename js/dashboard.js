// Dashboard Analytics for CardCraft Movies
// This script provides real-time analytics and data visualization

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();

    // Auto-refresh every 5 minutes
    setInterval(updateDashboard, 300000);
});

function initializeDashboard() {
    console.log('Initializing Movie Analytics Dashboard...');
    updateDashboard();
}

async function updateDashboard() {
    try {
        // Update last updated timestamp
        updateLastUpdated();

        // Load analytics data
        const analytics = await loadAnalyticsData();

        // Update stats cards
        updateStatsCards(analytics);

        // Update charts
        updateViewsChart(analytics.dailyViews);

        // Update lists
        updateMostViewedList(analytics.mostViewed);
        updateRecentMoviesList(analytics.recentMovies);

    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateLastUpdated() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('lastUpdated').textContent = timeString;
}

async function loadAnalyticsData() {
    // In a real implementation, this would fetch from a backend API
    // For now, we'll generate mock data

    const movies = await loadMoviesData();
    const totalMovies = movies.length;

    // Generate mock analytics data
    const analytics = {
        totalMovies: totalMovies,
        totalVisitors: Math.floor(Math.random() * 10000) + 5000,
        adsenseEarnings: (Math.random() * 100 + 50).toFixed(2),
        dailyViews: generateDailyViewsData(),
        mostViewed: generateMostViewedData(movies),
        recentMovies: generateRecentMoviesData(movies)
    };

    return analytics;
}

async function loadMoviesData() {
    try {
        // Try to load from movies.json if it exists
        const response = await fetch('data/movies.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Movies data not found, using mock data');
    }

    // Fallback mock data
    return [
        { name: 'inception', title: 'Inception', year: '2010', views: 1250 },
        { name: 'dune2', title: 'Dune: Part Two', year: '2024', views: 890 },
        { name: 'interstellar', title: 'Interstellar', year: '2014', views: 2100 },
        { name: 'blade', title: 'Blade Runner 2049', year: '2017', views: 1450 },
        { name: 'matrix', title: 'The Matrix', year: '1999', views: 3200 }
    ];
}

function generateDailyViewsData() {
    // Generate last 7 days of mock data
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 500) + 100
        });
    }
    return data;
}

function generateMostViewedData(movies) {
    // Sort movies by views and take top 5
    return movies
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(movie => ({
            title: movie.title,
            views: movie.views || Math.floor(Math.random() * 1000) + 100
        }));
}

function generateRecentMoviesData(movies) {
    // Sort by year (assuming newer = higher year) and take recent 5
    return movies
        .sort((a, b) => parseInt(b.year) - parseInt(a.year))
        .slice(0, 5)
        .map(movie => ({
            title: movie.title,
            dateAdded: `${movie.year}-01-01` // Mock date
        }));
}

function updateStatsCards(analytics) {
    document.getElementById('totalMovies').textContent = analytics.totalMovies;
    document.getElementById('totalVisitors').textContent = analytics.totalVisitors.toLocaleString();
    document.getElementById('adsenseEarnings').textContent = `$${analytics.adsenseEarnings}`;
    document.getElementById('dailyViews').textContent = analytics.dailyViews[6].views;
}

function updateViewsChart(dailyViews) {
    const ctx = document.getElementById('viewsChart').getContext('2d');

    // Simple canvas-based chart (in production, use Chart.js or similar)
    drawSimpleChart(ctx, dailyViews);
}

function drawSimpleChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set styles
    ctx.strokeStyle = '#f6c90e';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#f6c90e';

    // Find max value for scaling
    const maxViews = Math.max(...data.map(d => d.views));

    // Draw line chart
    ctx.beginPath();
    data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const y = height - ((point.views / maxViews) * (height - 40)) - 20;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillRect(x - 3, y - 3, 6, 6);
    });
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#ccc';
    ctx.font = '12px Poppins';
    data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * (width - 40) + 20;
        const date = new Date(point.date);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        ctx.fillText(day, x - 10, height - 5);
    });
}

function updateMostViewedList(mostViewed) {
    const list = document.getElementById('mostViewedList');
    list.innerHTML = '';

    mostViewed.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="movie-title">${movie.title}</span>
            <span class="views-count">${movie.views.toLocaleString()} views</span>
        `;
        list.appendChild(li);
    });
}

function updateRecentMoviesList(recentMovies) {
    const list = document.getElementById('recentMoviesList');
    list.innerHTML = '';

    recentMovies.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="movie-title">${movie.title}</span>
            <span class="date-added">${formatDate(movie.dateAdded)}</span>
        `;
        list.appendChild(li);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Mock data update simulation (for demo purposes)
function simulateDataUpdate() {
    // This would be replaced with real-time data updates
    console.log('Dashboard data updated');
}

// Export functions for potential use in other scripts
window.Dashboard = {
    updateDashboard,
    loadAnalyticsData
};

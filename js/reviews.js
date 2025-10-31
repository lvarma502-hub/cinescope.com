// JavaScript for Reviews Page

document.addEventListener('DOMContentLoaded', function() {
    fetch('data/reviews.json')
        .then(response => response.json())
        .then(reviews => {
            renderReviews(reviews);
        })
        .catch(error => console.error('Error loading reviews:', error));
});

function renderReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <h3 class="review-movie">${review.movie}</h3>
            <div class="review-meta">
                <span class="review-reviewer">By ${review.reviewer}</span>
                <span class="review-rating">⭐ ${review.rating}/10</span>
            </div>
            <p class="review-comment">${review.comment}</p>
        </div>
    `).join('');
}

console.log('Reviews page loaded.');

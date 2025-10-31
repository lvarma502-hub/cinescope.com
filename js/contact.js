// JavaScript for Contact Page

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Validate form
        if (validateForm()) {
            // Simulate form submission (in a real app, this would send data to server)
            console.log('Form submitted:', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            });

            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';

            // Reset form
            form.reset();
        }
    });

    function validateForm() {
        let isValid = true;

        // Validate name
        const name = document.getElementById('name').value.trim();
        if (name === '') {
            showError('name-error', 'Name is required.');
            isValid = false;
        } else if (name.length < 2) {
            showError('name-error', 'Name must be at least 2 characters.');
            isValid = false;
        }

        // Validate email
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            showError('email-error', 'Email is required.');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('email-error', 'Please enter a valid email address.');
            isValid = false;
        }

        // Validate message
        const message = document.getElementById('message').value.trim();
        if (message === '') {
            showError('message-error', 'Message is required.');
            isValid = false;
        } else if (message.length < 10) {
            showError('message-error', 'Message must be at least 10 characters.');
            isValid = false;
        }

        return isValid;
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    console.log('Contact page loaded.');
});

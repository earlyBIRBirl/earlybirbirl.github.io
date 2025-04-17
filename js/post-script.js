document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    const titleElement = document.getElementById('post-title');
    const dateElement = document.getElementById('post-date');
    const bodyElement = document.getElementById('post-body');
    const loadingElement = document.querySelector('.loading-placeholder');

    if (!titleElement || !dateElement || !bodyElement) {
        console.error("Required post elements not found on page.");
        if(loadingElement) loadingElement.textContent = 'Error loading page structure.';
        return;
    }

    // Apply theme based on localStorage immediately (basic version)
    // Note: This doesn't include a toggle on this page itself
    const LIGHT_THEME_CLASS = "light-mode";
    const THEME_STORAGE_KEY = "themePreference";
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === LIGHT_THEME_CLASS) {
         document.body.classList.add(LIGHT_THEME_CLASS);
    } else {
         document.body.classList.remove(LIGHT_THEME_CLASS);
    }


    if (postId) {
        fetchSinglePost(postId);
    } else {
        // Handle error: No ID provided
        titleElement.textContent = 'Error: Post ID not found in URL.';
        if(loadingElement) loadingElement.style.display = 'none';
        dateElement.textContent = '';
        bodyElement.textContent = 'Could not load post because the ID is missing from the URL.';
    }
});

function fetchSinglePost(id) {
    const titleElement = document.getElementById('post-title');
    const dateElement = document.getElementById('post-date');
    const bodyElement = document.getElementById('post-body');
    const loadingElement = document.querySelector('.loading-placeholder');

    // Adjust API URL based on your single-post endpoint structure
    const apiUrl = `https://api-kcqc.onrender.com/api/blog-posts/${id}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                 if (response.status === 404) {
                     throw new Error('Post not found');
                 }
                 throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
             // Assuming API returns { "post": { ... } } for single post
             const post = data.post;

             if (post) {
                if(loadingElement) loadingElement.style.display = 'none';

                // Populate the elements
                titleElement.textContent = post.title;
                document.title = post.title + " - earlyBIRBirl";
                try {
                    dateElement.textContent = new Date(post.date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                } catch (e) { dateElement.textContent = post.date || 'Date unknown'; }

                // Render content - WARNING: Use innerHTML only if you TRUST the source
                // or SANITIZE it first if it contains user-generated/complex HTML.
                // If it's just plain text from your DB:
                bodyElement.textContent = post.content;
                // If it's HTML you *know* is safe:
                // bodyElement.innerHTML = post.content;

            } else {
                 throw new Error('Post data received, but post object is missing.');
            }

        })
        .catch(error => {
            console.error("Error fetching single post:", error);
            if(loadingElement) loadingElement.style.display = 'none';
            titleElement.textContent = 'Error Loading Post';
            dateElement.textContent = '';
            bodyElement.textContent = `Could not load post: ${error.message}. Try going back to the list.`;
        });
}
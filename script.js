// ---------- Constants and Variables ----------
const discordBlock = document.getElementById("discord-copy");
const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");
const galleryImages = document.querySelectorAll('#gallery img[data-lightbox]');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const LIGHT_THEME_CLASS = 'light-mode';
const THEME_STORAGE_KEY = 'themePreference';
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const blogPostsContainer = document.getElementById('blog-posts-container');
const postsToLoadInitially = 3;
const postsToLoadOnScroll = 3;
let triggerElement = null;
let allBlogPosts = [];
let postsLoaded = 0;
let blogTabActive = false;

// ---------- Dynamically Created Elements ----------
// Lightbox Elements
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
const lightboxContent = document.createElement('div');
lightboxContent.id = 'lightbox-content';
const lightboxImg = document.createElement('img');
lightboxImg.id = 'lightbox-img';
const lightboxCaption = document.createElement('p');
lightboxCaption.id = 'lightbox-caption';
lightbox.setAttribute('aria-labelledby', 'lightbox-caption');
const lightboxClose = document.createElement('span');
lightboxClose.id = 'lightbox-close';
lightboxClose.innerHTML = '×';
lightboxClose.setAttribute('aria-label', 'Close lightbox');
lightboxClose.setAttribute('tabindex', '0');
lightboxContent.appendChild(lightboxImg);
lightboxContent.appendChild(lightboxCaption);
lightbox.appendChild(lightboxContent);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);

// ---------- Event Listeners ----------
// Copy Discord to clipboard
discordBlock.addEventListener("click", () => {
    navigator.clipboard.writeText("earlybirbirl")
        .then(() => {
            const toast = document.getElementById("copy-toast");
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: earlybirbirl', err);
            // Optionally show an error message to the user
            const toast = document.getElementById("copy-toast");
            toast.textContent = 'Failed to copy!';
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
                toast.textContent = 'Copied Discord: earlybirbirl';
            }, 2000);
        });
});

// Navigation tab functionality
tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        tabLinks.forEach((l) => l.classList.remove("active"));
        sections.forEach((s) => (s.style.display = "none"));
        link.classList.add("active");
        const sectionId = link.getAttribute("href").substring(1);
        document.getElementById(sectionId).style.display = "block";

        if (sectionId === 'blog') {
            blogTabActive = true;
            if (allBlogPosts.length === 0) {
                loadInitialBlogPosts();
            } else if (postsLoaded === 0 && allBlogPosts.length > 0) {
                displayBlogPosts(allBlogPosts.slice(0, postsToLoadInitially));
                postsLoaded = Math.min(postsToLoadInitially, allBlogPosts.length);
                window.addEventListener('scroll', debouncedHandleScroll);
            }
        } else {
            blogTabActive = false;
            window.removeEventListener('scroll', debouncedHandleScroll);
        }
    });
});

// Gallery image lightbox functionality
galleryImages.forEach((img) => {
    img.addEventListener('click', (e) => {
        triggerElement = e.target;
        const src = e.target.getAttribute('src');
        const alt = e.target.getAttribute('alt');
        const caption = e.target.getAttribute('data-caption');
        lightboxImg.setAttribute('src', src);
        lightboxImg.setAttribute('alt', alt);
        lightboxCaption.textContent = caption || '';
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            lightboxClose.focus();
        });
    });
});

// Close lightbox functionality
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        closeLightbox();
    }
});

// Theme toggle functionality
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains(LIGHT_THEME_CLASS)) {
            applyTheme('dark');
        } else {
            applyTheme(LIGHT_THEME_CLASS);
        }
    });
}

// ---------- Functions ----------
// Function to load initial blog posts
function loadInitialBlogPosts() {
    fetch('blog_posts.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.posts) {
                allBlogPosts = data.posts;
                displayBlogPosts(allBlogPosts.slice(0, postsToLoadInitially));
                postsLoaded = Math.min(postsToLoadInitially, allBlogPosts.length);
                window.addEventListener('scroll', debouncedHandleScroll);
            } else {
                blogPostsContainer.innerHTML = '<p>No blog posts found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing blog_posts.json:', error);
            blogPostsContainer.innerHTML = '<p>Error loading blog posts.</p>';
        });
}

// Function to display blog posts in the container
function displayBlogPosts(posts) {
    posts.forEach(post => {
        const blogPostDiv = document.createElement('div');
        blogPostDiv.classList.add('blog-post');
        const titleHeading = document.createElement('h3');
        titleHeading.textContent = post.title;
        const dateParagraph = document.createElement('p');
        dateParagraph.classList.add('blog-date');
        dateParagraph.textContent = post.date;
        const contentParagraph = document.createElement('p');
        contentParagraph.textContent = post.content;
        blogPostDiv.appendChild(titleHeading);
        blogPostDiv.appendChild(dateParagraph);
        blogPostDiv.appendChild(contentParagraph);
        blogPostsContainer.appendChild(blogPostDiv);
    });
}

// Debounce function to limit the rate of handleScroll
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Function to handle scroll event for lazy loading of blog posts
function handleScroll() {
    if (blogTabActive && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        window.removeEventListener('scroll', debouncedHandleScroll);
        const startIndex = postsLoaded;
        const endIndex = Math.min(postsLoaded + postsToLoadOnScroll, allBlogPosts.length);
        const nextPosts = allBlogPosts.slice(startIndex, endIndex);

        if (nextPosts.length > 0) {
            displayBlogPosts(nextPosts);
            postsLoaded = endIndex;
            if (postsLoaded < allBlogPosts.length) {
                window.addEventListener('scroll', debouncedHandleScroll);
            }
        }
    }
}

const debouncedHandleScroll = debounce(handleScroll, 300);

// Function to close the lightbox
function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';

    // Restore focus to the element that opened the lightbox
    if (triggerElement) {
        triggerElement.focus();
        triggerElement = null;
    }
}

// Function to apply the theme and update the theme toggle button
function applyTheme(theme) {
    if (theme === LIGHT_THEME_CLASS) {
        body.classList.add(LIGHT_THEME_CLASS);
        if (themeToggle) {
            themeToggle.innerHTML = '☀️';
            themeToggle.setAttribute('aria-label', 'Switch to dark theme');
        }
        localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME_CLASS);
    } else {
        body.classList.remove(LIGHT_THEME_CLASS);
        if (themeToggle) {
            themeToggle.innerHTML = '🌙';
            themeToggle.setAttribute('aria-label', 'Switch to light theme');
        }
        localStorage.removeItem(THEME_STORAGE_KEY);
    }
}

// ---------- Initializations and Theme Application ----------
// Apply saved theme or default
if (savedTheme) {
    applyTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme(LIGHT_THEME_CLASS);
} else {
    applyTheme('dark');
}
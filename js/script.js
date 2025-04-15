/* ========== DOM ELEMENT REFERENCES ========== */
const discordBlock = document.getElementById("discord-copy");
const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");
const galleryImages = document.querySelectorAll("#gallery img[data-lightbox]");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const blogPostsContainer = document.getElementById("blog-posts-container");
const blogLoadingWarning = document.getElementById("blog-loading-warning");

/* ========== CONFIGURATION ========== */
const LIGHT_THEME_CLASS = "light-mode";
const THEME_STORAGE_KEY = "themePreference";
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
const postsToLoadInitially = 3;
const postsToLoadOnScroll = 3;

/* ========== STATE VARIABLES ========== */
let allBlogPosts = [];
let postsLoaded = 0;
let blogTabActive = false;
let triggerElement = null;

/* ========== LIGHTBOX SETUP ========== */
// (Keep your existing lightbox setup code here - it's fine)
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-labelledby", "lightbox-caption");
const lightboxContent = document.createElement("div");
lightboxContent.id = "lightbox-content";
const lightboxImg = document.createElement("img");
lightboxImg.id = "lightbox-img";
const lightboxCaption = document.createElement("p");
lightboxCaption.id = "lightbox-caption";
const lightboxClose = document.createElement("span");
lightboxClose.id = "lightbox-close";
lightboxClose.innerHTML = "×";
lightboxClose.setAttribute("aria-label", "Close lightbox");
lightboxClose.setAttribute("tabindex", "0");
lightboxContent.appendChild(lightboxImg);
lightboxContent.appendChild(lightboxCaption);
lightbox.appendChild(lightboxContent);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);


/* ========== BLOG POST LOGIC (MODIFIED FOR LIST VIEW) ========== */

function showBlogWarning(message) {
    if (blogLoadingWarning) {
        blogLoadingWarning.textContent = message;
        blogLoadingWarning.classList.remove('is-loading'); // Remove dots class by default
        if (message === "Loading") { // Add dots class only for "Loading"
            blogLoadingWarning.classList.add('is-loading');
        }
        blogLoadingWarning.style.display = "block";
        console.log("Showing blog warning:", message);
    }
}

function hideBlogWarning() {
    if (blogLoadingWarning) {
        blogLoadingWarning.style.display = "none";
        blogLoadingWarning.classList.remove('is-loading');
        console.log("Hiding blog warning");
    }
}

// Fetches the list of posts
function loadInitialBlogPosts() {
    // Clear previous list content (leave warning element)
    blogPostsContainer.innerHTML = '';
    blogPostsContainer.appendChild(blogLoadingWarning);

    fetch('https://blogdatabase-82x8.onrender.com/api/blog-posts') // Fetches the LIST endpoint
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Blog post LIST data received:", data);
            hideBlogWarning(); // Hide loading warning

            if (data && data.posts && data.posts.length > 0) {
                allBlogPosts = data.posts; // Store the list data
                displayBlogPostList(allBlogPosts); // Display the LIST
                postsLoaded = allBlogPosts.length; // Mark all list items as 'loaded' for now
                // **Remove scroll listener - not needed for simple list**
                // window.removeEventListener("scroll", debouncedHandleScroll);
            } else {
                allBlogPosts = [];
                postsLoaded = 0;
                blogPostsContainer.insertAdjacentHTML('beforeend', "<p>No blog posts found yet.</p>");
            }
        })
        .catch(error => {
            console.error("Error fetching blog post list:", error);
            hideBlogWarning();
            blogPostsContainer.insertAdjacentHTML('beforeend', "<p>Error loading blog posts. Please try refreshing.</p>");
        });
}

// ** RENAMED & MODIFIED ** : Renders the LIST of blog posts
function displayBlogPostList(posts) {
     if (!blogPostsContainer) return;

     // Optional: Clear container again before adding list items
     // blogPostsContainer.innerHTML = '';
     // blogPostsContainer.appendChild(blogLoadingWarning);

    posts.forEach(post => {
        // Create list item elements (e.g., a div or list item)
        const postItem = document.createElement("div");
        postItem.classList.add("blog-list-item"); // Add a class for styling

        const titleLink = document.createElement("a");
        titleLink.classList.add("blog-list-title");
        // Link to post.html using the ID from the API
        titleLink.href = `post.html?id=${post.id}`;
        titleLink.textContent = post.title;

        const date = document.createElement("p");
        date.classList.add("blog-list-date");
        date.textContent = post.date; // Already formatted by API

        // Append title link and date to the list item
        postItem.appendChild(titleLink);
        postItem.appendChild(date);

        // Append the list item to the container (before the warning)
        if (blogLoadingWarning && blogPostsContainer.contains(blogLoadingWarning)) {
            blogPostsContainer.insertBefore(postItem, blogLoadingWarning);
        } else {
            blogPostsContainer.appendChild(postItem);
        }
    });
}

/* ========== LIGHTBOX LOGIC ========== */
// (Keep your existing lightbox logic: galleryImages.forEach, lightbox listeners, closeLightbox)
galleryImages.forEach(img => {
    img.addEventListener("click", event => {
        triggerElement = event.target;
        const src = triggerElement.getAttribute("src");
        const alt = triggerElement.getAttribute("alt");
        const caption = triggerElement.getAttribute("data-caption");

        lightboxImg.setAttribute("src", src);
        lightboxImg.setAttribute("alt", alt);
        lightboxCaption.textContent = caption || "";
        lightbox.classList.add("show");
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {
            lightboxClose.focus();
        });
    });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && lightbox.classList.contains("show")) closeLightbox();
});

function closeLightbox() {
    lightbox.style.opacity = 0;
    setTimeout(() => {
        lightbox.classList.remove("show");
        lightbox.style.opacity = "";
        document.body.style.overflow = "";
        if (triggerElement) {
            triggerElement.focus();
            triggerElement = null;
        }
    }, 400);
}


/* ========== THEME TOGGLE LOGIC ========== */
// (Keep your existing theme toggle logic: applyTheme, listener, initial load check)
function applyTheme(theme) {
    if (theme === LIGHT_THEME_CLASS) {
        body.classList.add(LIGHT_THEME_CLASS);
        if (themeToggle) {
            themeToggle.innerHTML = "☀️";
            themeToggle.setAttribute("aria-label", "Switch to dark theme");
        }
        localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME_CLASS);
    } else {
        body.classList.remove(LIGHT_THEME_CLASS);
        if (themeToggle) {
            themeToggle.innerHTML = "🌙";
            themeToggle.setAttribute("aria-label", "Switch to light theme");
        }
        localStorage.removeItem(THEME_STORAGE_KEY);
    }
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        body.classList.contains(LIGHT_THEME_CLASS)
            ? applyTheme("dark")
            : applyTheme(LIGHT_THEME_CLASS);
    });
}


/* ========== DISCORD COPY BUTTON LOGIC ========== */
// (Keep your existing discord copy logic)
if (discordBlock) {
    discordBlock.addEventListener("click", () => {
        navigator.clipboard.writeText("earlybirbirl").then(() => {
            const toast = document.getElementById("copy-toast");
            if (!toast) return;
            toast.textContent = "Copied Discord: earlybirbirl";
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2000);
        }).catch(err => {
            console.error("Failed to copy:", err);
            const toast = document.getElementById("copy-toast");
             if (!toast) return;
            toast.textContent = "Failed to copy!";
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
                 setTimeout(() => {
                     toast.textContent = "Copied Discord: earlybirbirl";
                }, 300);
            }, 2000);
        });
    });
}


/* ========== TAB SWITCHING LOGIC (Minor Adjustments) ========== */
tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const targetId = link.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Deactivate/hide others
        tabLinks.forEach(t => t.classList.remove("active"));
        sections.forEach(section => {
            section.style.display = "none";
            section.style.opacity = 0;
        });

        // Activate/show target
        link.classList.add("active");
        targetSection.style.display = "block";
        requestAnimationFrame(() => { targetSection.style.opacity = 1; });

        // --- Blog Tab Specific Logic ---
        if (targetId === "blog") {
            blogTabActive = true;
            // Load the LIST if it hasn't been loaded yet
            if (allBlogPosts.length === 0 && postsLoaded === 0) {
                 showBlogWarning("Loading");
                 loadInitialBlogPosts(); // This now loads the list
            } else {
                 hideBlogWarning(); // List already loaded
            }
             // ** REMOVE scroll listener adding **
             // window.removeEventListener("scroll", debouncedHandleScroll); // Ensure removed
        } else {
            // --- Logic for Non-Blog Tabs ---
            blogTabActive = false;
             // ** REMOVE scroll listener removing **
            // window.removeEventListener("scroll", debouncedHandleScroll);
            hideBlogWarning(); // Hide warning if switching away
        }
    });
});

/* ========== INITIAL PAGE LOAD ========== */
document.addEventListener("DOMContentLoaded", () => {
    // (Keep existing theme application logic)
    if (savedTheme) { applyTheme(savedTheme); }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) { applyTheme(LIGHT_THEME_CLASS); }
    else { applyTheme('dark'); }

    // Activate initial tab
    const initialHash = window.location.hash;
    let initialTabLink = document.querySelector(`a.tab-link[href="${initialHash}"]`);

    // Default to #about if hash is missing, invalid, or #blog (let click handle #blog)
    if (!initialTabLink || initialHash === '#blog') {
        initialTabLink = document.querySelector('a.tab-link[href="#about"]');
    }

    if (initialTabLink) {
        initialTabLink.click(); // Trigger click to show section
    }

    // If specifically landing on #blog hash, trigger its click again to ensure loading starts
    if (initialHash === '#blog') {
        const blogTabLink = document.querySelector('a.tab-link[href="#blog"]');
        if (blogTabLink) blogTabLink.click();
    } else {
         hideBlogWarning(); // Ensure warning hidden if not starting on blog
    }

    // (Keep existing backend ping logic)
    fetch('https://blogdatabase-82x8.onrender.com/')
        .then(response => console.log(`Backend ping: ${response.ok ? 'OK' : 'Failed'}`))
        .catch(error => console.error("Error pinging backend:", error));
});
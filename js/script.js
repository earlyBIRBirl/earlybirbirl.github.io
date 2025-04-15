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


/* ========== BLOG POST LOGIC ========== */

// Function to show/hide loading warning
function showBlogWarning(message) {
    if (blogLoadingWarning) {
        // Set the base message (e.g., "Loading", "Error loading posts")
        blogLoadingWarning.textContent = message;
        // Add class to trigger CSS animation for dots IF message is "Loading"
        if (message === "Loading") {
             blogLoadingWarning.classList.add('is-loading');
        } else {
             blogLoadingWarning.classList.remove('is-loading');
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

// Fetch and display initial blog posts
function loadInitialBlogPosts() {
    // Clear previous content (excluding the warning element itself)
    blogPostsContainer.innerHTML = '';
    blogPostsContainer.appendChild(blogLoadingWarning);

    // **Warning is shown by the click handler BEFORE calling this function**

    fetch('https://blogdatabase-82x8.onrender.com/api/blog-posts')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Blog post data received:", data);
            hideBlogWarning();

            if (data && data.posts && data.posts.length > 0) {
                allBlogPosts = data.posts;
                displayBlogPosts(allBlogPosts.slice(0, postsToLoadInitially));
                postsLoaded = Math.min(postsToLoadInitially, allBlogPosts.length);
                // Add scroll listener only if more posts exist
                if (postsLoaded < allBlogPosts.length) {
                     window.addEventListener("scroll", debouncedHandleScroll);
                }
            } else {
                allBlogPosts = [];
                postsLoaded = 0;
                // Update warning text, showBlogWarning handles removing dots class
                showBlogWarning("No blog posts found yet.");
                blogPostsContainer.insertAdjacentHTML('beforeend', "<p>No blog posts found yet.</p>");
            }
        })
        .catch(error => {
            console.error("Error fetching blog posts:", error);
            // Update the warning text directly, which showBlogWarning will handle
            showBlogWarning("Error loading posts. Please refresh.");
            blogPostsContainer.insertAdjacentHTML('beforeend', "<p>Error loading blog posts. Please try refreshing.</p>");
        });
}

// Render blog posts to the container
function displayBlogPosts(posts) {
     if (!blogPostsContainer) return;
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("blog-post");

        const title = document.createElement("h3");
        title.textContent = post.title;

        const date = document.createElement("p");
        date.classList.add("blog-date");
         try { // Basic date formatting
           date.textContent = new Date(post.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
           });
        } catch (e) { date.textContent = post.date; }


        const content = document.createElement("p");
        // Simple text content - consider sanitizing if HTML is possible in content
        content.textContent = post.content;

        postDiv.appendChild(title);
        postDiv.appendChild(date);
        postDiv.appendChild(content);
        // Insert before the warning message if it exists
        if (blogLoadingWarning && blogPostsContainer.contains(blogLoadingWarning)) {
            blogPostsContainer.insertBefore(postDiv, blogLoadingWarning);
        } else {
            blogPostsContainer.appendChild(postDiv);
        }
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Load more blog posts on scroll
function handleScroll() {
    if (blogTabActive && postsLoaded < allBlogPosts.length && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        window.removeEventListener("scroll", debouncedHandleScroll);
        const nextPosts = allBlogPosts.slice(postsLoaded, postsLoaded + postsToLoadOnScroll);
        if (nextPosts.length > 0) {
            displayBlogPosts(nextPosts);
            postsLoaded += nextPosts.length;
            if (postsLoaded < allBlogPosts.length) {
                 // Re-add listener after a short delay if more posts remain
                 setTimeout(() => window.addEventListener("scroll", debouncedHandleScroll), 100);
            }
        }
    }
}
const debouncedHandleScroll = debounce(handleScroll, 300);


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


/* ========== TAB SWITCHING LOGIC ========== */
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
            if (allBlogPosts.length === 0 && postsLoaded === 0) {
                 // Use base text "Loading" here
                 showBlogWarning("Loading");
                 loadInitialBlogPosts();
            } else {
                 hideBlogWarning();
                 if (postsLoaded > 0 && postsLoaded < allBlogPosts.length) {
                    window.removeEventListener("scroll", debouncedHandleScroll);
                    window.addEventListener("scroll", debouncedHandleScroll);
                 }
            }
        } else {
            // --- Logic for Non-Blog Tabs ---
            blogTabActive = false;
            window.removeEventListener("scroll", debouncedHandleScroll);
            hideBlogWarning(); // Hide warning if switching away
        }
    });
});

/* ========== INITIAL PAGE LOAD ========== */
document.addEventListener("DOMContentLoaded", () => {
    // Apply theme first
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme(LIGHT_THEME_CLASS);
    } else {
        applyTheme('dark');
    }

    // Activate initial tab
    const initialHash = window.location.hash;
    let initialTabLink = document.querySelector(`a.tab-link[href="${initialHash}"]`);

    // If no valid hash or hash is #blog, default to #about
    if (!initialTabLink) {
        initialTabLink = document.querySelector('a.tab-link[href="#about"]');
    }

    if (initialTabLink) {
        initialTabLink.click();
    }

    // Initial hide warning (in case HTML didn't hide it and we didn't land on #blog)
    if (window.location.hash !== "#blog") {
         hideBlogWarning();
    }


    // Optional: Ping backend on initial load
    fetch('https://blogdatabase-82x8.onrender.com/')
        .then(response => console.log(`Backend ping: ${response.ok ? 'OK' : 'Failed'}`))
        .catch(error => console.error("Error pinging backend:", error));
});
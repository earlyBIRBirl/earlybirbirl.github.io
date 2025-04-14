/* ========== DOM ELEMENT REFERENCES ========== */
// General Elements
const discordBlock = document.getElementById("discord-copy"),
    tabLinks = document.querySelectorAll(".tab-link"),
    sections = document.querySelectorAll(".section"),
    galleryImages = document.querySelectorAll("#gallery img[data-lightbox]"),
    themeToggle = document.getElementById("theme-toggle"),
    body = document.body,
    blogPostsContainer = document.getElementById("blog-posts-container");

// Theme Configuration
const LIGHT_THEME_CLASS = "light-mode",
    THEME_STORAGE_KEY = "themePreference",
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

// Blog Post Control
const postsToLoadInitially = 3,
    postsToLoadOnScroll = 3;
let allBlogPosts = [],
    postsLoaded = 0,
    blogTabActive = false;

/* ========== LIGHTBOX SETUP ========== */
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
// Load initial blog posts
function loadInitialBlogPosts() {
    fetch("assets/blogs/blog_posts.json")
        .then(res => res.json())
        .then(data => {
            if (data && data.posts) {
                allBlogPosts = data.posts;
                displayBlogPosts(allBlogPosts.slice(0, postsToLoadInitially));
                postsLoaded = Math.min(postsToLoadInitially, allBlogPosts.length);
                window.addEventListener("scroll", debouncedHandleScroll);
            } else {
                blogPostsContainer.innerHTML = "<p>No blog posts found.</p>";
            }
        })
        .catch(err => {
            console.error("Error fetching blog posts:", err);
            blogPostsContainer.innerHTML = "<p>Error loading blog posts.</p>";
        });
}

// Render blog posts to the container
function displayBlogPosts(posts) {
    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("blog-post");

        const title = document.createElement("h3");
        title.textContent = post.title;

        const date = document.createElement("p");
        date.classList.add("blog-date");
        date.textContent = post.date;

        const content = document.createElement("p");
        content.textContent = post.content;

        postDiv.appendChild(title);
        postDiv.appendChild(date);
        postDiv.appendChild(content);
        blogPostsContainer.appendChild(postDiv);
    });
}

// Debounce function for scroll
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Load more blog posts on scroll
function handleScroll() {
    if (blogTabActive && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        window.removeEventListener("scroll", debouncedHandleScroll);
        const nextPosts = allBlogPosts.slice(postsLoaded, postsLoaded + postsToLoadOnScroll);
        if (nextPosts.length > 0) {
            displayBlogPosts(nextPosts);
            postsLoaded += nextPosts.length;
            if (postsLoaded < allBlogPosts.length) {
                window.addEventListener("scroll", debouncedHandleScroll);
            }
        }
    }
}

const debouncedHandleScroll = debounce(handleScroll, 300);

/* ========== LIGHTBOX LOGIC ========== */
// Open lightbox on image click
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

// Close lightbox with close button or clicking outside
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && lightbox.classList.contains("show")) closeLightbox();
});

// Close lightbox function
let triggerElement = null;
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
function applyTheme(theme) {
    if (theme === LIGHT_THEME_CLASS) {
        body.classList.add(LIGHT_THEME_CLASS);
        themeToggle.innerHTML = "☀️";
        themeToggle.setAttribute("aria-label", "Switch to dark theme");
        localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME_CLASS);
    } else {
        body.classList.remove(LIGHT_THEME_CLASS);
        themeToggle.innerHTML = "🌙";
        themeToggle.setAttribute("aria-label", "Switch to light theme");
        localStorage.removeItem(THEME_STORAGE_KEY);
    }
}

if (savedTheme) {
    applyTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme(LIGHT_THEME_CLASS);
} else {
    applyTheme("dark");
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        body.classList.contains(LIGHT_THEME_CLASS)
            ? applyTheme("dark")
            : applyTheme(LIGHT_THEME_CLASS);
    });
}

/* ========== DISCORD COPY BUTTON LOGIC ========== */
discordBlock.addEventListener("click", () => {
    navigator.clipboard.writeText("earlybirbirl").then(() => {
        const toast = document.getElementById("copy-toast");
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
    }).catch(err => {
        console.error("Failed to copy:", err);
        const toast = document.getElementById("copy-toast");
        toast.textContent = "Failed to copy!";
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
            toast.textContent = "Copied Discord: earlybirbirl";
        }, 2000);
    });
});

/* ========== TAB SWITCHING LOGIC ========== */
tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const targetId = link.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        // Deactivate all tab links
        tabLinks.forEach(t => t.classList.remove("active"));
        // Activate the clicked tab link
        link.classList.add("active");

        // Hide all sections
        sections.forEach(section => {
            section.style.opacity = 0;
            section.style.display = "none";
        });

        // Show the target section with a fade-in effect
        targetSection.style.display = "block";
        targetSection.offsetHeight; // Force a reflow to apply the display style immediately
        targetSection.style.opacity = 0;
        requestAnimationFrame(() => {
            targetSection.style.opacity = 1;
        });

        // Handle blog tab activation for loading posts
        if (targetId === "blog") {
            blogTabActive = true;
            if (allBlogPosts.length === 0) {
                loadInitialBlogPosts();
            } else if (postsLoaded === 0 && allBlogPosts.length > 0) {
                displayBlogPosts(allBlogPosts.slice(0, postsToLoadInitially));
                postsLoaded = Math.min(postsToLoadInitially, allBlogPosts.length);
                window.addEventListener("scroll", debouncedHandleScroll);
            }
        } else {
            blogTabActive = false;
            window.removeEventListener("scroll", debouncedHandleScroll);
        }
    });
});

/* ========== INITIAL LOAD: Show First Section ========== */
document.addEventListener("DOMContentLoaded", () => {
    const initialSection = document.getElementById("about");
    if (initialSection) {
        initialSection.style.display = "block";
        initialSection.style.opacity = 1;
    }
});
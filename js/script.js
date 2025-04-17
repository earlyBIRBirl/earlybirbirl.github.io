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

/* ========== STATE VARIABLES ========== */
let allBlogPosts = [];
let postsLoaded = 0;
let blogTabActive = false;
let triggerElement = null;

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

/* ========== CORE NAVIGATION & DISPLAY LOGIC ========== */
function activateTab(targetId) {
    // Use 'about' as default if targetId is invalid or missing
    const effectiveTargetId = targetId && document.getElementById(targetId) ? targetId : 'about';
    const targetSection = document.getElementById(effectiveTargetId);
    const targetLink = document.querySelector(`a.tab-link[href="#${effectiveTargetId}"]`);

    console.log(`Activating section: ${effectiveTargetId}`);

    if (!targetSection || !targetLink) {
        console.error(`Could not find section or link for default ID: ${effectiveTargetId}`);
        return;
    }

    // Update active class on navigation links
    tabLinks.forEach(t => t.classList.remove("active"));
    targetLink.classList.add("active");

    // Hide all sections instantly before showing the target
    sections.forEach(section => {
        section.style.display = "none";
        section.style.opacity = 0;
    });

    // Show the target section and fade it in
    targetSection.style.display = "block";
    requestAnimationFrame(() => {
        targetSection.style.opacity = 1;
    });

    // --- Handle Blog Tab Activation ---
    if (effectiveTargetId === "blog") {
        blogTabActive = true;
        // Load blog post LIST if it hasn't been loaded yet
        if (allBlogPosts.length === 0 && postsLoaded === 0) {
             showBlogWarning("Loading");
             loadInitialBlogPosts();
        } else {
             // Blog list already loaded or attempted, ensure warning is hidden
             hideBlogWarning();
        }
    } else {
        // --- Logic for Non-Blog Tabs ---
        blogTabActive = false;
        hideBlogWarning();
    }
}

// --- Browser Back/Forward Listener (popstate) ---
window.addEventListener('popstate', event => {
    // event.state might contain the { tabId: targetId } if you pushed it, or be null
    const currentHash = window.location.hash;
    let targetId = currentHash.substring(1); // Remove '#'

    // Use the central activateTab function to handle display
    // activateTab already includes default logic if targetId is empty or invalid
    console.log(`Popstate event: Navigating to #${targetId || 'about'}`);
    activateTab(targetId);
});

/* ========== BLOG POST LOGIC ========== */
function showBlogWarning(message) {
    if (blogLoadingWarning) {
        blogLoadingWarning.textContent = message;
        blogLoadingWarning.classList.remove('is-loading');
        if (message === "Loading") {
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

    fetch('https://blogdatabase-82x8.onrender.com/api/blog-posts')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Blog post LIST data received:", data);
            hideBlogWarning();

            if (data && data.posts && data.posts.length > 0) {
                allBlogPosts = data.posts;
                displayBlogPostList(allBlogPosts);
                postsLoaded = allBlogPosts.length;
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

// Renders the LIST of blog posts
function displayBlogPostList(posts) {
     if (!blogPostsContainer) return;

    posts.forEach(post => {
        // Create list item elements (e.g., a div or list item)
        const postItem = document.createElement("div");
        postItem.classList.add("blog-list-item");

        const titleLink = document.createElement("a");
        titleLink.classList.add("blog-list-title");
        // Link to post.html using the ID from the API
        titleLink.href = `post.html?id=${post.id}`;
        titleLink.textContent = post.title;

        const date = document.createElement("p");
        date.classList.add("blog-list-date");
        date.textContent = post.date;

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
// --- Tab Click Listener ---
tabLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        const targetId = link.getAttribute("href").substring(1);

        // Activate the tab content visually using the new function
        activateTab(targetId);

        // Update the URL hash in the browser address bar
        // Use pushState to allow browser back/forward navigation
        if (history.pushState) {
             // Check if the new hash is different from the current one to avoid duplicate history states
             if (`#${targetId}` !== window.location.hash) {
                history.pushState({ tabId: targetId }, '', `#${targetId}`);
             }
        }
    });
});

/* ========== INITIAL PAGE LOAD ========== */
document.addEventListener("DOMContentLoaded", () => {
    // Apply theme first
    if (savedTheme) { applyTheme(savedTheme); }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) { applyTheme(LIGHT_THEME_CLASS); }
    else { applyTheme('dark'); }

    // Determine initial section based on hash or default to 'about'
    let initialTargetId = window.location.hash.substring(1);
    // activateTab will handle defaulting to 'about' if initialTargetId is empty or invalid
    console.log(`Initial load: Activating #${initialTargetId || 'about'}`);
    activateTab(initialTargetId);

    if (initialTargetId && history.replaceState) {
         history.replaceState({ tabId: initialTargetId }, '', `#${initialTargetId}`);
    }

    fetch('https://blogdatabase-82x8.onrender.com/')
        .then(response => console.log(`Backend ping: ${response.ok ? 'OK' : 'Failed'}`))
        .catch(error => console.error("Error pinging backend:", error));
});

/* ========== TWITCH LIVE STREAM LOGIC ========== */
const twitchEmbedContainer = document.getElementById("twitch-embed-container");
const twitchChannelName = "earlybirbirl";

function checkTwitchLiveStatus() {
    fetch(`https://blogdatabase-82x8.onrender.com/api/twitch-live-status`)
        .then(response => {
            if (!response.ok) {
                console.error(`Flask API error: ${response.status}`);
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.is_live) {
                // Stream is live
                twitchEmbedContainer.style.display = "block";
                // Embed the Twitch player if it's not already embedded
                if (!twitchEmbedContainer.querySelector('iframe')) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://player.twitch.tv/?channel=<span class="math-inline">\{twitchChannelName\}&parent\=</span>{window.location.hostname}`;
                    iframe.width = '100%';
                    iframe.height = '360';
                    iframe.allowFullscreen = true;
                    twitchEmbedContainer.appendChild(iframe);
                }
            } else {
                // Stream is not live or error occurred
                twitchEmbedContainer.style.display = "none";
                twitchEmbedContainer.innerHTML = '';
                if (data && data.error) {
                    console.error("Error from Flask API:", data.error);
                }
            }
        })
        .catch(error => {
            console.error("Error checking Twitch live status:", error);
            twitchEmbedContainer.style.display = "none";
            twitchEmbedContainer.innerHTML = '';
        });
}
// Check the status initially when the Social Media tab is shown
function handleSocialsTabActivation() {
  if (window.location.hash === "#socials") {
    checkTwitchLiveStatus();
  }
}

// Call the function when the Social Media tab is activated
tabLinks.forEach(link => {
  link.addEventListener("click", event => {
    const targetId = link.getAttribute("href").substring(1);
    if (targetId === "socials") {
      // Delay the check slightly to ensure the section is visible
      setTimeout(checkTwitchLiveStatus, 300);
    }
  });
});
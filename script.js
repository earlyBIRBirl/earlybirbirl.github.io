const discordBlock = document.getElementById("discord-copy")
  , tabLinks = document.querySelectorAll(".tab-link")
  , sections = document.querySelectorAll(".section")
  , galleryImages = document.querySelectorAll("#gallery img[data-lightbox]")
  , themeToggle = document.getElementById("theme-toggle")
  , body = document.body
  , LIGHT_THEME_CLASS = "light-mode"
  , THEME_STORAGE_KEY = "themePreference"
  , savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  , blogPostsContainer = document.getElementById("blog-posts-container")
  , postsToLoadInitially = 3
  , postsToLoadOnScroll = 3;
let triggerElement = null
  , allBlogPosts = []
  , postsLoaded = 0
  , blogTabActive = !1;
const lightbox = document.createElement("div");
lightbox.id = "lightbox",
lightbox.setAttribute("role", "dialog"),
lightbox.setAttribute("aria-modal", "true");
const lightboxContent = document.createElement("div");
lightboxContent.id = "lightbox-content";
const lightboxImg = document.createElement("img");
lightboxImg.id = "lightbox-img";
const lightboxCaption = document.createElement("p");
lightboxCaption.id = "lightbox-caption",
lightbox.setAttribute("aria-labelledby", "lightbox-caption");
const lightboxClose = document.createElement("span");
function loadInitialBlogPosts() {
  fetch("blog_posts.json").then(e => e.json()).then(e => {
    e && e.posts ? (displayBlogPosts((allBlogPosts = e.posts).slice(0, 3)),
    postsLoaded = Math.min(3, allBlogPosts.length),
    window.addEventListener("scroll", debouncedHandleScroll)) : blogPostsContainer.innerHTML = "<p>No blog posts found.</p>"
  }
  ).catch(e => {
    console.error("Error fetching or parsing blog_posts.json:", e),
    blogPostsContainer.innerHTML = "<p>Error loading blog posts.</p>"
  }
  )
}
function displayBlogPosts(e) {
  e.forEach(e => {
    let t = document.createElement("div");
    t.classList.add("blog-post");
    let l = document.createElement("h3");
    l.textContent = e.title;
    let o = document.createElement("p");
    o.classList.add("blog-date"),
    o.textContent = e.date;
    let s = document.createElement("p");
    s.textContent = e.content,
    t.appendChild(l),
    t.appendChild(o),
    t.appendChild(s),
    blogPostsContainer.appendChild(t)
  }
  )
}
function debounce(e, t) {
  let l;
  return function(...o) {
    clearTimeout(l),
    l = setTimeout( () => {
      e.apply(this, o)
    }
    , t)
  }
}
function handleScroll() {
  if (blogTabActive && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    window.removeEventListener("scroll", debouncedHandleScroll);
    let e = postsLoaded
      , t = Math.min(postsLoaded + 3, allBlogPosts.length)
      , l = allBlogPosts.slice(e, t);
    l.length > 0 && (displayBlogPosts(l),
    (postsLoaded = t) < allBlogPosts.length && window.addEventListener("scroll", debouncedHandleScroll))
  }
}
lightboxClose.id = "lightbox-close",
lightboxClose.innerHTML = "\xd7",
lightboxClose.setAttribute("aria-label", "Close lightbox"),
lightboxClose.setAttribute("tabindex", "0"),
lightboxContent.appendChild(lightboxImg),
lightboxContent.appendChild(lightboxCaption),
lightbox.appendChild(lightboxContent),
lightbox.appendChild(lightboxClose),
document.body.appendChild(lightbox),
discordBlock.addEventListener("click", () => {
  navigator.clipboard.writeText("earlybirbirl").then( () => {
    let e = document.getElementById("copy-toast");
    e.classList.add("show"),
    setTimeout( () => e.classList.remove("show"), 2e3)
  }
  ).catch(e => {
    console.error("Failed to copy text: earlybirbirl", e);
    let t = document.getElementById("copy-toast");
    t.textContent = "Failed to copy!",
    t.classList.add("show"),
    setTimeout( () => {
      t.classList.remove("show"),
      t.textContent = "Copied Discord: earlybirbirl"
    }
    , 2e3)
  }
  )
}
),
tabLinks.forEach(e => {
  e.addEventListener("click", t => {
    t.preventDefault();
    const targetSectionId = e.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetSectionId);
    const currentActiveSection = document.querySelector('.section:not([style*="display: none"])');

    tabLinks.forEach(e => e.classList.remove("active"));
    e.classList.add("active");

    if (currentActiveSection && currentActiveSection !== targetSection) {
      currentActiveSection.style.opacity = 0;
      currentActiveSection.addEventListener('transitionend', () => {
        currentActiveSection.style.display = 'none';
        targetSection.style.display = 'block';
        // Force a layout reflow before starting the fade-in
        targetSection.offsetHeight;
        targetSection.style.opacity = 0;
        requestAnimationFrame(() => {
          targetSection.style.opacity = 1;
        });
        // Remove the event listener after it's triggered
        currentActiveSection.removeEventListener('transitionend', arguments.callee);
      }, { once: true });
    } else if (!currentActiveSection) {
      // Handle initial load or if no section is currently visible
      targetSection.style.display = 'block';
      targetSection.style.opacity = 0;
      requestAnimationFrame(() => {
        targetSection.style.opacity = 1;
      });
    }

    if ("blog" === targetSectionId) {
      blogTabActive = !0;
      if (0 === allBlogPosts.length) {
        loadInitialBlogPosts();
      } else if (0 === postsLoaded && allBlogPosts.length > 0) {
        displayBlogPosts(allBlogPosts.slice(0, 3));
        postsLoaded = Math.min(3, allBlogPosts.length);
        window.addEventListener("scroll", debouncedHandleScroll);
      }
    } else {
      blogTabActive = !1;
      window.removeEventListener("scroll", debouncedHandleScroll);
    }
  }
  )
}
),
galleryImages.forEach(e => {
  e.addEventListener("click", e => {
    triggerElement = e.target;
    let t = e.target.getAttribute("src")
      , l = e.target.getAttribute("alt")
      , o = e.target.getAttribute("data-caption");
    lightboxImg.setAttribute("src", t),
    lightboxImg.setAttribute("alt", l),
    lightboxCaption.textContent = o || "",
    lightbox.classList.add("show"),
    document.body.style.overflow = "hidden",
    requestAnimationFrame( () => {
      lightboxClose.focus()
    }
    )
  }
  )
}
),
lightboxClose.addEventListener("click", closeLightbox),
lightbox.addEventListener("click", e => {
  e.target === lightbox && closeLightbox()
}
),
document.addEventListener("keydown", e => {
  "Escape" === e.key && lightbox.classList.contains("show") && closeLightbox()
}
),
themeToggle && themeToggle.addEventListener("click", () => {
  body.classList.contains(LIGHT_THEME_CLASS) ? applyTheme("dark") : applyTheme(LIGHT_THEME_CLASS)
}
);
const debouncedHandleScroll = debounce(handleScroll, 300);
function closeLightbox() {
  lightbox.style.opacity = 0; // Start the fade-out
  setTimeout(() => {
    lightbox.classList.remove("show");
    document.body.style.overflow = "";
    triggerElement && (triggerElement.focus(),
    triggerElement = null);
    lightbox.style.opacity = "";
  }, 400);
}
function applyTheme(e) {
  e === LIGHT_THEME_CLASS ? (body.classList.add(LIGHT_THEME_CLASS),
  themeToggle && (themeToggle.innerHTML = "☀️",
  themeToggle.setAttribute("aria-label", "Switch to dark theme")),
  localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME_CLASS)) : (body.classList.remove(LIGHT_THEME_CLASS),
  themeToggle && (themeToggle.innerHTML = "\uD83C\uDF19",
  themeToggle.setAttribute("aria-label", "Switch to light theme")),
  localStorage.removeItem(THEME_STORAGE_KEY))
}
savedTheme ? applyTheme(savedTheme) : window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? applyTheme(LIGHT_THEME_CLASS) : applyTheme("dark");

// Ensure the initial section is visible when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const initialSection = document.getElementById('about');
  if (initialSection) {
    initialSection.style.display = 'block';
    initialSection.style.opacity = 1;
  }
});
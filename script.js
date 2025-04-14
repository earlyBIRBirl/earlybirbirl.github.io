const discordBlock = document.getElementById("discord-copy");
const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");
const galleryImages = document.querySelectorAll('#gallery img[data-lightbox]');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const LIGHT_THEME_CLASS = 'light-mode';
const THEME_STORAGE_KEY = 'themePreference';
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

// --- Lightbox Elements (Dynamically Created) ---
// Keep ARIA attributes and tabindex for general accessibility, even without the trap
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
lightboxClose.setAttribute('tabindex', '0'); // Keep focusable

lightboxContent.appendChild(lightboxImg);
lightboxContent.appendChild(lightboxCaption);
lightbox.appendChild(lightboxContent);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);

// --- State Variables ---
let triggerElement = null; // Still useful for restoring focus on close

// --- Event Listeners ---

discordBlock.addEventListener("click", () => {
  navigator.clipboard.writeText("earlybirbirl").then(() => {
    const toast = document.getElementById("copy-toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }).catch(err => {
    console.error('Failed to copy text: earlybirbirl', err);
  });
});

tabLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    tabLinks.forEach((l) => l.classList.remove("active"));
    sections.forEach((s) => (s.style.display = "none"));
    link.classList.add("active");
    const sectionId = link.getAttribute("href").substring(1);
    document.getElementById(sectionId).style.display = "block";
  });
});

galleryImages.forEach((img) => {
  img.addEventListener('click', (e) => {
    triggerElement = e.target; // Store the clicked image for focus restoration

    const src = e.target.getAttribute('src');
    const alt = e.target.getAttribute('alt');
    const caption = e.target.getAttribute('data-caption');

    // Open lightbox logic directly here
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt);
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Optionally, set focus to the close button when opening
    // requestAnimationFrame helps ensure it's ready
    requestAnimationFrame(() => {
        lightboxClose.focus();
    });
  });
});

lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) { // Click outside content but inside lightbox overlay
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  // Escape key closes lightbox
  if (e.key === 'Escape' && lightbox.classList.contains('show')) {
    closeLightbox();
  }
});

// Listener for the toggle button
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Toggle the class and apply the new theme
      if (body.classList.contains(LIGHT_THEME_CLASS)) {
        applyTheme('dark'); // Switch to dark
      } else {
        applyTheme(LIGHT_THEME_CLASS); // Switch to light
      }
    });
}

// Check for saved theme OR system preference if no theme saved
// Note: prefers-color-scheme check is basic, could be more robust
if (savedTheme) {
    applyTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    // Optional: Default to light theme if user's system prefers light
    // Remove this 'else if' block if you want dark to always be the default
    applyTheme(LIGHT_THEME_CLASS);
} else {
    applyTheme('dark'); // Default to dark if no preference saved/detected
}

// --- Functions ---

function closeLightbox() {
  lightbox.classList.remove('show');
  document.body.style.overflow = '';

  // Restore focus to the element that opened the lightbox
  if (triggerElement) {
    triggerElement.focus();
    triggerElement = null; // Clear the trigger element
  }
}

// Function to apply theme and update button
function applyTheme(theme) {
  if (theme === LIGHT_THEME_CLASS) {
    body.classList.add(LIGHT_THEME_CLASS);
    if (themeToggle) { // Check if button exists before updating
        themeToggle.innerHTML = '☀️'; // Sun icon for light mode
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    }
    localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME_CLASS);
  } else {
    body.classList.remove(LIGHT_THEME_CLASS);
     if (themeToggle) {
        themeToggle.innerHTML = '🌙'; // Moon icon for dark mode
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
     }
    localStorage.removeItem(THEME_STORAGE_KEY); // Remove key for default (dark)
  }
}
const discordBlock = document.getElementById("discord-copy");
const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");
const galleryImages = document.querySelectorAll('#gallery img[data-lightbox]');

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
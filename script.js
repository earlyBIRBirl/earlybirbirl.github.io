const discordBlock = document.getElementById("discord-copy");

discordBlock.addEventListener("click", () => {
  navigator.clipboard.writeText("earlybirbirl").then(() => {
    const toast = document.getElementById("copy-toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }).catch(err => {
  console.error('Failed to copy text: earlybirbirl', err);
  });
});

const tabLinks = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".section");

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

const galleryImages = document.querySelectorAll(
  '#gallery img[data-lightbox]'
);
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
const lightboxContent = document.createElement('div');
lightboxContent.id = 'lightbox-content';
const lightboxImg = document.createElement('img');
lightboxImg.id = 'lightbox-img';
const lightboxCaption = document.createElement('p');
lightboxCaption.id = 'lightbox-caption';
const lightboxClose = document.createElement('span');
lightboxClose.id = 'lightbox-close';
lightboxClose.innerHTML = '&times;';

lightboxContent.appendChild(lightboxImg);
lightboxContent.appendChild(lightboxCaption);
lightbox.appendChild(lightboxContent);
lightbox.appendChild(lightboxClose);
document.body.appendChild(lightbox);

galleryImages.forEach((img) => {
  img.addEventListener('click', (e) => {
    const src = e.target.getAttribute('src');
    const alt = e.target.getAttribute('alt');
    const caption = e.target.getAttribute('data-caption');

    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt);
    lightboxCaption.textContent = caption || '';
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

function closeLightbox() {
  lightbox.classList.remove('show');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('show')) {
    closeLightbox();
  }
});
document.addEventListener('DOMContentLoaded', () => {
     const tabLinks = document.querySelectorAll('.tab-link');
     const sections = document.querySelectorAll('.section');
     const galleryLinks = document.querySelectorAll('.gallery-link');
     const lightbox = document.getElementById('lightbox');
     const lightboxImg = document.querySelector('.lightbox-content');
     const closeBtn = document.querySelector('.close-btn');

     function showSection(id) {
       sections.forEach(section => {
         section.style.display = 'none';
       });
       document.getElementById(id.substring(1)).style.display = 'block';
     }

     function activateTab(link) {
       tabLinks.forEach(tab => {
         tab.classList.remove('active');
       });
       link.classList.add('active');
     }

     tabLinks.forEach(link => {
       link.addEventListener('click', (e) => {
         e.preventDefault();
         const targetId = link.getAttribute('href');
         showSection(targetId);
         activateTab(link);
       });
     });

     // --- Lightbox JavaScript ---
     galleryLinks.forEach(link => {
       link.addEventListener('click', (e) => {
         e.preventDefault(); // Prevent default link behavior
         lightbox.style.display = 'block'; // Show the lightbox
         lightboxImg.src = link.dataset.fullSrc; // Set the image source
       });
     });

     closeBtn.addEventListener('click', () => {
       lightbox.style.display = 'none'; // Hide the lightbox
     });

     // Close the lightbox if the user clicks outside the image
     window.addEventListener('click', (e) => {
       if (e.target === lightbox) {
         lightbox.style.display = 'none';
       }
     });
   });
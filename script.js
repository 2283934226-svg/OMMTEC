const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
  menu.textContent = open ? 'Close' : 'Menu';
});
document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu';
}));

const hero = document.querySelector('.hero');
const readout = document.querySelector('.cursor-readout');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && hero && readout) {
  hero.addEventListener('pointermove', event => {
    const box = hero.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    hero.style.setProperty('--pointer-x', `${x}%`);
    hero.style.setProperty('--pointer-y', `${y}%`);
    hero.style.setProperty('--tilt-x', `${(x - 50) / 14}deg`);
    hero.style.setProperty('--tilt-y', `${(50 - y) / 16}deg`);
    readout.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px)`;
  });
  hero.addEventListener('pointerenter', () => hero.classList.add('is-tracking'));
  hero.addEventListener('pointerleave', () => hero.classList.remove('is-tracking'));
}

const galleryItems = [...document.querySelectorAll('.gallery-item')];
const lightbox = document.querySelector('.lightbox');
if (lightbox && galleryItems.length) {
  const lightboxImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  let activeImage = 0;
  const showImage = index => {
    activeImage = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeImage];
    lightboxImage.src = item.dataset.image;
    lightboxImage.alt = item.querySelector('img').alt;
    caption.textContent = item.dataset.caption;
  };
  galleryItems.forEach((item, index) => item.addEventListener('click', () => {
    showImage(index); lightbox.showModal();
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeImage - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeImage + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') showImage(activeImage - 1);
    if (event.key === 'ArrowRight') showImage(activeImage + 1);
  });
}

const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) reveals.forEach(item => item.classList.add('visible'));
else {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: .16 });
  reveals.forEach(item => revealObserver.observe(item));
}

const sidebar = document.querySelector('#sidebar');
const menuButton = document.querySelector('#menu-button');
const navigationLinks = [...document.querySelectorAll('.page-nav a')];

function closeMenu() {
  sidebar.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('menu-open')) {
    closeMenu();
    menuButton.focus();
  }
});
function markCurrentSection(id) {
  for (const link of navigationLinks) {
    const isCurrent = link.hash === '#' + id;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
for (const link of navigationLinks) {
  link.addEventListener('click', () => {
    closeMenu();
    markCurrentSection(link.hash.slice(1));
  });
}
if ('IntersectionObserver' in window) {
  let observer;
  function observeSections() {
    if (observer) observer.disconnect();
    // Pixel margins keep the reading band tied to height on wide screens.
    const topInset = Math.round(window.innerHeight * 0.15);
    const bottomInset = Math.round(window.innerHeight * 0.7);
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) markCurrentSection(entry.target.id);
      }
    }, { rootMargin: '-' + topInset + 'px 0px -' + bottomInset + 'px 0px', threshold: 0 });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  }
  observeSections();
  let resizePending = false;
  window.addEventListener('resize', () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      observeSections();
      resizePending = false;
    });
  });
}
const textSizeButton = document.querySelector('#text-size');
textSizeButton.addEventListener('click', () => {
  const isLarge = document.documentElement.classList.toggle('large-text');
  textSizeButton.setAttribute('aria-pressed', String(isLarge));
  textSizeButton.textContent = isLarge ? 'Standard text' : 'Larger text';
});
document.querySelector('#print-journal').addEventListener('click', () => window.print());

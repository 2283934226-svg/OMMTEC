(() => {
  const root = document.documentElement;
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('ommtec-theme') || 'light'; } catch (_) {}
  root.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light';
  root.style.colorScheme = root.dataset.theme;

  function mountToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.type = 'button';
    document.body.appendChild(button);

    function sync() {
      const dark = root.dataset.theme === 'dark';
      button.innerHTML = `<span aria-hidden="true">${dark ? '☀' : '☾'}</span><b>${dark ? 'Light' : 'Dark'}</b>`;
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
      button.setAttribute('aria-pressed', String(dark));
    }

    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.style.colorScheme = root.dataset.theme;
      try { localStorage.setItem('ommtec-theme', root.dataset.theme); } catch (_) {}
      sync();
      window.dispatchEvent(new CustomEvent('ommtec-theme-change', { detail: { theme: root.dataset.theme } }));
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountToggle, { once: true });
  else mountToggle();
})();

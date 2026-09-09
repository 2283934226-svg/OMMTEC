document.querySelectorAll('.rm-video-player').forEach(player => {
  const video = player.querySelector('video');
  const play = player.querySelector('[data-play]');
  const sound = player.querySelector('[data-sound]');
  const hasAudio = player.dataset.audio !== 'none';
  let loaded = false;
  let pausedByUser = false;
  video.muted = true;
  function load() {
    if (loaded) return;
    const source = video.querySelector('source');
    source.src = source.dataset.src;
    loaded = true;
    video.load();
  }
  function sync() {
    play.textContent = video.paused ? 'Play' : 'Pause';
    if (hasAudio) {
      sound.textContent = video.muted ? 'Sound off' : 'Sound on';
      sound.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Mute video');
      sound.setAttribute('aria-pressed', String(!video.muted));
    } else {
      sound.textContent = 'No audio';
      sound.setAttribute('aria-label', 'Source video has no audio');
      sound.disabled = true;
    }
  }
  play.addEventListener('click', () => {
    load();
    pausedByUser = !video.paused;
    if (video.paused) video.play().catch(sync); else video.pause();
  });
  sound.addEventListener('click', () => {
    if (!hasAudio) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
    sync();
  });
  ['play','pause','volumechange','error'].forEach(event => video.addEventListener(event, sync));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        load();
        if (!pausedByUser) video.play().catch(sync);
      } else video.pause();
    }, {threshold: .15}).observe(video);
  } else { load(); video.play().catch(sync); }
});

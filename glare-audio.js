const GLARE_WARNING_AUDIO_PATHS = {
  ru: 'audio/glare-warning-ru.mp3',
  en: 'audio/glare-warning-en.mp3',
  kk: 'audio/glare-warning-kk.mp3',
};

const glareAudioState = {
  enabled: false,
  current: null,
};

function enableGlareAudio() {
  glareAudioState.enabled = true;
}

function playGlareWarning() {
  if (!glareAudioState.enabled) return;

  const source = GLARE_WARNING_AUDIO_PATHS[currentLang] || GLARE_WARNING_AUDIO_PATHS.ru;
  if (!source) return;

  if (glareAudioState.current) {
    glareAudioState.current.pause();
    glareAudioState.current.currentTime = 0;
  }

  const audio = new Audio(source);
  glareAudioState.current = audio;
  audio.addEventListener('ended', () => {
    if (glareAudioState.current === audio) glareAudioState.current = null;
  }, { once: true });
  audio.addEventListener('error', () => {
    console.warn('[Glare audio] Could not play:', source);
    if (glareAudioState.current === audio) glareAudioState.current = null;
  }, { once: true });
  audio.play().catch(() => {
    // Some browsers require a user gesture before audio can be played.
    if (glareAudioState.current === audio) glareAudioState.current = null;
  });
}

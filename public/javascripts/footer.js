const audio = document.getElementById('mainAudioPlayer');
const playBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const progressBar = document.getElementById('progressBar');
const volumeSlider = document.querySelector('.volume-slider');
const volumeBtn = document.querySelector('.btn-circle');
const volumeIcon = volumeBtn.querySelector('i');

// Play/Pause Toggle
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playBtn.classList.remove('fa-play');
    playBtn.classList.add('fa-pause');
  } else {
    audio.pause();
    playBtn.classList.remove('fa-pause');
    playBtn.classList.add('fa-play');
  }
});

// Arrow Key Skip
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
  }
  if (event.key === 'ArrowLeft') {
    audio.currentTime = Math.max(0, audio.currentTime - 5);
  }
});

// Progress bar updates
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

// Scrubbing
progressBar.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

// Volume control (slider)
volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
    if (audio.volume === 0) {
      audio.muted = true;
      volumeIcon.classList.remove('fa-volume-high');
      volumeIcon.classList.add('fa-volume-xmark');
    } else {
      audio.muted = false;
      volumeIcon.classList.remove('fa-volume-xmark');
      volumeIcon.classList.add('fa-volume-high');
    }
  });

// Mute Toggle Button
volumeBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;

    if (audio.muted) {
      volumeIcon.classList.remove('fa-volume-high');
      volumeIcon.classList.add('fa-volume-xmark');
      volumeSlider.value = 10;
    } else {
      volumeIcon.classList.remove('fa-volume-xmark');
      volumeIcon.classList.add('fa-volume-high');
    }
});


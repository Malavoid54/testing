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

function setupTrackPlayback(track) {
  const audio = document.getElementById('mainAudioPlayer');
  const nowPlayingImg = document.getElementById('nowPlayingImg');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const nowPlayingArtist = document.getElementById('nowPlayingArtist');
  
  nowPlayingImg.src = track.albumCover || '/images/album-placeholder.png';
  nowPlayingImg.onerror = () => {
    nowPlayingImg.src = '/images/album-placeholder.png';
  };
  
  nowPlayingTitle.textContent = track.title || 'Unknown Track';
  nowPlayingArtist.textContent = track.artist || 'Unknown Artist';

  if (track.previewUrl) {
    audio.src = track.previewUrl;
    audio.play().catch(e => {
      console.error("Playback failed:", e);
      alert("Could not play track preview");
    });
  } else {
    audio.pause();
    audio.src = "";
    alert("No preview available for this track");
  }
}


function setupTrackClick(card, track) {
  const image = card.querySelector(".track-img");
  image.onclick = () => {
    document.getElementById('nowPlayingImg').src = track.album.cover_medium;
    document.getElementById('nowPlayingTitle').textContent = track.title;
    document.getElementById('nowPlayingArtist').textContent = track.artist.name;

  const audio = document.getElementById('mainAudioPlayer');
  audio.src = track.preview;
  audio.play();
};
}

async function searchDeezer() {
  const query = document.getElementById('searchInput').value.trim();
  const filter = document.getElementById('searchFilter').value;
  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = '';

  if (!query) return; // Don’t search on empty input

  try {
    if (filter === 'all') {
      // Fetch all 3 types in parallel
      const [tracksRes, artistsRes, albumsRes] = await Promise.all([
        fetch(`/deezer/search?q=${encodeURIComponent(query)}&filter=track`),
        fetch(`/deezer/search?q=${encodeURIComponent(query)}&filter=artist`),
        fetch(`/deezer/search?q=${encodeURIComponent(query)}&filter=album`)
      ]);

      const tracks = await tracksRes.json();
      const artists = await artistsRes.json();
      const albums = await albumsRes.json();

      resultsDiv.innerHTML = `
      <h2 class="section-title">Songs</h2>
      <div class="card-grid" id="songsSection"></div>

      <h2 class="section-title">Artists</h2>
      <div class="card-grid" id="artistsSection"></div>

      <h2 class="section-title">Albums</h2>
      <div class="card-grid" id="albumsSection"></div>
      `;

      // Render tracks
      tracks.data.forEach((track) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="track-img-container">
            <img class="track-img" src="${track.album?.cover_medium || '/images/album-placeholder.png'}"
              alt="${track.title}"
              onerror="this.src='/images/album-placeholder.png'">
            ${track.preview ? '<i class="fas fa-play play-hover-icon"></i>' : ''}
          </div>
          <h4>${track.title || 'Unknown Track'}</h4>
          <small>${track.artist?.name || 'Unknown Artist'}</small><br/>
          <div class="track-dropdown-container">
            button class="track-dropdown-button"
            data-title="${track.title}"
            data-album="${track.album?.title || 'Unknown Album'}"
            data-artist="${track.artist?.name || 'Unknown Artist'}"
            data-duration="${track.duration || 30}"
            data-preview="${track.preview || ''}"
            data-cover="${track.album?.cover_medium || '/images/album-placeholder.png'}"
            data-deezer-id="${track.id || ''}">
            <i class="fas fa-ellipsis-v"></i>
          </button>
            <div class="track-dropdown-menu"></div>
          </div>
        `;

        document.getElementById('songsSection').appendChild(card);

        setupTrackClick(card, track);
      });

      // Render artists
      artists.data.forEach((artist) => {
        const card = document.createElement('div');
        card.className = 'card artist';
        card.innerHTML = `
          <img src="${artist.picture_medium}" style="width:100px; border-radius:50%; margin-bottom: 10px;">
          <p class="caption">${artist.name}</p>
        `;
        document.getElementById('artistsSection').appendChild(card);
      });

      // Render albums
      albums.data.forEach((album) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${album.cover_medium}" style="width:100%; border-radius:10px;">
          <h4>${album.title}</h4>
          <small>${album.artist.name}</small>
        `;
        document.getElementById('albumsSection').appendChild(card);
      });

      if (resultsDiv.innerHTML === '') {
        resultsDiv.innerHTML = `<p>No results found.</p>`;
      }
    }
    else {
      resultsDiv.innerHTML = `
        <h2 class="section-title">${filter.charAt(0).toUpperCase() + filter.slice(1)}s</h2>
        <div class="card-grid" id="mainSection"></div>
      `;

      const res = await fetch(`/deezer/search?q=${encodeURIComponent(query)}&filter=${filter}`);
      const data = await res.json();
      const container = document.getElementById('mainSection');

      if (filter === 'track') {
        data.data.forEach((track) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="${track.album.cover_medium}" style="width:100%; border-radius:10px;">
            <h4>${track.title}</h4>
            <small>${track.artist.name}</small><br/>
          `;
          container.appendChild(card);

          setupTrackClick(card, track);
        });
      }

      if (filter === 'artist') {
        data.data.forEach((artist) => {
          const card = document.createElement('div');
          card.className = 'card artist';
          card.innerHTML = `
            <img src="${artist.picture_medium}" style="width:100px; border-radius:50%; margin-bottom: 10px;">
            <p class="caption">${artist.name}</p>
          `;
          container.appendChild(card);
        });
      }

      if (filter === 'album') {
        data.data.forEach((album) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="${album.cover_medium}" style="width:100%; border-radius:10px;">
            <h4>${album.title}</h4>
            <small>${album.artist.name}</small>
          `;
          container.appendChild(card);
        });
      }
    }

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = '<p style="color: red;">Error loading results.</p>';
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest(".track-dropdown-button");
  const menu = button?.nextElementSibling;

  if (button && menu) {
    // Close other menus
    document.querySelectorAll(".track-dropdown-menu").forEach((m) => m.classList.remove("active"));
    menu.classList.add("active");

    const durationParts = button.dataset.duration.split(":");
    const durationSeconds = durationParts.length === 2
      ? parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10)
      : parseInt(button.dataset.duration, 10);

    const trackData = {
      title: button.dataset.title || "Unknown Track",
      album: button.dataset.album || "Unknown Album",
      artist: button.dataset.artist || "Unknown Artist",
      duration: durationSeconds || 30, 
      albumCover: button.dataset.cover || "/images/album-placeholder.png", // Fallback image
      previewUrl: button.dataset.preview || "", 
      //deezerId: button.dataset.deezerId || "" 
    };

    // Initial menu with options
    menu.innerHTML = `
      <div class="dropdown-option" data-action="queue">▶ Add to Queue</div>
      <div class="dropdown-option" data-action="playlist">➕ Add to Playlist</div>
      ${trackData.previewUrl ? '<div class="dropdown-option" data-action="play">▶ Play Preview</div>' : ''}
    `;
    

    // Event delegation for menu actions
    menu.querySelectorAll(".dropdown-option").forEach(option => {
      option.addEventListener("click", async (e) => {
        const action = e.target.dataset.action;

        if (action === "playlist") {
            const userInfo = JSON.parse(localStorage.getItem("loggedInUser"));
            if (!userInfo || !userInfo.UserID) {
              menu.innerHTML = '<div class="dropdown-option disabled">Please log in first</div>';
              return;
            }

          const res = await fetch(`/api/playlists/user/${userInfo.UserID}`);
          const playlists = await res.json();

          if (playlists.length === 0) {
            menu.innerHTML = '<div class="dropdown-option disabled">No playlists found</div>';
            return;
          }

          const playlistCheckboxes = playlists.map((pl) => `
            <div class="playlist-checkbox">
            <label>${pl.Name}</label>
            <input type="checkbox" data-id="${pl.PlaylistID}">
            </div>
            `).join("");

          menu.innerHTML = `
            <div class="dropdown-option disabled">Add to playlist:</div>
            ${playlistCheckboxes}
            <button class="dropdown-option save-btn" style="background: var(--primary); color: white;">Save</button>
          `;

          
          const selectedPlaylists = [];
  
          menu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            checkbox.addEventListener("change", (e) => {
            const playlistId = e.target.dataset.id;
            if (e.target.checked) {
              selectedPlaylists.push(playlistId);
            } else {
              const index = selectedPlaylists.indexOf(playlistId);
            if (index > -1) selectedPlaylists.splice(index, 1);
              }
            });
          });

  
          menu.querySelector(".save-btn").addEventListener("click", async () => {
            if (selectedPlaylists.length === 0) {
              alert("Please select at least one playlist");
            return;
          }

          try {
            for (const playlistId of selectedPlaylists) {
              const response = await fetch("/api/playlists/addTrack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  playlistId,
                  title: trackData.title,
                  album: trackData.album,
                  artist: trackData.artist,
                  duration: trackData.duration,
                  albumCover: trackData.albumCover,
                  previewUrl: trackData.previewUrl,
                  deezerId: trackData.deezerId
                })
              });

              if (!response.ok) throw new Error("Failed to save track");
            }

            menu.innerHTML = '<div class="dropdown-option disabled" style="color: green;">Saved successfully!</div>';
            setTimeout(() => menu.classList.remove("active"), 1000);
          } catch (error) {
              menu.innerHTML = `<div class="dropdown-option disabled" style="color: red;">Error: ${error.message}</div>`;
            }
          });
        }       

        // Handle other actions here:
        if (action === "queue") {
          console.log("Add to queue:", trackData.title);
          // Implement your queue logic
        }

        if (action === "album") {
          console.log("Open album:", trackData.album);
          // Redirect or open album page
        }

        if (action === "artist") {
          console.log("View artist:", trackData.artist);
          // Redirect or open artist page
        }
      });
    });

    return;
  }

  // Close menus if clicked elsewhere
  if (!event.target.closest(".track-dropdown-container")) {
    document.querySelectorAll(".track-dropdown-menu").forEach((m) => m.classList.remove("active"));
  }
});


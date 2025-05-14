var isLoggedIn = false;
var playlistDiv = document.querySelector(".sidebar-playlist");
let isPlaylistOpen = false;
let isSettingsOpen = false;
let searchContent = document.getElementById("search-results");
let playlistContent = document.getElementById("playlist-content");
let currentPlaylistID = null;
let loadedPlaylists = [];

function toggleSettings() {
  var settingsDiv = document.getElementById("settings-content");
  if (settingsDiv) settingsDiv.style.display = isSettingsOpen ? "" : "none";
  isSettingsOpen = !isSettingsOpen;

  var accountName = document.querySelector("#settings-content .account-info .account-name");
  var accountDate = document.querySelector("#settings-content .account-info .account-date");

  const userInfo = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  const userId = userInfo ? userInfo.UserID : null;
}

function checkTextSize() {
  var text = document.querySelector("#settings-content .accessibility span");
  const size = document.querySelector("#settings-content .accessibility .text-size").value.trim();
  const textSizes = ["smallest", "small", "default", "large", "largest"];
  text.innerText = textSizes[size];
}
document.querySelector("#settings-content .accessibility .text-size").addEventListener("change", checkTextSize);
window.addEventListener("DOMContentLoaded", checkTextSize);

async function deleteUser() {
  if (confirm("Are you sure you want to delete this accout? Deleted accounts are permanently removed and cannot be retrived.")) {
    var username = prompt("Enter the username for this account:");
    var password = prompt("Enter the password for this account:");
    var correctPw = await fetch(`/search-userpw?Username=${encodeURIComponent(username)}?Password=${encodeURIComponent(password)}`);
    if (correctPw === true) {
      if (confirm("Permanently delete this account?")) {
        console.log("account deleted");
      } else {
        console.log("deletion canceled");
      }
    } else {
      alert("Incorrect account details");
    }
  } else {
    console.log("canceled");
  }
}

async function loadPlaylists(userId) {
  playlistDiv.innerHTML = "";
  const res = await fetch(`/api/playlists/user/${userId}`);
  const playlists = await res.json();
  loadedPlaylists = playlists;

  playlists.forEach((playlist) => {
    const playlistButton = document.createElement("div");
    playlistButton.className = "sidebar-item";
    playlistButton.id = playlist.PlaylistID;
    playlistButton.setAttribute("data-name", playlist.Name);
    const pinIcon = playlist.Pinned ? '<i class="fas fa-thumbtack" style="margin-right: 4px;"></i>' : '';
    playlistButton.innerHTML = `<i class="fas fa-music"></i> <span>${pinIcon}${playlist.Name}</span>`;
    playlistDiv.appendChild(playlistButton);
  });
}
// create playlists
async function createPlaylist() {
  const playlistName = prompt("Enter playlist name:");
  if (!playlistName) return;

  const userInfo = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
  const userId = userInfo ? userInfo.UserID : null;
  if (!userId) {
    alert("Please log in to create playlists.");
    return;
  }

  const res = await fetch('/api/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name: playlistName })
  });

  if (res.ok) loadPlaylists(userId);
  else alert('Failed to create playlist');
}

async function openPlaylist(playlistID, playlistName) {
  currentPlaylistID = playlistID;
  const res = await fetch(`/api/playlists/${playlistID}/tracks`);
  const tracks = await res.json();

  searchContent.style.display = "none";
  playlistContent.style.display = "block";
  isPlaylistOpen = true;

  const playlistNameEl = document.querySelector(".playlist-name");
  playlistNameEl.textContent = playlistName;

  const oldTags = document.querySelector(".tag-row");
  if (oldTags) oldTags.remove();

  const selectedPlaylist = loadedPlaylists.find((p) => p.PlaylistID === playlistID);
  const tags = selectedPlaylist && selectedPlaylist.Tags ? JSON.parse(selectedPlaylist.Tags) : [];
  const tagHtml = tags.map((tag) => `<span class="tag">${tag}</span>`).join(" ");
  playlistNameEl.insertAdjacentHTML("afterend", `<div class="tag-row">${tagHtml}</div>`);

  let totalDuration = 0;
  tracks.forEach((track) => {
    if (typeof track.Duration === "string" && track.Duration.includes(":")) {
      const [min, sec] = track.Duration.split(":").map(Number);
      totalDuration += min * 60 + sec;
    } else if (!isNaN(track.Duration)) {
      totalDuration += parseInt(track.Duration, 10);
    }
  });

  document.querySelector(".playlist-numsong .playlist-data").textContent = tracks.length;
  document.querySelector(".playlist-duration .playlist-data").textContent =
    `${Math.floor(totalDuration / 60)}:${String(totalDuration % 60).padStart(2, "0")}`;

  const songsDiv = document.querySelector("#playlist-content .songs");
  songsDiv.innerHTML = "";

  tracks.forEach((track, index) => {
    const row = document.createElement("div");
    row.classList.add("playlist-row");

    let durationText = typeof track.Duration === "number"
      ? `${Math.floor(track.Duration / 60)}:${(track.Duration % 60).toString().padStart(2, '0')}`
      : track.Duration;

    const coverUrl = track.AlbumCover || "fallback.jpg";
    const previewUrl = track.PreviewURL || "";

    row.innerHTML = `
    <div class="song-number">${index + 1}</div>
      <div class="song-info">
        <img src="${coverUrl}" class="song-img" alt="${track.Title}" 
          onerror="this.src='/images/album-placeholder.png'">
        <div class="song-info-text">
        <div class="title">${track.Title || 'Unknown Track'}</div>
        <div class="artist">${track.Artist || 'Unknown Artist'}</div>
      </div>
    </div>
    <div class="song-date">${new Date(track.DateAdded).toLocaleDateString()}</div>
    <div class="song-album">${track.Album || 'Unknown Album'}</div>
    <div class="song-duration">${durationText}</div>
    `;

    row.querySelector(".song-img").addEventListener("click", () => {
      if (previewUrl) {
        document.getElementById("nowPlayingImg").src = coverUrl;
        document.getElementById("nowPlayingTitle").textContent = track.Title;
        document.getElementById("nowPlayingArtist").textContent = track.Artist;
        const audio = document.getElementById("mainAudioPlayer");
        audio.src = previewUrl;
        audio.play();
      } else {
        alert("No preview available.");
      }
    });

    songsDiv.appendChild(row);
  });
}

document.querySelector(".sidebar-playlist").addEventListener("click", function (event) {
  const item = event.target.closest(".sidebar-item");
  if (item) openPlaylist(item.id, item.getAttribute("data-name"));
});

function closePlaylist() {
  if (isPlaylistOpen) {
    playlistContent.style.display = "none";
    searchContent.style.display = "block";
    isPlaylistOpen = false;
  }
}
document.getElementById("searchInput").addEventListener("click", closePlaylist);

function sort(order) {
  const playlistContainer = document.querySelector(".sidebar-playlist");
  const allPlaylists = Array.from(playlistContainer.querySelectorAll(".sidebar-item"));

  allPlaylists.sort((a, b) => {
    const nameA = a.querySelector("span").textContent.trim().toLowerCase();
    const nameB = b.querySelector("span").textContent.trim().toLowerCase();
    return order === "AZ" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });

  playlistContainer.innerHTML = "";
  allPlaylists.forEach(el => playlistContainer.appendChild(el));
}

let sortingAZ = false;
function playlistSortAZ() {
  const icon = document.getElementById("sortAZ");
  if (!sortingAZ) {
    icon.classList.replace("fa-arrow-up-a-z", "fa-arrow-up-z-a");
    sort("AZ");
  } else {
    icon.classList.replace("fa-arrow-up-z-a", "fa-arrow-up-a-z");
    sort("ZA");
  }
  sortingAZ = !sortingAZ;
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.reload();
}

function showUserUI(username) {
  const loginButtons = document.getElementsByClassName("login");
  const accountButton = document.querySelector(".account");
  const settingsButton = document.querySelector(".btn-secondary");
  for (let btn of loginButtons) btn.style.display = username ? "none" : "";
  if (accountButton) {
    accountButton.style.display = username ? "" : "none";
    accountButton.textContent = username ? `${username} (Account)` : "Account";
    accountButton.onclick = () => { window.location = "/account.html"; };
  }
  if (settingsButton) {
    settingsButton.onclick = username
      ? () => { window.location = "/account.html"; }
      : () => { alert("Settings page coming soon!"); };
    settingsButton.title = username ? "Account" : "Settings";
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = username ? "" : "none";

  const settingsBtn = document.getElementById("settingsBtn");
  if (settingsBtn) settingsBtn.style.display = username ? "" : "none";
}

// Dropdown menu logic
document.addEventListener("click", (event) => {
  const menu = document.querySelector(".playlist-menu");
  if (event.target.closest(".playlist-options")) {
    menu.classList.toggle("hidden");
    return;
  }
  if (!event.target.closest(".playlist-menu")) {
    menu.classList.add("hidden");
  }
});

document.getElementById("sortAZ").addEventListener("click", playlistSortAZ);

/*
window.addEventListener("DOMContentLoaded", () => {
  console.log("dom loaded");
  const userInfo = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (userInfo && userInfo.UserID) {
    isLoggedIn = true;
    console.log("user is logged in");
    showUserUI(userInfo.Username);
    loadPlaylists(userInfo.UserID);
  } else {
    isLoggedIn = false;
    console.log("user is not logged in");
    showUserUI(null);
  }
});
*/

function loadLoggedIn() {
  const userInfo = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (userInfo && userInfo.UserID) {
    isLoggedIn = true;
    showUserUI(userInfo.Username);
    loadPlaylists(userInfo.UserID);
  } else {
    isLoggedIn = false;
    showUserUI(null);
  }
}

if (document.readyState !== 'loading') {
  console.log("readystate called");
  loadLoggedIn();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("event listener called");
    loadLoggedIn();
  });
}

  document.getElementById("rename-playlist").addEventListener("click", async () => {
    const newName = prompt("Enter new playlist name:");
    if (!newName) return;

    const res = await fetch(`/api/playlists/${currentPlaylistID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });

    if (res.ok) {
      loadPlaylists(JSON.parse(localStorage.getItem("loggedInUser")).UserID);
      document.querySelector(".playlist-name").textContent = newName;
      document.querySelector(".playlist-menu").classList.add("hidden");
    } else {
      alert("Failed to rename playlist.");
    }
  });
// === Playlist Search Logic ===
function searchPlaylist() {
  const search = document.querySelector("input[name='playlist-search']").value.toLowerCase();
  const playlists = document.querySelectorAll(".sidebar-playlist > div");

  playlists.forEach((element) => {
    const textObj = element.querySelector("span");
    const name = textObj.textContent.toLowerCase();
    if (search.length === 0) {
      textObj.style.color = '#fafafa';
    } else if (name.includes(search)) {
      textObj.style.color = '#00bcd4';
    } else {
      textObj.style.color = '#fafafa';
    }
  });
}

document.querySelector("input[name='playlist-search']")
  .addEventListener("input", searchPlaylist);

  document.getElementById("delete-playlist").addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete this playlist?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/playlists/${currentPlaylistID}`, {
      method: "DELETE"
    });

    if (res.ok) {
      loadPlaylists(JSON.parse(localStorage.getItem("loggedInUser")).UserID);
      document.getElementById("playlist-content").style.display = "none";
      document.getElementById("search-results").style.display = "block";
    } else {
      alert("Failed to delete playlist.");
    }
  });

  document.getElementById("toggle-pin").addEventListener("click", async () => {
    const isPinned = confirm("Pin this playlist?");
    const res = await fetch(`/api/playlists/${currentPlaylistID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: isPinned })
    });

    if (res.ok) {
      loadPlaylists(JSON.parse(localStorage.getItem("loggedInUser")).UserID);
      document.querySelector(".playlist-menu").classList.add("hidden");
    } else {
      alert("Failed to update pin status.");
    }
  });

  document.getElementById("edit-tags").addEventListener("click", async () => {
    const newTags = prompt("Enter tags (comma-separated):");
    if (!newTags) return;

    const res = await fetch(`/api/playlists/${currentPlaylistID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags.split(',').map(t => t.trim()) }),
    });

    if (res.ok) {
      alert("Tags updated!");
      document.querySelector(".playlist-menu").classList.add("hidden");
    } else {
      alert("Failed to update tags.");
    }
  });

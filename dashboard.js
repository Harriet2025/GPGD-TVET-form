const TRACKS_ENDPOINT = "/api/tracks";
const ENROLL_ENDPOINT = "/api/enroll";

const tracksGrid = document.getElementById("tracks-grid");
const tracksStatus = document.getElementById("tracks-status");
const toast = document.getElementById("toast");
const memberNameEl = document.getElementById("member-name");
const memberAvatarEl = document.getElementById("member-avatar");

let toastTimer = null;

function getMemberId() {
  return localStorage.getItem("member_id");
}

function getMemberName() {
  return localStorage.getItem("member_name") || "Member";
}

function initMemberInfo() {
  const name = getMemberName();
  memberNameEl.textContent = name;
  memberAvatarEl.textContent = name.trim().charAt(0).toUpperCase() || "M";
}

function showToast(message, type) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = "toast show" + (type ? ` ${type}` : "");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function durationIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 7v5l3 2"></path>
  </svg>`;
}

function renderSkeletons(count) {
  tracksGrid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "track-card skeleton";
    card.innerHTML = `
      <div class="skeleton-line w-40"></div>
      <div class="skeleton-line w-70"></div>
      <div class="skeleton-line w-40"></div>
      <div class="skeleton-line w-50"></div>
    `;
    tracksGrid.appendChild(card);
  }
}

function createTrackCard(track) {
  const card = document.createElement("div");
  card.className = "track-card";
  card.dataset.trackId = track.track_id;

  card.innerHTML = `
    <div class="track-card-top">
      <span class="track-code">${escapeHtml(track.code)}</span>
    </div>
    <h3 class="track-title">${escapeHtml(track.title)}</h3>
    <div class="track-duration">${durationIcon()}<span>${escapeHtml(track.duration)}</span></div>
    <button type="button" class="track-enroll-btn" data-track-id="${escapeHtml(String(track.track_id))}">
      Enroll
    </button>
  `;

  const enrollBtn = card.querySelector(".track-enroll-btn");
  enrollBtn.addEventListener("click", () => handleEnroll(track.track_id, enrollBtn));

  return card;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

async function loadTracks() {
  tracksStatus.hidden = false;
  tracksStatus.textContent = "Loading tracks...";
  tracksStatus.classList.remove("error");
  renderSkeletons(6);

  try {
    const response = await fetch(TRACKS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to load tracks (status ${response.status}).`);
    }

    const tracks = await response.json();

    tracksGrid.innerHTML = "";

    if (!Array.isArray(tracks) || tracks.length === 0) {
      tracksStatus.textContent = "No active tracks are available right now.";
      return;
    }

    tracksStatus.hidden = true;
    tracks.forEach((track) => {
      tracksGrid.appendChild(createTrackCard(track));
    });
  } catch (error) {
    tracksGrid.innerHTML = "";
    tracksStatus.hidden = false;
    tracksStatus.classList.add("error");
    tracksStatus.textContent = error.message || "Something went wrong while loading tracks.";
  }
}

async function handleEnroll(trackId, button) {
  const memberId = getMemberId();

  if (!memberId) {
    showToast("You must be logged in to enroll in a track.", "error");
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Enrolling...";

  try {
    const response = await fetch(ENROLL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        track_id: trackId,
        member_id: memberId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Enrollment failed (status ${response.status}).`);
    }

    button.textContent = "Enrolled";
    button.classList.add("enrolled");
    showToast("You have successfully enrolled in this track.", "success");
  } catch (error) {
    button.disabled = false;
    button.textContent = originalText;
    showToast(error.message || "Something went wrong. Please try again.", "error");
  }
}

initMemberInfo();
loadTracks();

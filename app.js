const state = {
  mode: "Autonomous",
  speed: 0,
  rangeKm: 420,
  traffic: "Light",
  gpsSignal: 12,
  cabinTemp: 22,
  fanLevel: 2,
  media: {
    playing: false,
    track: "No media playing",
  },
  passengers: 0,
  securityLocked: true,
};

const elems = {
  modeLabel: document.getElementById("modeLabel"),
  speedValue: document.getElementById("speedValue"),
  rangeValue: document.getElementById("rangeValue"),
  trafficValue: document.getElementById("trafficValue"),
  connectionStatus: document.getElementById("connectionStatus"),
  timeDisplay: document.getElementById("timeDisplay"),
  nowPlaying: document.getElementById("nowPlaying"),
  cabinTemp: document.getElementById("cabinTemp"),
  fanLevel: document.getElementById("fanLevel"),
  sensorStatus: document.getElementById("sensorStatus"),
  passengerStatus: document.getElementById("passengerStatus"),
  securityStatus: document.getElementById("securityStatus"),
  settingsStatus: document.getElementById("settingsStatus"),
  map: document.getElementById("map"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  modalFooter: document.getElementById("modalFooter"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  modalClose: document.getElementById("modalClose"),
  sidePanel: document.getElementById("sidePanel"),
  sideBackdrop: document.getElementById("sideBackdrop"),
  sideClose: document.getElementById("sideClose"),
  sideBody: document.getElementById("sideBody"),
  sideFooter: document.getElementById("sideFooter"),
  sideTitle: document.getElementById("sideTitle"),
};

const buttons = {
  switchModeBtn: document.getElementById("switchModeBtn"),
  emergencyStopBtn: document.getElementById("emergencyStopBtn"),
  rerouteBtn: document.getElementById("rerouteBtn"),
  parkBtn: document.getElementById("parkBtn"),
  destBtn: document.getElementById("destBtn"),
  sensorTestBtn: document.getElementById("sensorTestBtn"),
  tempDown: document.getElementById("tempDown"),
  tempUp: document.getElementById("tempUp"),
  fanToggle: document.getElementById("fanToggle"),
  prevTrack: document.getElementById("prevTrack"),
  playPause: document.getElementById("playPause"),
  nextTrack: document.getElementById("nextTrack"),
  browseMediaBtn: document.getElementById("browseMediaBtn"),
  comfortModeBtn: document.getElementById("comfortModeBtn"),
  lockToggleBtn: document.getElementById("lockToggleBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
};

const modal = {
  open({ title, body, footer }) {
    elems.modalTitle.textContent = title;
    elems.modalBody.innerHTML = body;
    elems.modalFooter.innerHTML = "";

    if (footer) {
      footer.forEach((btn) => {
        const button = document.createElement("button");
        button.className = "card-btn";
        button.textContent = btn.label;
        button.addEventListener("click", () => {
          btn.onClick();
          if (btn.closeOnClick !== false) modal.close();
        });
        elems.modalFooter.appendChild(button);
      });
    }

    elems.modal.setAttribute("aria-hidden", "false");
  },
  close() {
    elems.modal.setAttribute("aria-hidden", "true");
  },
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function updateFooter() {
  elems.timeDisplay.textContent = formatTime(new Date());
  elems.connectionStatus.textContent = `Connected • GPS: ${state.gpsSignal} sats`;
}

function updateStatus() {
  elems.modeLabel.textContent = state.mode;
  elems.speedValue.textContent = `${state.speed} km/h`;
  elems.rangeValue.textContent = `${state.rangeKm} km`;
  elems.trafficValue.textContent = state.traffic;
  elems.cabinTemp.textContent = `${state.cabinTemp}°C`;
  elems.fanLevel.textContent = state.fanLevel;
  elems.nowPlaying.textContent = state.media.track;
  elems.sensorStatus.textContent = state.sensorsHealthy ? "All operational" : "Sensor alert";
  elems.passengerStatus.textContent =
    state.passengers === 0
      ? "No occupants detected"
      : `${state.passengers} passenger${state.passengers === 1 ? "" : "s"} onboard`;
  elems.securityStatus.textContent = state.securityLocked ? "All doors locked" : "Unlocked";
  elems.settingsStatus.textContent = "Tap to customize";
}

function panicStop() {
  state.speed = 0;
  state.mode = "Manual";
  state.traffic = "Stopped";
  updateStatus();

  modal.open({
    title: "Emergency Stop Activated",
    body: "The vehicle is stopping immediately. Please wait while systems stabilize.",
    footer: [
      {
        label: "Acknowledge",
        onClick: () => {
          state.mode = "Autonomous";
          updateStatus();
        },
      },
    ],
  });
}

function toggleMode() {
  state.mode = state.mode === "Autonomous" ? "Manual" : "Autonomous";
  updateStatus();
  modal.open({
    title: "Drive Mode",
    body: `Switched to <strong>${state.mode}</strong> drive mode.`,
    footer: [
      {
        label: "Got it",
        onClick: () => {},
      },
    ],
  });
}

function adjustTemp(delta) {
  state.cabinTemp = Math.min(28, Math.max(16, state.cabinTemp + delta));
  updateStatus();
}

function toggleFan() {
  state.fanLevel = state.fanLevel === 0 ? 2 : 0;
  updateStatus();
}

function toggleLock() {
  state.securityLocked = !state.securityLocked;
  updateStatus();
}

function togglePlay() {
  state.media.playing = !state.media.playing;
  state.media.track = state.media.playing ? "Driving playlist" : "No media playing";
  updateStatus();
}

function skipTrack(delta) {
  const playlist = [
    "Driving playlist",
    "Road trip mix",
    "Podcast: Autonomy & Safety",
    "Ambient drive" ,
    "City commute beats",
  ];
  const currentIndex = playlist.indexOf(state.media.track);
  const nextIndex = (currentIndex + delta + playlist.length) % playlist.length;
  state.media.track = playlist[nextIndex];
  state.media.playing = true;
  updateStatus();
}

function simulateGps() {
  const drift = Math.random() * 0.4 - 0.2;
  state.gpsSignal = Math.min(14, Math.max(4, state.gpsSignal + drift));
}

function simulateDrive() {
  if (state.mode === "Autonomous") {
    state.speed = Math.min(110, state.speed + Math.random() * 2 - 0.1);
  } else {
    state.speed = Math.max(0, state.speed + Math.random() * 2 - 1);
  }

  state.rangeKm = Math.max(75, state.rangeKm - state.speed / 120);
  state.traffic = ["Light", "Moderate", "Heavy"][Math.floor(Math.random() * 3)];

  if (Math.random() < 0.01) {
    state.sensorsHealthy = false;
  }

  updateStatus();
  simulateGps();
}

function showAction(title, message) {
  modal.open({
    title,
    body: message,
    footer: [
      {
        label: "Close",
        onClick: () => {},
      },
    ],
  });
}

function closeSidePanel() {
  elems.sidePanel.setAttribute("aria-hidden", "true");
  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab) activeTab.classList.remove("active");
}

function renderSidePanel(type) {
  const titleMap = {
    media: "Media Library",
    safety: "Safety Center",
    settings: "Settings",
  };

  const bodyRenderers = {
    media: () => {
      return `
        <section class="side-panel__section">
          <h3>Now Playing</h3>
          <div class="side-panel__text">${state.media.track}</div>
        </section>
        <section class="side-panel__section">
          <h3>Playlists</h3>
          <ul class="side-panel__list">
            <li><button data-track="Driving playlist">Driving playlist</button></li>
            <li><button data-track="Road trip mix">Road trip mix</button></li>
            <li><button data-track="Podcast: Autonomy & Safety">Podcast: Autonomy & Safety</button></li>
            <li><button data-track="Ambient drive">Ambient drive</button></li>
            <li><button data-track="City commute beats">City commute beats</button></li>
          </ul>
        </section>
      `;
    },
    safety: () => {
      return `
        <section class="side-panel__section">
          <h3>Health</h3>
          <div class="side-panel__text">Sensors: ${state.sensorsHealthy ? "All operational" : "Attention required"}</div>
          <div class="side-panel__text">Mode: ${state.mode}</div>
          <div class="side-panel__text">Speed: ${Math.round(state.speed)} km/h</div>
          <div class="side-panel__text">Traffic: ${state.traffic}</div>
        </section>
        <section class="side-panel__section">
          <h3>Quick Actions</h3>
          <ul class="side-panel__list">
            <li><button data-action="emergency">Emergency Stop</button></li>
            <li><button data-action="selfTest">Run Sensor Self-Test</button></li>
          </ul>
        </section>
      `;
    },
    settings: () => {
      return `
        <section class="side-panel__section">
          <h3>Preferences</h3>
          <ul class="side-panel__list">
            <li><button data-action="toggleNightMode">Night mode</button></li>
            <li><button data-action="toggleNotifications">Notifications</button></li>
            <li><button data-action="resetDefaults">Reset defaults</button></li>
          </ul>
        </section>
      `;
    },
  };

  elems.sideTitle.textContent = titleMap[type] || "Features";
  elems.sideBody.innerHTML = (bodyRenderers[type] || (() => ""))();
  elems.sideFooter.innerHTML = "";

  // Wire item buttons
  elems.sideBody.querySelectorAll("button").forEach((btn) => {
    const track = btn.dataset.track;
    const action = btn.dataset.action;

    if (track) {
      btn.addEventListener("click", () => {
        state.media.track = track;
        state.media.playing = true;
        updateStatus();
        renderSidePanel("media");
      });
      return;
    }

    if (action) {
      btn.addEventListener("click", () => {
        if (action === "emergency") {
          panicStop();
        }
        if (action === "selfTest") {
          state.sensorsHealthy = true;
          updateStatus();
          showAction("Sensor Self-Test", "Running diagnostics on cameras, lidar, radar, and ultrasonic sensors.\n\nAll systems nominal.");
        }
        if (action === "toggleNightMode") {
          document.body.classList.toggle("night-mode");
          showAction("Night Mode", `Night mode ${document.body.classList.contains("night-mode") ? "enabled" : "disabled"}.`);
        }
        if (action === "toggleNotifications") {
          showAction("Notifications", "Notification preferences can be managed in the full settings screen.");
        }
        if (action === "resetDefaults") {
          showAction("Reset Defaults", "Restored to default preferences.");
        }
      });
    }
  });

  elems.sidePanel.setAttribute("aria-hidden", "false");
}

function setupEventListeners() {
  buttons.switchModeBtn.addEventListener("click", toggleMode);
  buttons.emergencyStopBtn.addEventListener("click", panicStop);

  buttons.rerouteBtn.addEventListener("click", () => {
    showAction("Reroute", "Searching for a faster route based on traffic conditions.");
  });

  buttons.parkBtn.addEventListener("click", () => {
    showAction("Find Parking", "Scanning nearby parking spots...\n\nSelecting a safe spot near your destination.");
  });

  buttons.destBtn.addEventListener("click", () => {
    modal.open({
      title: "Set Destination",
      body: `<p>Tap on the map to choose a destination, or type an address.</p>
        <input id=\"destinationInput\" class=\"modal-input\" placeholder=\"e.g. 123 Main St\" />`,
      footer: [
        {
          label: "Set",
          onClick: () => {
            const input = document.getElementById("destinationInput");
            const dest = (input && input.value.trim()) || "City Center";
            showAction("Destination Set", `Navigating to <strong>${dest}</strong>.`);
          },
        },
      ],
    });
  });

  buttons.sensorTestBtn.addEventListener("click", () => {
    showAction("Sensor Self-Test", "Running diagnostics on cameras, lidar, radar, and ultrasonic sensors.\n\nAll systems nominal.");
  });

  buttons.tempDown.addEventListener("click", () => adjustTemp(-1));
  buttons.tempUp.addEventListener("click", () => adjustTemp(1));
  buttons.fanToggle.addEventListener("click", toggleFan);

  buttons.playPause.addEventListener("click", togglePlay);
  buttons.prevTrack.addEventListener("click", () => skipTrack(-1));
  buttons.nextTrack.addEventListener("click", () => skipTrack(1));
  buttons.browseMediaBtn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
    const mediaTab = document.querySelector(".tab-btn[data-panel='media']");
    if (mediaTab) mediaTab.classList.add("active");
    renderSidePanel("media");
  });

  buttons.comfortModeBtn.addEventListener("click", () => {
    showAction("Comfort Mode", "Adaptive climate, seating ergonomics, and cabin lighting activated.");
  });

  buttons.lockToggleBtn.addEventListener("click", toggleLock);

  buttons.settingsBtn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
    const settingsTab = document.querySelector(".tab-btn[data-panel='settings']");
    if (settingsTab) settingsTab.classList.add("active");
    renderSidePanel("settings");
  });

  elems.modalBackdrop.addEventListener("click", modal.close);
  elems.modalClose.addEventListener("click", modal.close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      modal.close();
      closeSidePanel();
    }
  });

  elems.sideBackdrop.addEventListener("click", closeSidePanel);
  elems.sideClose.addEventListener("click", closeSidePanel);

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderSidePanel(button.dataset.panel);
    });
  });
}

function init() {
  state.sensorsHealthy = true;
  state.passengers = 2;
  updateStatus();
  updateFooter();
  setupEventListeners();

  setInterval(() => {
    updateFooter();
  }, 30_000);

  setInterval(() => {
    simulateDrive();
  }, 2_000);

  // Touch-friendly map placeholder animation.
  const map = elems.map;
  let t = 0;
  setInterval(() => {
    t += 0.8;
    map.textContent = `Map view — (${Math.floor(37.7 + Math.sin(t) * 0.02).toFixed(2)}, ${Math.floor(-122.4 + Math.cos(t) * 0.02).toFixed(2)})`;
  }, 1700);
}

init();

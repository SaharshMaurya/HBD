document.addEventListener("DOMContentLoaded", () => {
  const soloPhotos = Array.isArray(SOLO_PHOTOS) && SOLO_PHOTOS.length > 0
    ? SOLO_PHOTOS.map((f) => `images/${encodeURIComponent(f)}`)
    : [];

  const friendGroupPhotos = Array.isArray(FRIEND_GROUP_PHOTOS) && FRIEND_GROUP_PHOTOS.length > 0
    ? FRIEND_GROUP_PHOTOS.map((f) => `images/${encodeURIComponent(f)}`)
    : [];

  const galaxyPhotos = Array.isArray(GALAXY_PHOTOS) && GALAXY_PHOTOS.length > 0
    ? GALAXY_PHOTOS.map((f) => `images/${encodeURIComponent(f)}`)
    : [];

  const getFromList = (list, idx) => {
    if (!list || list.length === 0) return null;
    return list[((idx % list.length) + list.length) % list.length];
  };

  // --- Confetti Engine ---
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function launchConfetti(count = 110) {
    const colors = ["#ff4d88", "#ffb703", "#ff8fa3", "#a0c4ff", "#cdb4db", "#fff"];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 280,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 13 - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        gravity: 0.35
      });
    }
  }

  function loopConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
      if (p.y > canvas.height + 24) particles.splice(i, 1);
    });
    requestAnimationFrame(loopConfetti);
  }
  loopConfetti();

  // =========================================================================
  // MULTI-PAGE NAVIGATION WITH ENVELOPE & CURTAIN TRANSITIONS
  // =========================================================================
  const pages = Array.from(document.querySelectorAll(".page"));
  const curtainOverlay = document.getElementById("curtain-overlay");
  const envelopeOverlay = document.getElementById("envelope-overlay");
  const finalPageIndex = pages.length - 1;

  let currentPage = 0;
  let isTransitioning = false;

  function activatePage(index) {
    pages.forEach((p, i) => p.classList.toggle("active", i === index));
    currentPage = index;

    if (index === 1) {
      renderRibbon(soloPhotos);
    }
    if (index === 4) {
      renderJourney();
    }
    if (index === finalPageIndex) {
      playChat();
    }
  }

  function goToPage(targetIndex, transitionType = "curtain") {
    if (isTransitioning || targetIndex === currentPage || targetIndex < 0 || targetIndex >= pages.length) {
      return;
    }
    isTransitioning = true;

    if (transitionType === "envelope") {
      envelopeOverlay.classList.add("active");
      setTimeout(() => {
        envelopeOverlay.classList.add("opened");
        launchConfetti(65);
      }, 220);

      setTimeout(() => {
        activatePage(targetIndex);
      }, 620);

      setTimeout(() => {
        envelopeOverlay.classList.remove("active", "opened");
        isTransitioning = false;
      }, 980);
    } else {
      curtainOverlay.classList.add("closed");
      setTimeout(() => {
        activatePage(targetIndex);
      }, 680);

      setTimeout(() => {
        curtainOverlay.classList.remove("closed");
      }, 860);

      setTimeout(() => {
        isTransitioning = false;
      }, 1500);
    }
  }

  document.querySelectorAll(".next-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const trans = btn.dataset.transition || "curtain";
      goToPage(currentPage + 1, trans);
    });
  });

  document.querySelectorAll(".prev-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const trans = btn.dataset.transition || "curtain";
      goToPage(currentPage - 1, trans);
    });
  });

  document.getElementById("restart-all-btn").addEventListener("click", () => {
    goToPage(0, "curtain");
  });

  // --- Page 1: Candle Date Intro ---
  const candleTrigger = document.getElementById("candle-trigger");
  const ageNumberEl = document.getElementById("age-number");
  const enterSiteBtn = document.getElementById("enter-site-btn");

  if (ageNumberEl && typeof BIRTHDAY_NUMBER !== "undefined") {
    ageNumberEl.textContent = BIRTHDAY_NUMBER;
  }

  candleTrigger.addEventListener("click", () => {
    candleTrigger.classList.add("lit");
    launchConfetti(90);
  });

  enterSiteBtn.addEventListener("click", () => {
    goToPage(1, "envelope");
  });

  // --- Page 2: Solo Ribbon Carousel (1.jpg to 6.jpg, Fits Screen Width, No Scrollbar) ---
  const ribbonWrap = document.getElementById("ribbon-track-wrap");
  const ribbonTrack = document.getElementById("ribbon-track");

  function getFitCount() {
    const availableWidth = ribbonWrap.clientWidth || Math.min(window.innerWidth - 48, 1160);
    const avgCardWidth = 175;
    const gap = 16;
    return Math.max(1, Math.floor((availableWidth + gap) / (avgCardWidth + gap)));
  }

  function renderRibbon(list) {
    ribbonTrack.innerHTML = "";
    const fitCount = getFitCount();
    const displayCount = list.length > 0 ? Math.min(list.length, fitCount) : fitCount;

    for (let i = 0; i < displayCount; i++) {
      const card = document.createElement("div");
      card.className = "ribbon-card";
      const src = list.length ? list[i] : null;
      card.innerHTML = src
        ? `<img src="${src}" alt="Solo photo ${i + 1}" />`
        : `<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#ffeaf0;border-radius:9px;color:#b5486e;font-weight:600;padding:8px;text-align:center;font-size:0.82rem;">Add 1.jpg–6.jpg to images/</div>`;
      card.addEventListener("click", () => {
        card.classList.toggle("active");
        launchConfetti(25);
      });
      ribbonTrack.appendChild(card);
    }
  }

  renderRibbon(soloPhotos);
  window.addEventListener("resize", () => renderRibbon(soloPhotos));

  // --- Page 3: Draggable Board (7 Friend Group Photos) ---
  const boardLayer = document.getElementById("polaroid-board-layer");

  const friendCount = 7;
  const presetPositions = [
    { left: "4%", top: "7%", rot: -4 },
    { left: "31%", top: "5%", rot: 3 },
    { left: "58%", top: "8%", rot: -2 },
    { left: "79%", top: "14%", rot: 4 },
    { left: "14%", top: "54%", rot: 3 },
    { left: "44%", top: "52%", rot: -3 },
    { left: "72%", top: "55%", rot: 2 }
  ];

  for (let i = 0; i < friendCount; i++) {
    const el = document.createElement("div");
    el.className = "board-polaroid";
    const pos = presetPositions[i] || { left: "10%", top: "10%", rot: 0 };
    el.style.left = pos.left;
    el.style.top = pos.top;
    el.style.transform = `rotate(${pos.rot}deg)`;

    const src = friendGroupPhotos[i] || getFromList(soloPhotos, i);
    const cap = CAPTIONS[i % CAPTIONS.length];
    el.innerHTML = src
      ? `<img src="${src}" alt="${cap}" /><div class="mini-label">${cap}</div>`
      : `<div style="width:140px;height:120px;background:#ffeef3;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#b5486e;font-size:0.8rem;padding:6px;text-align:center;">images/</div><div class="mini-label">${cap}</div>`;

    let dragging = false, offsetX = 0, offsetY = 0;
    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });
    el.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const parentRect = boardLayer.getBoundingClientRect();
      const nx = Math.max(0, Math.min(e.clientX - parentRect.left - offsetX, parentRect.width - el.offsetWidth));
      const ny = Math.max(0, Math.min(e.clientY - parentRect.top - offsetY, parentRect.height - el.offsetHeight));
      el.style.left = `${nx}px`;
      el.style.top = `${ny}px`;
    });
    el.addEventListener("pointerup", () => {
      dragging = false;
    });

    boardLayer.appendChild(el);
  }

  // --- Page 4: Galaxy Page (Photos 14+, Star Shapes + Clickable Comets) ---
  const starNodesLayer = document.getElementById("star-nodes-layer");
  const meteorLayer = document.getElementById("meteor-layer");
  const starPopup = document.getElementById("star-photo-popup");
  const starPopupImg = document.getElementById("star-popup-img");
  const starPopupCaption = document.getElementById("star-popup-caption");
  const starPopupNote = document.getElementById("star-popup-note");
  const closeStarPopup = document.getElementById("close-star-popup");

  const meteorModal = document.getElementById("meteor-modal");
  const meteorModalText = document.getElementById("meteor-modal-text");
  const closeMeteorModal = document.getElementById("close-meteor-modal");

  const starSvgMarkup = `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <polygon
        points="24,3 29.6,16.5 44,17.8 33,27.3 36.4,41.5 24,33.9 11.6,41.5 15,27.3 4,17.8 18.4,16.5"
        fill="#ffd166"
        stroke="#fff8d6"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
  `;

  const starCoords = [
    { left: "14%", top: "24%" },
    { left: "30%", top: "68%" },
    { left: "46%", top: "28%" },
    { left: "62%", top: "70%" },
    { left: "78%", top: "30%" },
    { left: "88%", top: "58%" },
    { left: "22%", top: "46%" },
    { left: "54%", top: "48%" },
    { left: "70%", top: "46%" },
    { left: "38%", top: "46%" }
  ];

  const popupNotes = typeof GALAXY_POPUP_NOTES !== "undefined" && GALAXY_POPUP_NOTES.length
    ? GALAXY_POPUP_NOTES
    : ["a favorite moment ✨"];

  const starCount = Math.max(galaxyPhotos.length, 6);
  for (let i = 0; i < starCount; i++) {
    const starBtn = document.createElement("button");
    starBtn.type = "button";
    starBtn.className = "glow-star-btn";
    starBtn.innerHTML = starSvgMarkup;
    const coord = starCoords[i % starCoords.length];
    starBtn.style.left = coord.left;
    starBtn.style.top = coord.top;
    starBtn.style.animationDelay = `${(i * 0.35) % 2.4}s`;
    starBtn.title = "Click a star";

    const photoSrc = getFromList(galaxyPhotos, i);
    const labelText = `Star #${i + 14} ✨`;
    const noteText = popupNotes[i % popupNotes.length];

    starBtn.addEventListener("click", () => {
      if (photoSrc) {
        starPopupImg.src = photoSrc;
        starPopupImg.style.display = "block";
        starPopupCaption.textContent = labelText;
        starPopupNote.textContent = noteText;
      } else {
        starPopupImg.style.display = "none";
        starPopupCaption.textContent = `Add ${14 + i}.jpg in images/`;
        starPopupNote.textContent = noteText;
      }
      starPopup.classList.remove("hidden");
    });

    starNodesLayer.appendChild(starBtn);
  }

  closeStarPopup.addEventListener("click", () => starPopup.classList.add("hidden"));

  const meteorNotes = typeof METEOR_NOTES !== "undefined" && METEOR_NOTES.length
    ? METEOR_NOTES
    : [];

  const meteorSpots = [
    { left: "10%", top: "10%", delay: "0s" },
    { left: "54%", top: "12%", delay: "-2.2s" },
    { left: "14%", top: "82%", delay: "-4.4s" },
    { left: "58%", top: "84%", delay: "-6.6s" }
  ];

  meteorNotes.forEach((msg, idx) => {
    const spot = meteorSpots[idx % meteorSpots.length];
    const cBtn = document.createElement("button");
    cBtn.type = "button";
    cBtn.className = "comet-btn";
    cBtn.style.left = spot.left;
    cBtn.style.top = spot.top;
    cBtn.style.animationDelay = spot.delay;
    cBtn.setAttribute("aria-label", "Click comet to read message");
    cBtn.innerHTML = `<span class="comet-visual"><span class="comet-tail"></span><span class="comet-head"></span></span>`;
    cBtn.addEventListener("click", () => {
      meteorModalText.textContent = msg;
      meteorModal.classList.remove("hidden");
    });
    meteorLayer.appendChild(cBtn);
  });

  closeMeteorModal.addEventListener("click", () => meteorModal.classList.add("hidden"));
  meteorModal.addEventListener("click", (e) => {
    if (e.target === meteorModal) meteorModal.classList.add("hidden");
  });

  // --- Page 5: "didn't realise when we reached from here to here" ---
  const fromHereBox = document.getElementById("from-here-box");
  const toHereBox = document.getElementById("to-here-box");

  function buildCandidateUrls(configuredName, baseStem) {
    const candidates = [];
    if (configuredName) {
      candidates.push(`images/${encodeURIComponent(configuredName)}`);
    }
    const exts = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"];
    exts.forEach((ext) => {
      const url = `images/${baseStem}${ext}`;
      if (!candidates.includes(url)) candidates.push(url);
    });
    return candidates;
  }

  function loadImageSmart(container, candidates, missingLabel) {
    container.innerHTML = "";
    const img = document.createElement("img");
    img.alt = missingLabel;
    let idx = 0;

    function tryNext() {
      if (idx >= candidates.length) {
        container.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#b5486e;padding:12px;text-align:center;">Put ${missingLabel} in images/</div>`;
        return;
      }
      const nextUrl = candidates[idx++];
      img.src = nextUrl;
    }

    img.addEventListener("error", tryNext);
    container.appendChild(img);
    tryNext();
  }

  function renderJourney() {
    const beforeCandidates = buildCandidateUrls(typeof BEFORE_PHOTO !== "undefined" ? BEFORE_PHOTO : "", "before");
    const afterCandidates = buildCandidateUrls(typeof AFTER_PHOTO !== "undefined" ? AFTER_PHOTO : "", "after");
    loadImageSmart(fromHereBox, beforeCandidates, "before.jpg");
    loadImageSmart(toHereBox, afterCandidates, "after.jpg");
  }
  renderJourney();

  // --- Final Page: iPhone Chat Animation ---
  const chatContactName = document.getElementById("chat-contact-name");
  if (chatContactName && typeof PHONE_CONTACT_NAME !== "undefined") {
    chatContactName.textContent = PHONE_CONTACT_NAME;
  }

  const chatThread = document.getElementById("chat-thread");
  const replayChatBtn = document.getElementById("replay-chat-btn");
  let chatTimers = [];

  function playChat() {
    chatTimers.forEach((t) => clearTimeout(t));
    chatTimers = [];
    chatThread.innerHTML = "";

    const msgs = typeof CHAT_MESSAGES !== "undefined" && CHAT_MESSAGES.length
      ? CHAT_MESSAGES
      : [{ sender: "sent", text: "Happy Birthday ingol! ✨" }];

    msgs.forEach((m, idx) => {
      const timer = setTimeout(() => {
        const bubble = document.createElement("div");
        bubble.className = `bubble ${m.sender}`;
        bubble.textContent = m.text;
        chatThread.appendChild(bubble);
        chatThread.scrollTop = chatThread.scrollHeight;
      }, idx * 950);
      chatTimers.push(timer);
    });
  }

  replayChatBtn.addEventListener("click", playChat);
});

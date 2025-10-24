document.addEventListener("DOMContentLoaded", () => {
  const sayHelloBtn = document.getElementById("sayHelloBtn");
  const feedDone = document.getElementById("feedDone");
  const wormVideo = document.getElementById("wormVideo");
  const wormVideoSource = document.getElementById("wormVideoSource");
  const thoughtBubble = document.getElementById("thoughtBubble");
  const thoughtImage = document.getElementById("thoughtImage");
  const foodCarousel = document.getElementById("foodCarousel");
  const choppingBoard = document.getElementById("choppingBoard");
  const cupContainer = document.getElementById("cupContainer");
  const wormContainer = document.querySelector('.worm-container');
  const helloSection = document.querySelector('.hello-section');
  const feedingArea = document.querySelector('.feeding-area');
  const feedingScreen = document.getElementById('feedingScreen');
  const learnScreen = document.getElementById('learnScreen');
  const overviewScreen = document.getElementById('overviewScreen');

  // ---  Mock food data
  const foods = [
    { name: "Tomate", img: "static/foods/Tomate.jpg" },
    { name: "Rucola", img: "static/foods/Rucola.jpg" },
    { name: "Melone", img: "static/foods/Melone.jpg" },
    { name: "Gurke", img: "static/foods/Gurke.jpg" },
    { name: "Kürbis", img: "static/foods/Kuerbis.jpg" },
    { name: "Eis", img: "static/foods/Eis.jpg" }
  ];
  let selectedFoods = [];
  const placedFoods = new Set(); // track foods already on board

  // viewport-height fix
  function setVhVar() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVhVar();
  window.addEventListener('resize', setVhVar);

  // --- Mock API states
  const wormStates = {
    happy: { video: "static/videos/worm_happy.mp4", thought: "static/icons/cup_full.png" },
    tooDry: { video: "static/videos/worm_cold.mp4", thought: "static/icons/cup_full.png" },
    hungry: { video: "static/videos/worm_hungry.mp4", thought: "static/thoughts/Melone.png" }
  };

  async function fetchWormState() {
    const keys = Object.keys(wormStates);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return wormStates[randomKey];
  }

  async function updateWormState() {
    try {
      const state = await fetchWormState();
      if (wormVideoSource) {
        wormVideoSource.src = state.video;
        if (wormVideo) wormVideo.load();
      }
      // thoughtBubble expects a full path; wormStates.thought should be a path
      if (thoughtBubble) thoughtBubble.innerHTML = `<img src="${state.thought}" alt="thought">`;
      if (thoughtImage) thoughtImage.src = state.thought;
    } catch (err) {
      console.error("Failed to update worm state:", err);
    }
  }

  sayHelloBtn?.addEventListener('click', async () => {
    if (wormVideoSource) {
      wormVideoSource.src = "/static/videos/hello.mp4";
      if (wormVideo) wormVideo.load();
    }
    await updateWormState();
  });

  // --- Populate food carousel (single pass)
  if (foodCarousel) {
    foods.forEach(f => {
      const img = document.createElement("img");
      img.src = f.img;
      img.alt = f.name;
      img.title = f.name;
      img.classList.add("food-item");
      img.addEventListener("click", () => addFoodToBoard(img.title, img.src));
      foodCarousel.appendChild(img);
    });

    // initialize Glider safely if library loaded
    if (typeof Glider !== 'undefined') {
      new Glider(foodCarousel, {
        slidesToShow: 3.5,
        slidesToScroll: 1,
        draggable: true,
        dots: '#resp-dots',
        arrows: { prev: '.glider-prev', next: '.glider-next' },
        rewind: true
      });
    }
  }

  // Add/Remove food on chopping board
  function addFoodToBoard(foodName, foodImgSrc) {
    if (selectedFoods.find(f => f.name === foodName)) return;
    const img = document.createElement("img");
    img.src = foodImgSrc;
    img.alt = foodName;
    img.dataset.name = foodName;
    img.onclick = () => removeFoodFromBoard(foodName);
    choppingBoard?.appendChild(img);
    selectedFoods.push({ name: foodName, element: img });
    resizeBoardItems();
  }

  function removeFoodFromBoard(foodName) {
    const index = selectedFoods.findIndex(f => f.name === foodName);
    if (index !== -1) {
      choppingBoard?.removeChild(selectedFoods[index].element);
      selectedFoods.splice(index, 1);
      resizeBoardItems();
    }
  }

  function resizeBoardItems() {
    const count = selectedFoods.length;
    if (count === 0) return;
    let size;
    if (count <= 3) size = 90;
    else if (count <= 6) size = 70;
    else if (count <= 9) size = 55;
    else size = 45;
    selectedFoods.forEach(f => {
      f.element.style.width = `${size}px`;
      f.element.style.height = `${size}px`;
    });
  }

  // --- Cups (create only once)
  // cup definitions: each has a distinct empty image and a corresponding full image
  const cupDefs = [
    { empty: "static/icons/cup.png",       full: "static/icons/cup_full.png"      }, // 1 cup (empty = cup.png)
    { empty: "static/icons/2cups_empty.png", full: "static/icons/2cups_full.png"   }, // 2 cups
    { empty: "static/icons/3cups_empty.png", full: "static/icons/3cups_full.png"   }  // 3 cups
  ];

  // fallback empty image if a specific empty file is missing
  const EMPTY_FALLBACK = "static/icons/cup.png";

  let selectedCupIndex = null; // 0..2 or null

  function setCupToEmpty(imgEl, def) {
    imgEl.src = def.empty || EMPTY_FALLBACK;
    // if specific empty image 404s, use fallback
    imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = EMPTY_FALLBACK; };
    imgEl.classList.remove('selected');
    imgEl.dataset.state = "empty";
  }

  function setCupToFull(imgEl, def) {
    imgEl.src = def.full;
    imgEl.onerror = () => { imgEl.onerror = null; /* leave broken if full missing */ };
    imgEl.classList.add('selected');
    imgEl.dataset.state = "full";
  }

  if (cupContainer && cupContainer.children.length === 0) {
    cupDefs.forEach((def, idx) => {
      const cup = document.createElement("img");
      cup.classList.add('cup');
      cup.dataset.amount = idx + 1;
      setCupToEmpty(cup, def);

      cup.addEventListener("click", () => {
        // No effect if chopping board is empty
        if (!selectedFoods || selectedFoods.length === 0) return;

        // If this cup is already selected, do nothing
        if (selectedCupIndex === idx) return;

        // Clear previous selected cup (set it back to empty)
        if (selectedCupIndex !== null) {
          const prev = cupContainer.children[selectedCupIndex];
          if (prev) setCupToEmpty(prev, cupDefs[selectedCupIndex]);
        }

        // Set this cup to full
        setCupToFull(cup, def);
        selectedCupIndex = idx;
      });

      cupContainer.appendChild(cup);
    });
  }

  // --- Feed done action (single handler)
  feedDone?.addEventListener('click', () => {
    choppingBoard && (choppingBoard.innerHTML = "");
    document.querySelectorAll("#cupContainer img").forEach(c => c.classList.remove("selected"));
    clearChoppingBoard();
    showHome();
  });

  function clearChoppingBoard() {
    choppingBoard && (choppingBoard.innerHTML = "");
    placedFoods.clear();
    selectedFoods = [];
    if (choppingBoard) {
      choppingBoard.style.transition = "background-color 0.3s ease";
      choppingBoard.style.backgroundColor = "#d7f7de";
      setTimeout(() => { choppingBoard.style.backgroundColor = "var(--frame-color)"; }, 300);
    }
  }

  // --- Footer / Feed UI helpers (single declaration)
  const footerMenu = document.getElementById('footerMenu');
  const feedWindow = document.getElementById('feedWindow');
  const feedPanelBody = document.getElementById('feedPanelBody');
  const feedBtn = document.getElementById('feedBtn');
  const learnBtn = document.getElementById('learnBtn');
  const overviewBtn = document.getElementById('overviewBtn');
  const closeFeedWindow = document.getElementById('closeFeedWindow');

  // ensure overlay is hidden on load and doesn't block pointer events
  if (feedWindow) {
    feedWindow.style.display = 'none';
    feedWindow.setAttribute('aria-hidden', 'true');
    feedWindow.style.pointerEvents = 'none';
  }

  if (footerMenu) {
    footerMenu.style.zIndex = '9999';
    footerMenu.style.pointerEvents = 'auto';
    // delegated handling: images/spans won't block the button action
    footerMenu.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.menu-btn');
      if (!btn) return;
      if (btn.id === 'feedBtn') showScreen('feedingScreen');
      else if (btn.id === 'learnBtn') showScreen('learnScreen');
      else if (btn.id === 'overviewBtn') showScreen('overviewScreen');
    });
  }

  // keep feeding-area inside app container
  function ensureFeedingAreaInApp() {
    const app = document.getElementById('app');
    if (!feedingArea || !app) return;
    if (!app.contains(feedingArea)) app.appendChild(feedingArea);
    feedingArea.classList.remove('hidden');
    feedingArea.style.display = ''; // let CSS decide
  }

  // Show one of the screens (keeps DOM stable)
  function showScreen(screenId) {
    wormContainer?.classList.add('hidden');
    helloSection?.classList.add('hidden');
    ensureFeedingAreaInApp();
    if (feedingArea) {
      feedingArea.classList.remove('hidden');
      feedingArea.style.display = 'flex';
      feedingArea.setAttribute('aria-hidden', 'false');
      feedingArea.scrollTop = 0;
    }
    [feedingScreen, learnScreen, overviewScreen].forEach(s => {
      if (!s) return;
      s.classList.add('hidden');
      s.setAttribute('aria-hidden', 'true');
      s.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      target.setAttribute('aria-hidden', 'false');
      target.style.display = '';
    }
    wormVideo && !wormVideo.paused && wormVideo.pause();
  }

  function showHome() {
    wormContainer?.classList.remove('hidden');
    helloSection?.classList.remove('hidden');
    if (feedingArea) {
      feedingArea.classList.add('hidden');
      feedingArea.style.display = 'none';
      feedingArea.setAttribute('aria-hidden', 'true');
    }
    [feedingScreen, learnScreen, overviewScreen].forEach(s => {
      if (!s) return;
      s.classList.add('hidden');
      s.setAttribute('aria-hidden', 'true');
      s.style.display = 'none';
    });
    if (wormVideo) {
      try { wormVideo.play(); } catch (e) { /* ignore autoplay block */ }
    }
  }

  function closeFeedOverlay() {
    if (!feedWindow) return;
    feedWindow.style.display = 'none';
    feedWindow.setAttribute('aria-hidden', 'true');
    if (feedingArea) {
      feedingArea.classList.add('hidden');
      feedingArea.style.display = 'none';
      feedingArea.setAttribute('aria-hidden', 'true');
    }
    footerMenu?.classList.add('visible');
  }

  // wire individual buttons (safe redundant listeners are ok)
  feedBtn?.addEventListener('click', () => showScreen('feedingScreen'));
  learnBtn?.addEventListener('click', () => showScreen('learnScreen'));
  overviewBtn?.addEventListener('click', () => showScreen('overviewScreen'));
  closeFeedWindow?.addEventListener('click', closeFeedOverlay);

  // store glider instance so we can refresh / recreate safely on resize
  let foodGlider = null;

  // initialize glider safely (idempotent)
  function ensureGlider() {
    if (!foodCarousel) return;
    if (typeof Glider === 'undefined') return;

    try {
      // if the instance supports refresh, prefer that
      if (foodGlider && typeof foodGlider.refresh === 'function') {
        foodGlider.refresh(true);
        return;
      }
      // if it supports destroy, call it to avoid duplicates
      if (foodGlider && typeof foodGlider.destroy === 'function') {
        try { foodGlider.destroy(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      /* ignore and recreate below */
    }

    // create new instance
    try {
      foodGlider = new Glider(foodCarousel, {
        slidesToShow: 3.5,
        slidesToScroll: 1,
        draggable: true,
        dots: '#resp-dots',
        arrows: { prev: '.glider-prev', next: '.glider-next' },
        rewind: true
      });
    } catch (e) {
      console.warn('Glider init failed:', e);
      foodGlider = null;
    }
  }

  // call once after populating carousel
  ensureGlider();

  // small debounce helper
  function debounce(fn, wait = 120) {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // safe reflow handler: recalc vh, reinit glider, and ensure UI visible
  const safeReflow = debounce(() => {
    try {
      setVhVar();
    } catch (e) { /* ignore */ }
    try {
      ensureGlider && ensureGlider();
    } catch (e) { console.warn('ensureGlider failed', e); }
    try {
      ensureVisibleOnResize && ensureVisibleOnResize();
    } catch (e) { /* ignore */ }
  }, 120);

  // use ResizeObserver to catch CSS/layout-driven size changes that window.resize misses
  try {
    const appEl = document.getElementById('app');
    if (window.ResizeObserver && appEl) {
      const ro = new ResizeObserver(safeReflow);
      ro.observe(appEl);
      // also observe body for zoom/viewport changes
      ro.observe(document.body);
    } else {
      // fallback to window resize
      window.addEventListener('resize', safeReflow);
    }
  } catch (e) {
    window.addEventListener('resize', safeReflow);
  }

  // ensureVisibleOnResize: defensive — if nothing visible, restore home
  function ensureVisibleOnResize() {
    const app = document.getElementById('app');
    if (!app) return;
    const children = Array.from(app.children).filter(c => c.id !== 'footerMenu' && c.id !== 'feedWindow');
    const anyVisible = children.some(el => el.offsetParent !== null && getComputedStyle(el).display !== 'none');
    if (!anyVisible) {
      // showHome is idempotent and safe
      showHome();
      // also reset feeding-area scroll position
      if (feedingArea) feedingArea.scrollTop = 0;
      // re-init the glider after restoring
      ensureGlider && ensureGlider();
    }
  }

  // start on home
  showHome();
});

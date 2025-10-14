document.addEventListener("DOMContentLoaded", () => {
  const btnHello = document.getElementById("btnHello");
  const btnFeed = document.getElementById("btnFeed");
  const feedingUI = document.getElementById("feedingUI");
  const mainButtons = document.getElementById("mainButtons");
  const thoughtBubble = document.getElementById("thoughtBubble");
  const wormVideo = document.getElementById("wormVideo");
  const wormVideoSource = document.getElementById("wormVideoSource");
  const foodCarousel = document.getElementById("foodCarousel");
  const choppingBoard = document.getElementById("choppingBoard");
  const cupContainer = document.getElementById("cupContainer");
  const btnBack = document.getElementById("btnBack");

  // --- 🥦 Food mock data
  const foods = [
    { name: "Tomate", img: "static/foods/Tomate.jpg" },
    { name: "Rucola", img: "static/foods/Rucola.jpg" },
    { name: "Melone", img: "static/foods/Melone.jpg" },
    { name: "Gurke", img: "static/foods/Gurke.jpg" },
    { name: "Kürbis", img: "static/foods/Kuerbis.jpg" }
  ];

  // --- 🎞️ Worm state mapping
  const wormStates = {
    happy: { video: "static/worm_happy.mp4", thought: "static/icons/smile.png" },
    tooDry: { video: "static/worm_dry.mp4", thought: "static/icons/dry.png" },
    tooCold: { video: "static/worm_cold.mp4", thought: "static/icons/snowflake.png" },
    hungry: { video: "static/worm_hungry.mp4", thought: "static/icons/Rucola.jpg" }
  };

  // --- Mock function simulating ThingsBoard API response
  async function fetchWormState() {
    // in real version: return fetch(THINGSBOARD_URL).then(res => res.json());
    // mock random state
    const keys = Object.keys(wormStates);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    console.log("Mock API: returning state", randomKey);
    return wormStates[randomKey];
  }

  // --- 🔄 Update worm UI
  async function updateWormState() {
    const state = await fetchWormState();
    wormVideoSource.src = state.video;
    wormVideo.load();
    thoughtBubble.innerHTML = `<img src="${state.thought}" alt="thought" />`;
  }

  // periodic check
  setInterval(updateWormState, 20000); // every 20 sec
  updateWormState(); // initial load

  // --- Populate food carousel
  foods.forEach(f => {
    const img = document.createElement("img");
    img.src = f.img;
    img.alt = f.name;
    img.classList.add("food-item");
    img.title = f.name;
    img.addEventListener("click", () => {
      const clone = img.cloneNode(true);
      choppingBoard.appendChild(clone);
    });
    foodCarousel.appendChild(img);
  });

  // --- Carousel scroll
  let currentOffset = 0;
  const itemWidth = 85;
  document.getElementById("nextFood").onclick = () => {
    if (currentOffset > -((foodCarousel.children.length - 2) * itemWidth))
      currentOffset -= itemWidth;
    foodCarousel.style.transform = `translateX(${currentOffset}px)`;
  };
  document.getElementById("prevFood").onclick = () => {
    if (currentOffset < 0) currentOffset += itemWidth;
    foodCarousel.style.transform = `translateX(${currentOffset}px)`;
  };

  // --- Cup selection
  for (let i = 1; i <= 3; i++) {
    const cup = document.createElement("img");
    cup.src = "static/foods/cup.png";
    cup.title = `${i} Becher`;
    cup.addEventListener("click", () =>
      alert(`Danke für ${i} Becher!`)
    );
    cupContainer.appendChild(cup);
  }

  // --- Buttons
  btnHello.onclick = async () => {
    await updateWormState();
  };

  btnFeed.onclick = () => {
    mainButtons.classList.add("hidden");
    feedingUI.classList.remove("hidden");
  };

  btnBack.onclick = () => {
    feedingUI.classList.add("hidden");
    mainButtons.classList.remove("hidden");
  };
});

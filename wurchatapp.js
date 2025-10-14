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

  // ---  Mock food data
  const foods = [
    { name: "Tomate", img: "static/foods/Tomate.jpg" },
    { name: "Rucola", img: "static/foods/Rucola.jpg" },
    { name: "Melone", img: "static/foods/Melone.jpg" },
    { name: "Gurke", img: "static/foods/Gurke.jpg" },
    { name: "Kürbis", img: "static/foods/Kuerbis.jpg" },
    { name: "Eis", img: "static/foods/Eis.jpg" }
  ];

  // --- Mock API states
  const wormStates = {
    happy: { video: "static/worm_happy.mp4", thought: "static/icons/cup_full.png" },
    tooDry: { video: "static/worm_cold.mp4", thought: "static/icons/cup_full.png" },
    hungry: { video: "static/worm_hungry.mp4", thought: "static/icons/Melone.png" }
  };

  async function fetchWormState() {
    const keys = Object.keys(wormStates);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return wormStates[randomKey];
  }

  async function updateWormState() {
    try {
        const state = await fetchWormState(); // Example mockup API call (replace with ThingsBoard endpoint later)
        wormVideoSource.src = state.video;
        wormVideo.load();
        thoughtBubble.innerHTML = `<img src="${state.thought}" alt="thought">`;
        thoughtImage.src = `/static/thoughts/${state.thought}`;
    } catch (err) {
    console.error("Failed to update worm state:", err);
  }

  }

  sayHelloBtn.onclick = async () => {
  // play the "hello" animation
  wormVideoSource.src = "/static/videos/hello.mp4";
  wormVideo.load();
  // trigger API update to get latest worm state
  await updateWormState();
  };

// --- Populate food carousel
const placedFoods = new Set(); // track foods already on board

foods.forEach(f => {
  const img = document.createElement("img");
  img.src = f.img;
  img.alt = f.name;
  img.title = f.name;
  img.classList.add("food-item");

  img.addEventListener("click", () => {
    // check if food is already on the board
    if (placedFoods.has(f.name)) return;

    const clone = img.cloneNode(true);
    clone.addEventListener("click", () => {
      // remove from board and update set
      choppingBoard.removeChild(clone);
      placedFoods.delete(f.name);
    });

    choppingBoard.appendChild(clone);
    placedFoods.add(f.name);
  });

  foodCarousel.appendChild(img);
});


  // initialize Glider
  new Glider(foodCarousel, {
    slidesToShow: 3.5,
    slidesToScroll: 1,
    draggable: true,
    dots: '#resp-dots',
    arrows: {
    prev: '.glider-prev',
    next: '.glider-next'
    },
    rewind: true
  });

  // --- Cup selector
  for (let i = 1; i <= 3; i++) {
    const cup = document.createElement("img");
    cup.src = "static/foods/cup.jpg";
    cup.dataset.amount = i;
    cup.addEventListener("click", () => {
      document.querySelectorAll(".cup-container img").forEach(c => c.classList.remove("selected"));
      cup.classList.add("selected");
    });
    cupContainer.appendChild(cup);
  }

  // --- Feed done action
  feedDone.onclick = () => {
    choppingBoard.innerHTML = "";
    document.querySelectorAll(".cup-container img").forEach(c => c.classList.remove("selected"));
  };
});

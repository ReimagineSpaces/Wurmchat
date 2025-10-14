document.addEventListener("DOMContentLoaded", () => {
  const helloBtn = document.getElementById("helloBtn");
  const feedDone = document.getElementById("feedDone");
  const wormVideo = document.getElementById("wormVideo");
  const wormVideoSource = document.getElementById("wormVideoSource");
  const thoughtBubble = document.getElementById("thoughtBubble");
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
    const state = await fetchWormState();
    wormVideoSource.src = state.video;
    wormVideo.load();
    thoughtBubble.innerHTML = `<img src="${state.thought}" alt="thought">`;
  }

  helloBtn.onclick = async () => {
    wormVideoSource.src = "static/hello.mp4";
    wormVideo.load();
    await updateWormState(); // simulate API call after hello
  };

  // --- Populate food carousel
  foods.forEach(f => {
    const img = document.createElement("img");
    img.src = f.img;
    img.alt = f.name;
    img.title = f.name;
    img.addEventListener("click", () => {
      const clone = img.cloneNode(true);
      choppingBoard.appendChild(clone);
    });
    foodCarousel.appendChild(img);
  });

  // initialize Glider
  new Glider(foodCarousel, {
    slidesToShow: 5,
    slidesToScroll: 1,
    draggable: true,
    rewind: true
  });

  // --- Cup selector
  for (let i = 1; i <= 3; i++) {
    const cup = document.createElement("img");
    cup.src = "static/foods/cup.png";
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

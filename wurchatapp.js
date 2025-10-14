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
  let selectedFoods = [];

// viewport-height fix (put at top of your app JS)
  function setVhVar() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
   
  setVhVar();
  window.addEventListener('resize', setVhVar);

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
    addFoodToBoard(img.title, img.src);
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

// Add food to board
function addFoodToBoard(foodName, foodImgSrc) {
  // Prevent duplicates
  if (selectedFoods.find(f => f.name === foodName)) return;

  const img = document.createElement("img");
  img.src = foodImgSrc;
  img.alt = foodName;
  img.dataset.name = foodName;

  // Click to remove
  img.onclick = () => removeFoodFromBoard(foodName);

  choppingBoard.appendChild(img);
  selectedFoods.push({ name: foodName, element: img });

  resizeBoardItems();
}
// Remove food
function removeFoodFromBoard(foodName) {
  const index = selectedFoods.findIndex(f => f.name === foodName);
  if (index !== -1) {
    choppingBoard.removeChild(selectedFoods[index].element);
    selectedFoods.splice(index, 1);
    resizeBoardItems();
  }
}

// Resize dynamically based on count
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
    clearChoppingBoard();
  };

  function clearChoppingBoard() {
  // Clear DOM elements
  choppingBoard.innerHTML = "";

  // Reset the list of placed foods
  placedFoods = [];

  // Optionally trigger visual feedback
  choppingBoard.style.transition = "background-color 0.3s ease";
  choppingBoard.style.backgroundColor = "#d7f7de";
  setTimeout(() => {
    choppingBoard.style.backgroundColor = "var(--frame-color)";
  }, 300);
}
});

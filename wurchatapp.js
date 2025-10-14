const foods = ["Tomate", "Rucola", "Melone", "Gurke", "Kuerbis"];
const track = document.getElementById("foodTrack");
const chosen = document.getElementById("chosenFoods");
const cups = document.querySelectorAll(".cup");
const feedMenu = document.getElementById("feedMenu");
const mainMenu = document.getElementById("mainMenu");

foods.forEach(f => {
  const img = document.createElement("img");
  img.src = `static/foods/${f}.jpg`;
  img.alt = f;
  img.onclick = () => addFood(f);
  track.appendChild(img);
});

function addFood(name) {
  const img = document.createElement("img");
  img.src = `static/foods/${name}.png`;
  chosen.appendChild(img);
}

cups.forEach((cup, i) => {
  cup.addEventListener("click", () => {
    cups.forEach(c => c.classList.remove("active"));
    for (let j = 0; j <= i; j++) cups[j].classList.add("active");
  });
});

document.getElementById("btnFeed").onclick = () => {
  mainMenu.classList.add("hidden");
  feedMenu.classList.remove("hidden");
};

document.getElementById("btnBack").onclick = () => {
  feedMenu.classList.add("hidden");
  mainMenu.classList.remove("hidden");
};

document.getElementById("btnWave").onclick = () => {
  const bubble = document.getElementById("thoughtBubble");
  bubble.classList.add("wave");
  setTimeout(() => bubble.classList.remove("wave"), 1000);
};

const mapContainer = document.getElementById("map-container");
const map = document.getElementById("india-map");
const popup = document.getElementById("state-popup");
const backButton = document.getElementById("back-button");
const stateTitle = document.querySelector(".india-map-content h2");
const stateSubtitle = document.querySelector(".india-map-content h4");
const stateCards = document.getElementById("state-cards");
let currentState = null;
let originalViewBox = "";
let selectedState = null;
let showState = true;

map.addEventListener("mouseover", (e) => {
  if (e.target.tagName === "path") {
    const stateName = e.target.getAttribute("title") || "Unknown";
    popup.textContent = stateName;
    popup.style.display = "block";
  }
});

map.addEventListener("mousemove", (e) => {
  popup.style.left = e.pageX + 10 + "px";
  popup.style.top = e.pageY + 10 + "px";
});

map.addEventListener("mouseout", () => {
  popup.style.display = "none";
});

map.addEventListener("click", (e) => {
  if (e.target.tagName === "path") {
    currentState = e.target;
    focusOnState(currentState);
  }
});

//tracking of zooming map

backButton.addEventListener("click", () => {
  location.reload();
});

function focusOnState(stateElement) {
  const stateName = stateElement.getAttribute("title") || "Unknown State";
  stateTitle.textContent = stateName.toUpperCase();
  stateSubtitle.style.display = "none";

  const paths = map.querySelectorAll("path");
  paths.forEach((path) => {
    if (path !== stateElement) {
      path.style.display = "none";
    }
  });

  const svg = map.querySelector("svg");
  if (!originalViewBox) {
    originalViewBox = svg.getAttribute("viewBox") || "";
  }

  const bbox = stateElement.getBBox();
  const padding = 10;
  const aspectRatio = mapContainer.clientWidth / mapContainer.clientHeight;
  let width, height;

  if (bbox.width / bbox.height > aspectRatio) {
    width = bbox.width + padding * 2;
    height = width / aspectRatio;
  } else {
    height = bbox.height + padding * 2;
    width = height * aspectRatio;
  }

  const x = bbox.x - (width - bbox.width) / 2;
  const y = bbox.y - (height - bbox.height) / 2;

  svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);

  backButton.style.display = "block";

  // Show state cards
  stateCards.style.display = "flex";
  stateCards.style.justifyContent = "center";
  stateCards.style.alignItems = "center";

  const stateCities = document.getElementsByClassName(
    stateElement.getAttribute("title")
  );
  Array.from(stateCards.children).forEach((card) => {
    if (Array.from(stateCities).some((city) => city.id === card.id)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });

  // Show markers for the selected state
  showMarkersForState(stateName);
}

function addHeritageMarker({ latitude, longitude, name }) {
  console.log(latitude, longitude, name);
  const svg = document.querySelector("#svg2");
  const svgWidth = parseFloat(svg.getAttribute("width"));
  const svgHeight = parseFloat(svg.getAttribute("height"));

  // Transform latitude and longitude to SVG coordinates
  const x = (latitude - 68.1) / (97.4 - 68.1);
  const y = (longitude - 6.9) / (37.6 - 6.8);

  const coords = { x: svgWidth * x, y: svgHeight * (1 - y) };

  const markerGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  markerGroup.setAttribute("transform", `translate(${x}, ${y})`);

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  circle.setAttribute("r", 2);
  circle.classList.add("heritage-marker");
  console.log(coords.x, coords.y);
  circle.setAttribute("cx", coords.x);
  circle.setAttribute("cy", coords.y);

  const tooltip = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "title"
  );
  tooltip.textContent = name;

  circle.appendChild(tooltip);

  markerGroup.appendChild(circle);

  svg.appendChild(markerGroup);
  // Add click event to markerGroup
  markerGroup.addEventListener("click", () => {
    const cardId = name;
    console.log(cardId);
    const card = document.getElementById(cardId);
    if (card) {
      card.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function showMarkersForState(stateName) {
  const svg = document.querySelector("#svg2");
  const existingMarkers = svg.querySelectorAll(".heritage-marker");
  existingMarkers.forEach((marker) => marker.parentElement.remove());

  selectedState = stateName;

  const postsInState = Array.from(document.querySelectorAll(".map-container"))
    .filter(
      (container) =>
        container.dataset.lat &&
        container.dataset.lng &&
        container.querySelector(".site-info h4").textContent === stateName
    )
    .map((container) => ({
      latitude: parseFloat(container.dataset.lat),
      longitude: parseFloat(container.dataset.lng),
      name: container.querySelector(".site-info h3").textContent,
    }));

  console.log(postsInState);

  postsInState.forEach(addHeritageMarker);

  document.querySelectorAll(".map-container").forEach((card) => {
    const cardState = card.querySelector(".site-info h4").textContent;
    if (cardState === stateName) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function onStateClick(event) {
  const stateName = event.target.getAttribute("title");
  showMarkersForState(stateName);
}

document.querySelectorAll("#svg2 path").forEach((path) => {
  path.addEventListener("click", onStateClick);
});

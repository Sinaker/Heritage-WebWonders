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

	const stateTitle = stateElement.getAttribute("title");
	const stateCities = document.getElementsByClassName(stateTitle);
	// Convert to Set for O(1) lookups instead of O(n) with some()
	const cityIds = new Set(Array.from(stateCities).map(city => city.id));
	
	Array.from(stateCards.children).forEach((card) => {
		card.style.display = cityIds.has(card.id) ? "block" : "none";
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
		"g",
	);
	markerGroup.setAttribute("transform", `translate(${x}, ${y})`);

	const circle = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"circle",
	);
	circle.setAttribute("r", 2);
	circle.classList.add("heritage-marker");
	console.log(coords.x, coords.y);
	circle.setAttribute("cx", coords.x);
	circle.setAttribute("cy", coords.y);

	const tooltip = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"title",
	);
	tooltip.textContent = name;

	circle.appendChild(tooltip);

	markerGroup.appendChild(circle);

	svg.appendChild(markerGroup);
	// Add click event to markerGroup
	markerGroup.addEventListener("click", () => {
		const cardId = name;
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

	// Use querySelectorAll more efficiently with a combined selector
	const containers = document.querySelectorAll(".map-container");
	const postsInState = [];
	
	containers.forEach((container) => {
		if (container.dataset.lat && container.dataset.lng) {
			const stateH4 = container.querySelector(".site-info h4");
			if (stateH4 && stateH4.textContent === stateName) {
				postsInState.push({
					latitude: parseFloat(container.dataset.lat),
					longitude: parseFloat(container.dataset.lng),
					name: container.querySelector(".site-info h3").textContent,
				});
			}
		}
	});

	postsInState.forEach(addHeritageMarker);

	// Cache the containers instead of querying multiple times
	containers.forEach((card) => {
		const stateH4 = card.querySelector(".site-info h4");
		card.style.display = (stateH4 && stateH4.textContent === stateName) ? "block" : "none";
	});
}

function onStateClick(event) {
	const stateName = event.target.getAttribute("title");
	showMarkersForState(stateName);
}

document.querySelectorAll("#svg2 path").forEach((path) => {
	path.addEventListener("click", onStateClick);
});

const track = document.querySelector("#image-track");

window.onmousedown = (e) => {
  track.dataset.mouseDownAt = e.clientX;
};

window.onmouseup = () => {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
};

window.onmousemove = (e) => {
  if (track.dataset.mouseDownAt === "0") return;

  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
  const maxDelta = window.innerWidth / 2;

  const percentage = (mouseDelta / maxDelta) * -100;
  let nextPercentage =
    parseFloat(track.dataset.prevPercentage || "0") + percentage;

  // Ensure nextPercentage is a valid number
  if (isNaN(nextPercentage)) nextPercentage = 0;

  // Clamp the percentage to the range [-90, 0] for simplicity
  nextPercentage = Math.max(Math.min(nextPercentage, 0), -90);

  track.dataset.percentage = nextPercentage;

  track.animate(
    {
      transform: `translate(${nextPercentage}%, -50%)`,
    },
    { duration: 12000, fill: "forwards" }
  );

  const images = track.querySelectorAll(".image");
  for (const image of images) {
    image.animate(
      {
        objectPosition: `${100 + nextPercentage}% center`,
      },
      { duration: 1200000, fill: "forwards" }
    );
  }
};

//timeline

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;

  let scrollPercentage = (scrollTop / viewportHeight) * 100;
  const circles = document.querySelectorAll(".timeline-left .month-circle");
  const months = document.querySelectorAll(".months");
  const content = document.querySelectorAll(".timeline-right");

  circles.forEach((circle) => {
    if (scrollPercentage < 1) {
      circle.style.backgroundColor = "rgba(0, 0, 0, 0.37)";
    } else if (scrollPercentage > 49) {
      circle.style.backgroundColor = "black";
    }
  });

  months.forEach((month) => {
    if (scrollPercentage < 1) {
      month.style.color = "rgba(0, 0, 0, 0.37)";
    } else if (scrollPercentage > 49) {
      month.style.color = "black";
    }
  });

  content.forEach((item) => {
    if (scrollPercentage < 1) {
      item.style.color = "rgba(0, 0, 0, 0.37)";
    } else if (scrollPercentage > 49) {
      item.style.color = "black";
    }
  });
});

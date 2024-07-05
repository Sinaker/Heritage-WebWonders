gsap.registerPlugin(ScrollTrigger);

gsap.from(".title", {
  x: "-5%",
  y: "50%",
  duration: 1,
  ease: "power2.out",
});

// gsap.to with duration and easing
gsap.to(".title", {
  x: 0,
  y: 0,
  duration: 2,
  ease: "back.out(1.7)",
});

gsap.from(".subheading", { x: 0, duration: 2 });
gsap.from(".subheading", {
  x: "-30%",
  duration: 2,
  ease: "elastic.out(1, 0.3)",
});

gsap.to(".navbar", {
  scrollTrigger: {
    trigger: ".navbar",
    start: "+=400",
    end: "max",
    onToggle: () => {
      const navbar = document.querySelector(".navbar");
      navbar.classList.toggle("normal");
      if (navbar.classList.contains("normal")) {
        navbar.querySelector("img").src = "Logo-Black.png";
      } else {
        navbar.querySelector("img").src = "Logo-white.png";
      }
    },
  },
});

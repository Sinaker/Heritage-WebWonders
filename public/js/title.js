gsap.registerPlugin(ScrollTrigger);

gsap.from(".title", {
  x: "-5%",
  y: "50%",
  duration: 1,
  delay: 0.5,
  ease: "power2.out",
});

// gsap.to with duration and easing
gsap.to(".title", {
  x: 0,
  y: 0,
  duration: 2,
  delay: 0.5,
  ease: "back.out(1.7)",
});

gsap.from(".subheading", { x: 0, duration: 2 });
gsap.from(".subheading", {
  x: "-30%",
  duration: 2,
  delay: 0.5,
  ease: "elastic.out(1, 0.3)",
});

gsap.to(".navbar", {
  scrollTrigger: {
    trigger: ".navbar",
    start: "+=400",
    end: () => {
      return `${window.outerHeight}`;
    },
    onEnter: () => {
      const navbar = document.querySelector(".navbar");
      navbar.classList.add("normal");
      navbar.querySelector("img").src = "Logo-Black.png";
    },
    onLeaveBack: () => {
      const navbar = document.querySelector(".navbar");
      navbar.classList.remove("normal");
      navbar.querySelector("img").src = "Logo-white.png";
    },
  },
});

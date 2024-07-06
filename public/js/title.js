gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".title",
    start: "top bottom", // when the top of the title hits the bottom of the viewport
    end: "bottom top", // when the bottom of the title hits the top of the viewport
    onEnter: () => tl.resume(), // resume the animation when the title enters the viewport
    onLeave: () => tl.pause(), // pause the animation when the title leaves the viewport
    onEnterBack: () => tl.resume(), // resume the animation when the title re-enters the viewport from the top
    onLeaveBack: () => tl.pause(), // pause the animation when the title leaves the viewport towards the top
  },
});

tl.from(".title", {
  x: "-5%",
  y: "45%",
  duration: 1,
  delay: 0.5,
  ease: "power2.out",
});

tl.to(".title", {
  x: 0,
  y: 0,
  duration: 1,
  ease: "back.out(1.7)",
});

tl.to(".title", {
  x: 0,
  y: -10,
  repeat: -1,
  yoyo: true,
  ease: "power1.inOut",
  duration: 1.5,
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
    start: "+=800",
    end: () => {
      return `${window.outerHeight}`;
    },
    onEnter: () => {
      const navbar = document.querySelector(".navbar");
      const hr = document.querySelector(".navbar-divider");

      navbar.classList.add("normal");
      navbar.querySelector("img").src = "Logo-Black.png";
      hr.style.left = "5%";
      hr.style.width = "90%";
    },
    onLeaveBack: () => {
      const navbar = document.querySelector(".navbar");
      const hr = document.querySelector(".navbar-divider");
      navbar.classList.remove("normal");
      navbar.querySelector("img").src = "Logo-white.png";
      hr.style.width = "0";
    },
  },
});

gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".title",
    start: "top bottom",
    end: "bottom top",
    onEnter: () => tl.resume(),
    onLeave: () => tl.pause(),
    onEnterBack: () => tl.resume(),
    onLeaveBack: () => tl.pause(),
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
  delay: 1,
  scrollTrigger: {
    trigger: ".mission-div .btn-2",
    end: () => `${window.outerHeight}`,
    scrub: true, // Makes the animation smoother
    onEnter: () => {
      const navbar = document.querySelector(".navbar");
      const hr = document.querySelector(".navbar-divider");

      navbar.classList.add("normal");
      gsap.to(hr, { width: "100%", duration: 0.15 });
    },
    onLeaveBack: () => {
      const navbar = document.querySelector(".navbar");
      const hr = document.querySelector(".navbar-divider");

      navbar.classList.remove("normal");
      gsap.to(hr, { width: "0", duration: 0.15 });
    },
  },
});

gsap.utils.toArray("h1:not(.exclude-animation)").forEach((h1) => {
  gsap.from(h1, {
    scrollTrigger: {
      trigger: h1,
      start: "top 90%", // when the top of the h1 reaches 90% of the viewport height
      toggleActions: "restart pause resume reverse",
    },
    duration: 0.5,
    opacity: 0,
    y: 50,
  });
});

gsap.utils.toArray("img:not(.exclude-animation)").forEach((img) => {
  gsap.from(img, {
    scrollTrigger: {
      trigger: img,
      start: "top 90%", // when the top of the h1 reaches 90% of the viewport height
      toggleActions: "restart pause resume reverse",
    },
    duration: 0.5,
    opacity: 0,
    x: 500,
  });
});

gsap.from(".feedback-content", {
  scrollTrigger: {
    trigger: ".main-heading",
    start: "top 90%", // when the top of the h1 reaches 90% of the viewport height
    toggleActions: "restart pause resume reverse",
  },
  duration: 0.5,
  opacity: 0,
  y: -50,
});

gsap.from(
  "#feedback-form input, #feedback-form select, #feedback-form textarea",
  {
    scrollTrigger: {
      trigger: ".main-heading",
      start: "top 90%", // when the top of the h1 reaches 90% of the viewport height
      toggleActions: "restart pause resume reverse",
    },
    duration: 0.5,
    opacity: 0,
    y: -100,
    ease: "bounce.out",
  }
);

gsap.from("iframe", {
  scrollTrigger: {
    trigger: "iframe",
    start: "top 90%", // when the top of the h1 reaches 90% of the viewport height
    toggleActions: "restart pause resume reverse",
  },
  duration: 0.5,
  opacity: 0,
  y: -100,
  ease: "Elastic",
});

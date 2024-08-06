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
    ease: "Bounce.easeOut",
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
  ease: "Elastic.easeOut",
});

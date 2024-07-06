// Select all elements with class ".btn-link"
const buttons = document.querySelectorAll(".btn-link");

buttons.forEach((button) => {
  const title = button.querySelector(".btn-title");
  const ripple = button.querySelectorAll(".btn-ripple");

  // Define the load animation function
  function loadAnimation() {
    const tl = gsap.timeline();
    tl.set(
      button,
      {
        willChange: "transform",
      },
      0
    );

    tl.from(
      button,
      {
        opacity: 0,
        duration: 0.1,
      },
      0
    );

    tl.from(
      button,
      {
        scaleX: 0.3,
        duration: 1.6,
        ease: "elastic.out(0.4, 0.3)",
        force3D: true,
      },
      0
    );
    tl.from(
      title,
      {
        opacity: 0,
        duration: 0.2,
      },
      0.2
    );
    tl.set(title, {
      willChange: "auto",
    });
  }

  // Define the hover animation function
  function hoverAnimation() {
    const t1 = gsap.timeline();
    t1.set(ripple, {
      display: "block",
    });
    t1.set(button, {
      willChange: "transform",
      scale: 1,
    });
    t1.to(
      button,
      {
        scaleX: 1.03,
        scaleY: 0.98,
        duration: 1,
        ease: "elastic.out(1, 0.3)",
        force3D: true,
      },
      0
    );
    t1.set(button, {
      willChange: "auto",
    });

    t1.set(ripple, {
      willChange: "transform",
    });
    t1.fromTo(
      ripple,
      {
        xPercent: -100,
      },
      {
        xPercent: 0,
        stagger: {
          each: 0.2,
        },
        duration: 1,
        ease: "expo.out",
        force3D: true,
      },
      0
    );
    t1.set(ripple, {
      willChange: "auto",
    });
  }

  // Define the hover reset animation function
  function hoverAnimationReset() {
    const t2 = gsap.timeline();

    t2.set(
      button,
      {
        scaleX: 1.03,
        scaleY: 0.98,
        willChange: "transform",
      },
      0
    );
    t2.to(
      button,
      {
        scaleX: 1,
        scaleY: 1,
        ease: "elastic.out(1, 0.3)",
        duration: 1,
        force3D: true,
      },
      0
    );
    t2.set(button, {
      willChange: "auto",
    });

    t2.set(
      ripple,
      {
        willChange: "transform",
        xPercent: 0,
      },
      0
    );
    t2.to(
      ripple,
      {
        xPercent: 100,
        stagger: {
          each: 0.2,
          from: "end",
        },
        duration: 1,
        ease: "expo.out",
        immediateRender: false,
        force3D: true,
      },
      0
    );
    t2.set(ripple, {
      willChange: "auto",
    });
  }

  // Attach event listeners to each button
  window.addEventListener("load", loadAnimation);
  button.addEventListener("mouseenter", hoverAnimation);
  button.addEventListener("mouseleave", hoverAnimationReset);
});

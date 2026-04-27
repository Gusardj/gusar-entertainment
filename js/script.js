const nav = document.querySelector("nav");

window.addEventListener("scroll", () => {
  if (!nav) return;

  if (window.scrollY > 10) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});
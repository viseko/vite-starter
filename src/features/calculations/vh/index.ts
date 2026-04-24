function calcVh() {
  const vh = window.innerHeight * 0.01;
  document.body.style.setProperty("--vh", `${vh}px`);
}

calcVh();

window.addEventListener("resize", calcVh);
window.addEventListener("scroll", calcVh);

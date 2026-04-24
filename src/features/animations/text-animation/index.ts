import { install } from "@/app/App";
import { splitText, splitByVisualLines } from "@/shared/lib/text/split-text";
import { observe } from "./observers";

install("[data-ta]", (block) => {
  const data = block.dataset;
  const animationName = data.taName;

  if (typeof animationName !== "string") {
    console.warn("Анимация не задана :", block);
    return;
  }

  const split = data.taSplit || "letters";
  const speed = Number(data.taSpeed) || 300;
  const delay = Number(data.taDelay) || 0;
  const gap = Number(data.taGap) || 0;

  if (split === "lines") {
    requestAnimationFrame(() => splitByVisualLines(block));
  } else {
    splitText(block, "words");
  }

  requestAnimationFrame(() => observe(block, animationName, speed, delay, gap));
  block.classList.add("_initialized");
});

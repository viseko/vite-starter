import { install } from "@/app/App";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitText } from "@/shared/lib/text/split-text";

gsap.registerPlugin(ScrollTrigger);

install(".js-text-scroll-fill", (textNode) => {
  const fillValue = textNode.dataset.fill;
  if (!fillValue) return;

  const type = textNode.dataset.type ?? "smooth";

  // Поддержка:
  // data-fill="#fff"
  // data-fill="red"
  // data-fill="var(--color-primary)"
  // data-fill="--color-primary"
  const fillColor = fillValue.startsWith("--") ? `var(${fillValue})` : fillValue;

  splitText(textNode, "letters");

  const parts = textNode.querySelectorAll<HTMLElement>(".text-part");
  if (!parts.length) return;

  if (type === "sharp") {
    const baseParts: HTMLElement[] = [];

    parts.forEach((part) => {
      const { parentNode } = part;
      if (!parentNode) return;

      const wrapper = document.createElement("span");

      wrapper.className = "text-part-wrapper";
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";

      parentNode.insertBefore(wrapper, part);
      wrapper.appendChild(part);

      baseParts.push(part);

      const coloredClone = part.cloneNode(true) as HTMLElement;

      coloredClone.style.position = "absolute";
      coloredClone.style.left = "0";
      coloredClone.style.top = "0";
      coloredClone.style.color = fillColor;
      coloredClone.style.clipPath = "inset(0 100% 0 0)";

      wrapper.appendChild(coloredClone);
    });

    const coloredClones = textNode.querySelectorAll<HTMLElement>(
      ".text-part-wrapper > .text-part:last-child"
    );

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textNode,
        start: "top 60%",
        end: "bottom 30%",
        scrub: true,
      },
    });

    coloredClones.forEach((clone, index) => {
      const duration = 1 / coloredClones.length;
      const basePart = baseParts[index];

      tl.to(
        clone,
        {
          clipPath: "inset(0 0% 0 0)",
          duration,
          ease: "none",
        },
        index * duration
      );

      tl.to(
        basePart,
        {
          clipPath: "inset(0 0% 0 100%)",
          duration,
          ease: "none",
        },
        index * duration
      );
    });
  } else {
    gsap.to(parts, {
      color: fillColor,
      stagger: {
        each: 0.05,
      },
      ease: "none",
      scrollTrigger: {
        trigger: textNode,
        start: "top 60%",
        end: "bottom 30%",
        scrub: true,
      },
    });
  }
});

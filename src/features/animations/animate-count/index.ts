import { install } from "@/app/App";
import useIntersectionObserver from "@/shared/lib/dom/useIntersectionObserver";
import animateCount from "@/shared/lib/text/animate-count";

install(".js-animate-count", (root) => {
  useIntersectionObserver(root, {
    repeatable: false,
    onVisible() {
      const spans = root.querySelectorAll("span");
      spans.forEach((span) => {
        animateCount(span);
      });
    },
  });
});

import { install } from "@/app/App";
import useIntersectionObserver from "@/shared/lib/dom/useIntersectionObserver";
const stateClass = "_play";

install(".js-aos", useIntersectionObserver, {
  repeatable: true,
  fired: false,
  threshold: 0.2,
  onVisible(el) {
    el.classList.add(stateClass);
  },
  onHide(el) {
    el.classList.remove(stateClass);
  },
});

// 1. Если используем AOS
// import Aos from "aos";

// 2. Свой вариант с более гибкими настройками
import { install } from "@/app/App";
import useIntersectionObserver from "@/shared/lib/dom/useIntersectionObserver";
const stateClass = "_play";

// ==========================

// 1.
// Aos.init({
//   offset: (matchMedia('(max-width: 576px)').matches) ? 64 : 200,
//   duration: 700,
//   once: true,
// });

// 2.
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

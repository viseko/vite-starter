import { install } from "@/app/App";

/** Отступ сверху (px), в пределах которого цель считается «текущей» при скролле. */
const TOP_OFFSET = 100;

/** Связка ссылки-якоря [data-scrollspy] и элемента-цели, на который она указывает (по `href="#id"`). */
interface ScrollspyEntry {
  link: HTMLElement;
  target: Element;
}

/** Все зарегистрированные на странице ссылки [data-scrollspy] вместе с их целями. */
const scrollspyLinks: ScrollspyEntry[] = [];

/** Обработчики scroll/resize навешиваются один раз — на инициализацию первой найденной ссылки. */
let initialized = false;

/**
 * Скроллспай: подсвечивает классом `_active` ту ссылку [data-scrollspy], чья цель
 * (элемент по `href="#id"`) сейчас ближе всего к верхней границе экрана.
 *
 * Целью считается элемент, верхняя граница которого поднялась выше {@link TOP_OFFSET}px
 * от верха вьюпорта, но нижняя ещё не ушла за его пределы; среди подходящих выбирается
 * ближайший к верху. Пересчёт происходит сразу при регистрации ссылки, а также при
 * скролле и ресайзе окна.
 */
install("[data-scrollspy]", (link) => {
  const href = link.getAttribute("href");
  if (!href?.startsWith("#")) return;

  const target = document.querySelector(href);
  if (!target) return;

  scrollspyLinks.push({ link, target });

  if (initialized) return;
  initialized = true;

  const update = () => {
    let current: Element | null = null;
    let minDistance = Infinity;

    scrollspyLinks.forEach(({ target }) => {
      const rect = target.getBoundingClientRect();
      if (rect.top <= TOP_OFFSET && rect.bottom > 0) {
        const distance = Math.abs(rect.top);
        if (distance < minDistance) {
          minDistance = distance;
          current = target;
        }
      }
    });

    scrollspyLinks.forEach(({ link, target }) => {
      link.classList.toggle("_active", target === current);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
});

import { install } from "@/app/App";
import updateParentSliderHeight from "@/shared/lib/functions/updateParentSwiperHeight";

const openedAccordions = new Map();

install(".js-accordion", (elem) => {
  const name = elem.dataset.name; // может быть undefined
  const btn = elem.querySelector("[data-role='expand']");
  const content = elem.querySelector("[data-role='content']");
  const showStateClass = "_show";

  if (!btn || !content) return;

  const show = () => {
    elem.classList.add(showStateClass);
    content.setAttribute("aria-hidden", "false");

    // если name задан — это аккордеон в группе
    if (name) {
      const previouslyOpened = openedAccordions.get(name);
      if (previouslyOpened && previouslyOpened !== elem) {
        previouslyOpened.classList.remove(showStateClass);
        const prevContent = previouslyOpened.querySelector("[data-role='content']");
        if (prevContent) {
          prevContent.setAttribute("aria-hidden", "true");
        }
      }
      openedAccordions.set(name, elem);
    }
  };

  const hide = () => {
    elem.classList.remove(showStateClass);
    content.setAttribute("aria-hidden", "true");

    if (name && openedAccordions.get(name) === elem) {
      openedAccordions.delete(name);
    }
  };

  const toggle = () => {
    const isShown = elem.classList.contains(showStateClass);
    if (isShown) hide();
    else show();
  };

  btn.addEventListener("click", toggle);

  // корректировка высоты слайдера
  content.addEventListener("transitionend", () => {
    updateParentSliderHeight(content);
  });

  // показать, если указано явно
  if (elem.dataset.show === "true") {
    show();
  }

  // если изначально уже открыт (_show в разметке)
  if (elem.classList.contains(showStateClass)) {
    if (name) openedAccordions.set(name, elem);
    content.setAttribute("aria-hidden", "false");
  }
});

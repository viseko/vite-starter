import { install } from "@/app/App";

install(
  ".js-btn-menu",
  (button) => {
    const bodyStateClass = button.dataset.bodyClass;

    button.addEventListener("click", () => {
      const isOpen = button.classList.toggle("_open");
      button.setAttribute("aria-expanded", isOpen.toString());

      if (bodyStateClass) {
        document.body.classList.toggle(bodyStateClass);
      }
    });
  },
  {}
);

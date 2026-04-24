import debounce from "@/shared/lib/functions/debounce";

/**
 * Адаптивно перемещает элементы в DOM на основе медиа-запросов.
 * Использует атрибут `data-adaptive-move` в формате: "селектор / медиа-запрос".
 * @example
 * <div data-adaptive-move=".block1 / (min-width: 750px) and (max-width: 1000px)">Элемент</div>
 */

type MoveData = {
  elem: HTMLElement;
  parent: HTMLElement | null;
  target: string;
  prev: Element | null;
  index: number;
};

export default function adaptiveMove() {
  const queries: Record<string, MoveData[]> = {};
  let observer: MutationObserver;

  function processElement(elem: HTMLElement) {
    if (!(elem instanceof HTMLElement)) return;

    const attr = elem.dataset.adaptiveMove;

    if (!attr || !attr.includes("/")) {
      console.warn(`Некорректный атрибут data-adaptive-move: "${attr}" у элемента`, elem);
      return;
    }

    const [target, mediaQuery] = attr.split("/").map((str) => str.trim());

    if (!target || !mediaQuery) {
      console.warn(`Пустой селектор или медиа-запрос: "${attr}"`, elem);
      return;
    }

    const moveData = {
      elem,
      parent: elem.parentElement,
      target,
      prev: elem.previousElementSibling,
      index: Array.prototype.indexOf.call(elem.parentElement?.children, elem),
    };

    if (queries[mediaQuery]) {
      queries[mediaQuery].push(moveData);
    } else {
      queries[mediaQuery] = [moveData];
      setupMediaQuery(mediaQuery);
    }
  }

  function setupMediaQuery(query: string) {
    const mediaQuery = window.matchMedia(query);
    const queryData = queries[query];

    const matchMedia = () => {
      if (mediaQuery.matches) {
        queryData.forEach(({ elem, target }) => {
          const targetElem = document.querySelector(target);
          if (targetElem) targetElem.appendChild(elem);
        });
      } else {
        queryData.forEach(({ elem, parent, prev, index }) => {
          if (parent === null) return;

          if (!parent.isConnected) return;

          if (prev && prev.isConnected) {
            prev.insertAdjacentElement("afterend", elem);
          } else if (index === 0) {
            parent.insertBefore(elem, parent.firstChild);
          } else if (parent.children[index - 1]) {
            parent.children[index - 1].insertAdjacentElement("afterend", elem);
          } else {
            parent.appendChild(elem);
          }
        });
      }
    };

    const debouncedMatchMedia = debounce(matchMedia, 100);
    matchMedia();
    mediaQuery.addEventListener("change", debouncedMatchMedia);
  }

  // Инициализация существующих элементов
  document.querySelectorAll<HTMLElement>("[data-adaptive-move]").forEach(processElement);

  // Отслеживание новых элементов
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches("[data-adaptive-move]")) processElement(node as HTMLElement);
          node.querySelectorAll<HTMLElement>("[data-adaptive-move]").forEach(processElement);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

adaptiveMove();

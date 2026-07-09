import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { ReactNode } from "react";
import { isDestroyable, mediaSizes } from "./types";
import type {
  AppInitOptions,
  ElementConstructor,
  InitFunction,
  InstallConfig,
  InstallHandle,
  LoadScriptOptions,
  MediaSize,
  Selector,
} from "./types";

declare global {
  interface Window {
    App: typeof App;
  }
}

/** React-корни, созданные через App.renderJSX(), по DOM-элементу, в который они смонтированы. */
const reactRoots = new Map<HTMLElement, Root>();

/**
 * Точка входа приложения: инициализация DOM-виджетов по CSS-селекторам,
 * кеширующая загрузка внешних скриптов, монтирование React-компонентов
 * внутрь Pug/HTML-разметки, брейкпоинты.
 *
 * После вызова App.init() доступен глобально как `window.App`.
 */
const App = {
  _debug: false,
  _ymID: null as number | null,
  _scriptCache: new Map<string, Promise<void>>(),

  /**
   * Инициализирует один элемент через `fn` и сохраняет результат в `registry`/`instances`.
   * Уже инициализированный (присутствующий в `registry`) элемент повторно не трогает —
   * это защищает от двойной инициализации при пересекающихся мутациях DOM.
   * Ошибка инициализации логируется и не прерывает обработку остальных элементов.
   */
  _initElement<T, O>(
    elem: HTMLElement,
    fn: InitFunction<T, O>,
    options: O,
    registry: Map<HTMLElement, T>,
    instances: T[],
    onAdd?: (el: HTMLElement, instance: T) => void
  ): void {
    if (registry.has(elem)) return;

    try {
      const instance = fn(elem, options);
      registry.set(elem, instance);
      instances.push(instance);
      onAdd?.(elem, instance);
    } catch (e) {
      console.error(
        `Ошибка при инициализации элемента: ${e instanceof Error ? e.message : String(e)}`,
        elem
      );
    }
  },

  /**
   * Уничтожает экземпляр, привязанный к `elem` (вызывает `destroy()`, если он есть),
   * и удаляет его из `registry`/`instances`.
   */
  _removeElement<T>(
    elem: HTMLElement,
    registry: Map<HTMLElement, T>,
    instances: T[],
    onRemove?: (el: HTMLElement, instance: T) => void
  ): void {
    const instance = registry.get(elem);
    if (instance === undefined) return;

    const index = instances.indexOf(instance);
    if (index !== -1) instances.splice(index, 1);
    if (isDestroyable(instance)) instance.destroy();
    registry.delete(elem);
    onRemove?.(elem, instance);
  },

  /**
   * Находит все элементы по `selector`, инициализирует их через `fn` и (пока `config.observe`
   * не выставлен в `false`) следит за DOM через MutationObserver: доинициализирует новые
   * подходящие элементы и уничтожает экземпляры удалённых.
   *
   * Регистр элемент → экземпляр локален для конкретного вызова `install()`, поэтому один и тот же
   * DOM-элемент может независимо участвовать в нескольких `install()`-подписках с разными селекторами.
   *
   * @returns хендл с текущими экземплярами и методами `stop()` (снять наблюдение) / `destroy()` (снять наблюдение и уничтожить все экземпляры).
   */
  install<T, O = unknown>(
    selector: Selector,
    fn: InitFunction<T, O>,
    options: O = {} as O,
    config: InstallConfig<T> = {}
  ): InstallHandle<T> {
    const { observe = true, onAdd, onRemove } = config;
    const registry = new Map<HTMLElement, T>();
    const instances: T[] = [];
    let observer: MutationObserver | null = null;

    const initElements = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((elem) => {
        this._initElement(elem, fn, options, registry, instances, onAdd);
      });
    };

    initElements();

    if (observe) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            if (node.matches(selector))
              this._initElement(node, fn, options, registry, instances, onAdd);
            node
              .querySelectorAll<HTMLElement>(selector)
              .forEach((el) => this._initElement(el, fn, options, registry, instances, onAdd));
          });

          mutation.removedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) return;
            if (node.matches(selector)) this._removeElement(node, registry, instances, onRemove);
            node
              .querySelectorAll<HTMLElement>(selector)
              .forEach((el) => this._removeElement(el, registry, instances, onRemove));
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    return {
      instances,
      stop: () => observer?.disconnect(),
      destroy: () => {
        observer?.disconnect();
        Array.from(registry.keys()).forEach((elem) =>
          this._removeElement(elem, registry, instances, onRemove)
        );
      },
    };
  },

  /** Ширина брейкпоинта `size` в пикселях; при `mobileFirst` возвращает границу минус 1px. */
  getMediaSize(size: MediaSize, mobileFirst = false): number {
    return mediaSizes[size] - Number(mobileFirst);
  },

  /** То же, что install(), но создаёт экземпляр через `new ClassConstructor(el, options)`. */
  installClass<T, O = unknown>(
    selector: Selector,
    ClassConstructor: ElementConstructor<T, O>,
    options: O = {} as O,
    config: InstallConfig<T> = {}
  ): InstallHandle<T> {
    return this.install(selector, (el, opts) => new ClassConstructor(el, opts), options, config);
  },

  /**
   * Загружает внешний скрипт по `path` не более одного раза — повторные вызовы для
   * того же пути переиспользуют закешированный промис. Если загрузка завершилась
   * ошибкой, запись удаляется из кеша, чтобы следующий вызов мог повторить попытку.
   */
  async loadScript({
    path,
    onload,
    onerror,
    async = true,
    defer = false,
    attributes = {},
  }: LoadScriptOptions): Promise<void> {
    let promise = this._scriptCache.get(path);

    if (!promise) {
      promise = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = path;
        script.async = async;
        script.defer = defer;

        Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));

        script.addEventListener("load", () => resolve());
        script.addEventListener("error", () => {
          console.error(`Ошибка при загрузке скрипта: ${path}`);
          reject(new Error(`Не удалось загрузить скрипт: ${path}`));
        });

        document.body.appendChild(script);
      });

      this._scriptCache.set(path, promise);
    }

    try {
      await promise;
      onload?.();
    } catch (err) {
      this._scriptCache.delete(path);
      onerror?.();
      throw err;
    }
  },

  /**
   * Регистрирует App в `window.App`. Если `window.App` уже назначен, повторная
   * инициализация без `force: true` игнорируется (с предупреждением в консоль).
   */
  init(options: AppInitOptions = {}) {
    if (window.App && !options.force) {
      console.warn("window.App уже существует. Используйте force=true для перезаписи.");
      return this;
    }

    this._debug = !!options.debug;
    this._ymID = options.ymID ?? null;
    window.App = this;

    return this;
  },

  /** Рендерит React-дерево `jsx` внутрь `elem`, переиспользуя ранее созданный для него root. */
  renderJSX(elem: HTMLElement, jsx: ReactNode): void {
    let root = reactRoots.get(elem);

    if (!root) {
      root = createRoot(elem);
      reactRoots.set(elem, root);
    }

    root.render(jsx);
  },

  /** Логирует в консоль, только если App был инициализирован с `debug: true`. */
  debug(...args: unknown[]): void {
    if (!this._debug) return;
    console.log("%c[App]", "color: #888", ...args); // eslint-disable-line no-console
  },
};

// Привязываем методы к контексту App, чтобы их можно было деструктурировать при экспорте
App.install = App.install.bind(App);
App.installClass = App.installClass.bind(App);
App.loadScript = App.loadScript.bind(App);
App.debug = App.debug.bind(App);
App.init = App.init.bind(App);

export default App;
export const { init, install, installClass, loadScript, renderJSX, debug } = App;

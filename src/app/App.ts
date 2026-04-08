type InitFunction<T = any, O = any> = (el: Element, options: O) => T;

type ElementConstructor<T = any, O = any> = new (el: Element, options: O) => T;

type InstallConfig<T = any> = {
  observe?: boolean;
  onAdd?: (el: Element, instance: T) => void;
  onRemove?: (el: Element, instance: T) => void;
};

type LoadScriptOptions = {
  path: string;
  onload?: () => void;
  onerror?: () => void;
  async?: boolean;
  defer?: boolean;
  attributes?: Record<string, string>;
};

const initializedElements = new Map<Element, any>();

const sizes = {
  xxs: 359,
  xs: 400,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

type MediaSize = keyof typeof sizes;

interface AppInitOptions {
  force?: boolean,
  ymID?: number,
};

const App = {
  _validate<T, O>(selector: string, fn: InitFunction<T, O> | ElementConstructor<T, O>, config: InstallConfig<T> = {}) {
    const { onAdd, onRemove } = config;
    if (typeof selector !== 'string' || !selector) throw new Error('Селектор должен быть непустой строкой');
    if (typeof fn !== 'function') throw new Error('Необходимо передать функцию');
    if (onAdd && typeof onAdd !== 'function') throw new Error('onAdd должен быть функцией');
    if (onRemove && typeof onRemove !== 'function') throw new Error('onRemove должен быть функцией');
  },

  _initElement<T, O>(elem: Element, fn: InitFunction<T, O>, options: O, initializedObjs: T[], onAdd?: (el: Element, instance: T) => void) {
    try {
      const instance = fn(elem, options);
      initializedElements.set(elem, instance);
      initializedObjs.push(instance);
      if (onAdd) onAdd(elem, instance);
    } catch (e: any) {
      console.error(`Ошибка при инициализации элемента: ${e.message}`, elem);
    }
  },

  _removeElement<T>(elem: Element, initializedObjs: T[], onRemove?: (el: Element, instance: T) => void) {
    if (initializedElements.has(elem)) {
      const instance = initializedElements.get(elem);
      const index = initializedObjs.indexOf(instance);
      if (index !== -1) initializedObjs.splice(index, 1);
      if (instance && typeof instance.destroy === 'function') instance.destroy();
      initializedElements.delete(elem);
      if (onRemove) onRemove(elem, instance);
    }
  },

  install<T = any, O = any>(
    selector: string,
    fn: InitFunction<T, O>,
    options: O = {} as O,
    config: InstallConfig<T> = {}
  ) {
    this._validate(selector, fn, config);

    const { observe = true, onAdd, onRemove } = config;
    const initializedObjs: T[] = [];
    let observer: MutationObserver | null = null;

    const initElements = () => {
      document.querySelectorAll(selector).forEach((elem) => {
        this._initElement(elem, fn, options, initializedObjs, onAdd);
      });
    };

    initElements();

    if (observe) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const element = node as Element;
            if (element.matches(selector)) this._initElement(element, fn, options, initializedObjs, onAdd);
            element.querySelectorAll(selector).forEach((el) => this._initElement(el, fn, options, initializedObjs, onAdd));
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const element = node as Element;
            if (element.matches(selector)) this._removeElement(element, initializedObjs, onRemove);
            element.querySelectorAll(selector).forEach((el) => this._removeElement(el, initializedObjs, onRemove));
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    const destroy = () => {
      observer?.disconnect();
      while (initializedObjs.length) {
        const instance = initializedObjs[0];
        const elem = Array.from(initializedElements.keys()).find((key) => initializedElements.get(key) === instance);
        if (elem) this._removeElement(elem, initializedObjs, onRemove);
      }
    };

    return {
      instances: initializedObjs,
      stop: () => observer?.disconnect(),
      destroy,
    };
  },

  getMediaSize(size: MediaSize, mobileFirst = false): number {
    return sizes[size] - Number(mobileFirst);
  },

  installClass<T = any, O = any>(
    selector: string,
    ClassConstructor: ElementConstructor<T, O>,
    options: O = {} as O,
    config: InstallConfig<T> = {}
  ) {
    return this.install(selector, (el, opts) => new ClassConstructor(el, opts), options, config);
  },

  _scriptCache: new Map<string, Promise<void>>(),

  async loadScript({ path, onload, onerror, async = true, defer = false, attributes = {} }: LoadScriptOptions) {
    if (!this._scriptCache.has(path)) {
      const promise = new Promise<void>((resolve, reject) => {
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

    return this._scriptCache.get(path)!.then(() => { onload?.(); }).catch((err) => { onerror?.(); throw err; });
  },

  init(options: AppInitOptions = {}) {
    if ((window as any).App && !options.force) {
      console.warn('window.App уже существует. Используйте force=true для перезаписи.');
      return this;
    }
    (window as any).App = this;
    return this;
  },
};

// Привязываем методы к контексту App
App.install = App.install.bind(App);
App.installClass = App.installClass.bind(App);
App.loadScript = App.loadScript.bind(App);
App.init = App.init.bind(App);

export default App;
export const { init, install, installClass, loadScript } = App;
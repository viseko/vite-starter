/**
 * Общие типы и константы модуля App (src/app/App.ts).
 */

/** CSS-селектор для поиска и инициализации DOM-элементов. */
export type Selector = string;

/** Функция инициализации DOM-элемента, возвращающая связанный с ним экземпляр. */
export type InitFunction<T, O> = (el: HTMLElement, options: O) => T;

/** Конструктор класса, инициализирующего DOM-элемент. */
export type ElementConstructor<T, O> = new (el: HTMLElement, options: O) => T;

/** Экземпляр, поддерживающий корректное уничтожение (снятие обработчиков и т.п.). */
export interface Destroyable {
  destroy(): void;
}

/** Type guard: имеет ли значение метод `destroy()`. */
export function isDestroyable(value: unknown): value is Destroyable {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Destroyable).destroy === "function"
  );
}

/** Опции слежения install()/installClass() за появлением и удалением элементов. */
export interface InstallConfig<T = unknown> {
  /** Отслеживать появление/удаление элементов через MutationObserver (по умолчанию true). */
  observe?: boolean;
  onAdd?: (el: HTMLElement, instance: T) => void;
  onRemove?: (el: HTMLElement, instance: T) => void;
}

/** Хендл, возвращаемый install()/installClass(), для управления жизненным циклом подписки. */
export interface InstallHandle<T> {
  /** Экземпляры, инициализированные на текущий момент. */
  instances: T[];
  /** Остановить отслеживание новых элементов, не уничтожая уже созданные экземпляры. */
  stop(): void;
  /** Остановить отслеживание и уничтожить все инициализированные экземпляры. */
  destroy(): void;
}

export interface LoadScriptOptions {
  path: string;
  onload?: () => void;
  onerror?: () => void;
  async?: boolean;
  defer?: boolean;
  attributes?: Record<string, string>;
}

export interface AppInitOptions {
  /** Переинициализировать App, даже если window.App уже существует. */
  force?: boolean;
  /** ID счётчика Яндекс.Метрики. */
  ymID?: number;
  /** Включить отладочный вывод через App.debug(). */
  debug?: boolean;
}

export const mediaSizes = {
  xxs: 359,
  xs: 400,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type MediaSize = keyof typeof mediaSizes;

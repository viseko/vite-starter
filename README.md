# 🚀 Vite Starter Template

Современный стартовый шаблон для быстрой разработки веб-приложений с использованием Vite, Pug, SCSS и TypeScript.

## ✨ Особенности

- ⚡️ **Vite 7** - молниеносная сборка и HMR
- 🎨 **Pug** - мощный шаблонизатор HTML
- 💅 **SCSS** - продвинутый препроцессор CSS с модульной архитектурой
- 📘 **TypeScript** - типизированный JavaScript
- ⚛️ **React 19** - поддержка React компонентов
- 🎭 **Swiper** - современный слайдер из коробки
- 🧹 **PurgeCSS** - автоматическая очистка неиспользуемого CSS
- 🔍 **Линтеры** - ESLint, Stylelint, HTML Validate
- 📦 **Автоматизация** - скрипты для оптимизации изображений, шрифтов, иконок
- 🚀 **FTP Deploy** - автоматическая загрузка на сервер

## 📁 Структура проекта

```
vite-starter/
├── app/                      # Конфигурация сборки
│   ├── configs/             # Конфиги (deploy и т.д.)
│   ├── modules/             # Модули Vite (плагины, сервер)
│   └── npm-scripts/         # Утилиты для автоматизации
├── public/                   # Статические файлы
│   ├── assets/              # Готовые ассеты
│   │   ├── fonts/          # Оптимизированные шрифты
│   │   └── img/            # Изображения и спрайты
│   └── favicon/            # Фавиконки
├── raw/                      # Исходники для обработки
│   ├── favicon/            # Исходник фавиконки (SVG)
│   ├── fonts/              # Исходные шрифты (TTF)
│   ├── icons/              # SVG иконки для спрайта
│   └── img/                # Исходные изображения
├── src/                      # Исходный код
│   ├── app/                # Ядро приложения
│   ├── features/           # Фичи (Feature-Sliced Design)
│   ├── pages/              # Страницы (Pug)
│   ├── shared/             # Общие ресурсы
│   │   ├── lib/           # Утилиты и хелперы
│   │   ├── styles/        # Глобальные стили
│   │   └── ui/            # UI компоненты
│   ├── widgets/            # Виджеты (хедер, футер и т.д.)
│   ├── _map/              # Карта проекта
│   ├── main.ts            # Точка входа JS
│   └── main.scss          # Точка входа стилей
└── build/                   # Собранный проект (генерируется)
```

## 🎯 Архитектура

Проект следует принципам **Feature-Sliced Design** с адаптацией под классическую верстку:

- **`app/`** - инициализация приложения
- **`features/`** - бизнес-функциональность
- **`widgets/`** - композитные блоки (header, footer)
- **`shared/`** - переиспользуемые ресурсы
  - **`lib/`** - утилиты (debounce, throttle, DOM helpers)
  - **`styles/`** - миксины, переменные, токены, утилиты
  - **`ui/`** - базовые UI компоненты
- **`pages/`** - страницы приложения

## 🚀 Быстрый старт

### Установка

```bash
npm install
```

### Разработка

```bash
npm start
```

Откроется dev-сервер с hot reload на `http://localhost:3000`

### Сборка

```bash
npm run build
```

Результат сборки будет в папке `build/`

### Предпросмотр сборки

```bash
npm run preview
```

## 📜 Доступные скрипты

### Основные команды

| Команда           | Описание                       |
| ----------------- | ------------------------------ |
| `npm start`       | Запуск dev-сервера             |
| `npm run build`   | Production сборка              |
| `npm run preview` | Предпросмотр production сборки |

### Подготовка ассетов

| Команда                   | Описание                              |
| ------------------------- | ------------------------------------- |
| `npm run prepare:sprite`  | Генерация SVG спрайта из `raw/icons/` |
| `npm run prepare:fonts`   | Конвертация шрифтов TTF → WOFF2       |
| `npm run prepare:favicon` | Генерация фавиконок из SVG            |
| `npm run prepare:tiny`    | Оптимизация изображений через TinyPNG |

### Линтинг и форматирование

| Команда                 | Описание                       |
| ----------------------- | ------------------------------ |
| `npm run lint`          | Проверка SCSS и TS             |
| `npm run lint:fix`      | Автофикс ошибок линтинга       |
| `npm run lint:scss`     | Проверка SCSS                  |
| `npm run lint:ts`       | Проверка TypeScript            |
| `npm run format`        | Форматирование кода (Prettier) |
| `npm run format:check`  | Проверка форматирования        |
| `npm run validate:html` | Валидация HTML                 |

### Деплой

| Команда              | Описание                          |
| -------------------- | --------------------------------- |
| `npm run ftp`        | Загрузка измененных файлов на FTP |
| `npm run ftp:full`   | Полная загрузка проекта           |
| `npm run ftp:images` | Загрузка только изображений       |
| `npm run ftp:assets` | Загрузка только ассетов           |

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
# FTP Deploy
FTP_HOST=your-ftp-host.com
FTP_USER=your-username
FTP_PASSWORD=your-password
FTP_REMOTE_PATH=/path/to/remote/directory

# TinyPNG API
TINYPNG_API_KEY=your-tinypng-api-key
```

### Настройка базового URL

В [`vite.config.ts`](vite.config.ts:9) измените `PROJECT_NAME`:

```typescript
const PROJECT_NAME = "your-project-name";
```

## 🎨 Работа со стилями

### SCSS архитектура

```
shared/styles/
├── tokens.scss          # Design tokens (цвета, размеры)
├── variables.scss       # SCSS переменные (доступны везде)
├── animations/          # Анимации (@keyframes)
├── base/               # Базовые стили (normalize, fonts)
├── layout/             # Сетки и контейнеры
├── mixins/             # SCSS миксины
│   ├── components/    # Компонентные миксины
│   ├── interactions/  # Ховеры, скроллбары
│   ├── layout/        # Сетки, центрирование
│   ├── responsive/    # Брейкпоинты, fluid
│   └── typography/    # Типографика
├── typography/         # Стили текста
└── utils/             # Утилитарные классы
```

### Миксины

```scss
// Адаптивность
@include breakpoint(md) {
  /* стили */
}
@include fluid(font-size, 16px, 24px);

// Центрирование
@include flex-center;
@include center;

// Ховеры
@include hover {
  /* стили */
}
@include button-hover;

// Кастомный скроллбар
@include custom-scrollbar;
```

### Утилитарные классы

```html
<!-- Отступы -->
<div class="mt-4 mb-8 px-6">
  <!-- Flex -->
  <div class="flex flex-center gap-4">
    <!-- Grid -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Цвета -->
      <p class="text-primary bg-secondary"></p>
    </div>
  </div>
</div>
```

## 🧩 Работа с Pug

### Структура шаблонов

```pug
//- app/templates/_default.pug - базовый шаблон
extends /app/templates/_default

block variables
  - const title = "Главная страница"
  - const description = "Описание страницы"

block content
  include /widgets/page-header/_index

  main.page-main
    //- Контент страницы

  include /widgets/page-footer/_index
```

### Компоненты

```pug
//- Использование компонентов
include /shared/ui/headless/icon/_index
include /shared/ui/headless/img/_index

+icon('arrow-right')
+img({ src: 'image.jpg', alt: 'Описание' })
```

## 📦 Работа с ассетами

### Изображения

1. Поместите исходники в `raw/img/`
2. Запустите `npm run prepare:tiny` для оптимизации
3. Используйте в коде:

```pug
+img({ src: PATH.img + '/photo.jpg', alt: 'Фото' })
```

### SVG спрайт

1. Добавьте SVG иконки в `raw/icons/`
2. Запустите `npm run prepare:sprite`
3. Используйте:

```pug
+icon('icon-name')
```

### Шрифты

1. Поместите TTF файлы в `raw/fonts/`
2. Запустите `npm run prepare:fonts`
3. Подключите в [`fonts.scss`](src/shared/styles/base/fonts.scss):

```scss
@include font-face("FontName", "font-file-name", 400, normal);
```

### Фавиконки

1. Создайте `raw/favicon/favicon.svg`
2. Запустите `npm run prepare:favicon`
3. Готовые фавиконки появятся в `public/favicon/`

## 🛠 TypeScript утилиты

### DOM helpers

```typescript
import {
  getElementIndex,
  setDropdownPosition,
  setHeightProperty,
  useIntersectionObserver,
} from "@/shared/lib/dom";

// Получить индекс элемента
const index = getElementIndex(element);

// Установить позицию dropdown
setDropdownPosition(dropdown, trigger);

// Установить CSS переменную высоты
setHeightProperty(element, "--header-height");

// Intersection Observer
useIntersectionObserver(elements, callback, options);
```

### Функции

```typescript
import { debounce, throttle } from "@/shared/lib/functions";

// Debounce
const debouncedFn = debounce(() => {
  console.log("Вызов с задержкой");
}, 300);

// Throttle
const throttledFn = throttle(() => {
  console.log("Вызов не чаще раза в 300мс");
}, 300);
```

## 🎯 Рекомендации

### Добавление новой страницы

1. Создайте `src/pages/new-page.pug`
2. Используйте базовый шаблон:

```pug
extends /app/templates/_default

block variables
  - const title = "Новая страница"

block content
  //- Контент
```

### Добавление нового компонента

1. Создайте папку в `src/shared/ui/component-name/`
2. Добавьте файлы:
   - `_index.pug` - разметка
   - `_index.scss` - стили
   - `index.ts` - логика (опционально)
3. Подключите в `src/shared/ui/_index.pug` и `_index.scss`

### Добавление виджета

1. Создайте папку в `src/widgets/widget-name/`
2. Структура аналогична компонентам
3. Подключите в `src/widgets/_index.pug` и `_index.scss`

## 🔧 Технологии

- [Vite](https://vitejs.dev/) - сборщик
- [Pug](https://pugjs.org/) - шаблонизатор
- [SCSS](https://sass-lang.com/) - препроцессор CSS
- [TypeScript](https://www.typescriptlang.org/) - типизация
- [React](https://react.dev/) - UI библиотека
- [Swiper](https://swiperjs.com/) - слайдер
- [ESLint](https://eslint.org/) - линтер JS/TS
- [Stylelint](https://stylelint.io/) - линтер CSS/SCSS
- [Prettier](https://prettier.io/) - форматтер кода
- [PurgeCSS](https://purgecss.com/) - оптимизация CSS

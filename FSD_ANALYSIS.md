# Анализ соответствия проекта методологии Feature-Sliced Design (FSD)

## 📊 Общая оценка: 6/10

Проект частично следует принципам FSD, но имеет существенные отклонения от канонической архитектуры.

---

## ✅ Что соответствует FSD

### 1. **Структура слоёв (Layers)**

Присутствуют основные слои FSD:

- ✅ [`app`](src/app/App.ts:1) - инициализация приложения
- ✅ [`widgets`](src/widgets/index.ts:1) - композитные блоки (page-header, page-footer)
- ✅ [`features`](src/features/index.ts:1) - бизнес-функциональность
- ✅ [`shared`](src/shared/ui/index.ts:1) - переиспользуемый код
- ✅ [`pages`](src/pages/index.pug:1) - страницы приложения

### 2. **Изоляция shared-слоя**

Слой [`shared`](src/shared/lib/functions/debounce.ts:1) правильно организован:

- [`lib`](src/shared/lib/functions/debounce.ts:1) - утилиты и хелперы
- [`ui`](src/shared/ui/buttons/btn/_index.scss:1) - UI-компоненты
- [`styles`](src/shared/styles/tokens.scss:1) - глобальные стили

### 3. **Использование алиасов**

Настроен алиас `@/` в [`vite.config.ts`](vite.config.ts:21), что упрощает импорты.

---

## ❌ Критические нарушения FSD

### 1. **Отсутствует слой `entities`** 🔴

**Проблема:** Нет слоя для бизнес-сущностей (User, Product, Order и т.д.)

**Последствия:**

- Нарушена иерархия слоёв
- Негде размещать модели данных и их логику
- Сложно масштабировать приложение

**Рекомендация:**

```
src/
  entities/
    user/
      model/
        types.ts
        store.ts
      ui/
        UserCard.tsx
      index.ts
```

### 2. **Неправильная организация features** 🔴

**Проблема:** Features организованы по техническому признаку, а не по бизнес-функциям:

```
features/
  animations/          ❌ технический признак
  calculations/        ❌ технический признак
  interactions/        ❌ технический признак
  layout/             ❌ технический признак
  vendors/            ❌ технический признак
```

**Правильно по FSD:**

```
features/
  auth/               ✅ бизнес-функция
    login/
    logout/
  cart/               ✅ бизнес-функция
    add-to-cart/
    remove-from-cart/
  product/            ✅ бизнес-функция
    add-review/
    toggle-favorite/
```

**Текущие "features" должны быть:**

- `animations/` → [`shared/lib/animations`](src/features/animations/index.ts:1)
- `calculations/` → [`shared/lib/calculations`](src/features/calculations/vh/index.ts:1)
- `interactions/back` → [`shared/ui/back-button`](src/features/interactions/back/index.ts:1) или [`features/navigation/go-back`](src/features/interactions/back/index.ts:1)
- `layout/` → [`shared/lib/layout`](src/features/layout/adaptive-move/index.ts:1)
- `vendors/` → [`shared/lib/vendors`](src/features/vendors/emerge/index.js:1)

### 3. **Нарушение Public API** 🔴

**Проблема:** Прямые импорты из внутренних файлов:

```typescript
// ❌ Плохо - импорт из внутреннего файла
import Form from "@/shared/lib/ui-classes/Form";

// ✅ Хорошо - импорт через Public API
import { Form } from "@/shared/lib/ui-classes";
```

**Рекомендация:** Создать файлы `index.ts` для экспорта:

```typescript
// src/shared/lib/ui-classes/index.ts
export { default as Form } from "./Form";
```

### 4. **Смешение слоёв в импортах** 🟡

**Проблема:** В [`features/index.ts`](src/features/index.ts:1) используются прямые импорты вместо реэкспорта:

```typescript
// ❌ Текущий подход
import "./calculations/navigator";
import "./calculations/scrollbar-width";

// ✅ Правильно по FSD
export { initNavigator } from "./calculations/navigator";
export { initScrollbarWidth } from "./calculations/scrollbar-width";
```

### 5. **Отсутствие сегментов (Segments)** 🟡

**Проблема:** Внутри слайсов нет чёткой структуры сегментов:

```
widgets/
  page-header/
    _index.pug        ❌ непонятная структура
    _index.scss
    index.ts
```

**Правильно по FSD:**

```
widgets/
  page-header/
    ui/               ✅ UI-компоненты
      PageHeader.tsx
      PageHeader.scss
    model/            ✅ Логика и состояние
      store.ts
    api/              ✅ API-запросы (если нужны)
      getHeaderData.ts
    index.ts          ✅ Public API
```

### 6. **Глобальная инициализация в app** 🟡

**Проблема:** [`App.ts`](src/app/App.ts:1) содержит слишком много логики (257 строк), которая должна быть в отдельных модулях.

**Рекомендация:**

```
app/
  providers/
    AppProvider.tsx
  config/
    routes.ts
    constants.ts
  lib/
    install.ts        ← вынести логику install/installClass
  index.ts
```

---

## 🟡 Средние нарушения

### 7. **Неправильное использование `_map`**

Папка [`src/_map`](src/_map/_index.pug:1) не соответствует FSD. Если это карта компонентов для разработки, её место в `app/dev-tools/` или вне `src/`.

### 8. **Отсутствие типизации Public API**

В [`features/index.ts`](src/features/index.ts:1) и [`widgets/index.ts`](src/widgets/index.ts:1) нет явных экспортов - только side-effects импорты.

### 9. **Смешение стилей и логики**

В [`shared/ui`](src/shared/ui/buttons/btn/_index.scss:1) используется Pug + SCSS + TS, но нет чёткого разделения на сегменты.

---

## 📋 Детальные рекомендации

### 1. Создать слой entities

```bash
mkdir -p src/entities
```

Пример структуры:

```
entities/
  user/
    model/
      types.ts
      store.ts
    ui/
      UserAvatar/
    lib/
      formatUserName.ts
    index.ts
```

### 2. Реорганизовать features

**Шаг 1:** Определить реальные бизнес-функции проекта
**Шаг 2:** Переместить технические утилиты в `shared`:

```typescript
// Было: features/calculations/vh/index.ts
// Стало: shared/lib/dom/vh.ts

// Было: features/animations/ripple-effect/index.ts
// Стало: shared/ui/ripple-effect/index.ts
```

**Шаг 3:** Создать настоящие features:

```
features/
  navigation/
    go-back/
      ui/
        BackButton.tsx
      model/
        useGoBack.ts
      index.ts
  form-submission/
    submit-contact-form/
      ui/
      model/
      index.ts
```

### 3. Внедрить Public API

Создать `index.ts` для каждого слайса:

```typescript
// src/shared/lib/functions/index.ts
export { default as debounce } from "./debounce";
export { default as throttle } from "./throttle";

// src/shared/lib/text/index.ts
export { default as addMask } from "./add-mask";
export { default as animateCount } from "./animate-count";
export { default as splitText } from "./split-text";
export { default as truncate } from "./truncate";

// src/shared/lib/ui-classes/index.ts
export { default as Form } from "./Form";
```

### 4. Исправить импорты

```typescript
// ❌ Было
import debounce from "@/shared/lib/functions/debounce";
import Form from "@/shared/lib/ui-classes/Form";

// ✅ Стало
import { debounce } from "@/shared/lib/functions";
import { Form } from "@/shared/lib/ui-classes";
```

### 5. Добавить сегменты в слайсы

```
widgets/
  page-header/
    ui/
      PageHeader.tsx
      PageHeader.module.scss
    model/
      useHeaderState.ts
    lib/
      helpers.ts
    index.ts          # export { PageHeader } from './ui/PageHeader'
```

### 6. Разделить App.ts

```typescript
// app/lib/installer.ts
export const install = (...) => { ... }
export const installClass = (...) => { ... }

// app/lib/script-loader.ts
export const loadScript = (...) => { ... }

// app/config/media-sizes.ts
export const sizes = { ... }

// app/App.ts (упрощённый)
import { install, installClass } from './lib/installer';
import { loadScript } from './lib/script-loader';
// ...
```

### 7. Настроить линтер для FSD

Установить `eslint-plugin-boundaries`:

```bash
npm install -D eslint-plugin-boundaries
```

Настроить правила импортов:

```javascript
// eslint.config.js
{
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
        { from: 'pages', allow: ['widgets', 'features', 'entities', 'shared'] },
        { from: 'widgets', allow: ['features', 'entities', 'shared'] },
        { from: 'features', allow: ['entities', 'shared'] },
        { from: 'entities', allow: ['shared'] },
        { from: 'shared', allow: ['shared'] }
      ]
    }]
  }
}
```

---

## 🎯 План миграции (приоритеты)

### Высокий приоритет (сделать в первую очередь)

1. ✅ Создать слой `entities` (если есть бизнес-сущности)
2. ✅ Переместить технические утилиты из `features` в `shared`
3. ✅ Внедрить Public API (создать `index.ts` файлы)
4. ✅ Исправить импорты на использование Public API

### Средний приоритет

5. ⚠️ Реорганизовать `features` по бизнес-функциям
6. ⚠️ Добавить сегменты (ui, model, lib, api) в слайсы
7. ⚠️ Разделить [`App.ts`](src/app/App.ts:1) на модули

### Низкий приоритет

8. 📝 Настроить eslint-plugin-boundaries
9. 📝 Документировать архитектуру
10. 📝 Переместить `_map` в dev-tools

---

## 📚 Полезные ссылки

- [Официальная документация FSD](https://feature-sliced.design/)
- [FSD на русском](https://feature-sliced.design/ru/)
- [Примеры проектов](https://github.com/feature-sliced/examples)
- [Telegram-чат FSD](https://t.me/feature_sliced)

---

## 🎓 Заключение

Проект имеет хорошую базу для перехода на FSD:

- ✅ Есть основные слои
- ✅ Настроены алиасы
- ✅ Используется модульная структура

Основные проблемы:

- ❌ Отсутствует слой `entities`
- ❌ Features организованы по техническому, а не бизнес-признаку
- ❌ Нет Public API
- ❌ Нарушена иерархия импортов

**Рекомендация:** Начать с создания Public API и переноса технических утилит из `features` в `shared`. Это даст быстрый результат без масштабного рефакторинга.

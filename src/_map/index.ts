// Точка входа скрипта карты вёрстки (/map).
// Отдельный вход сборки (см. vite.config.ts) — в main.min.js не попадает,
// поэтому не завязан на App.init()/install() из общего ядра приложения.

import mapDataJson from "./generated/data.json";

// Форма generated/data.json — источник истины см. app/modules/mapDataPlugin.ts
interface ColorEntry {
  name: string;
  value: string;
}

interface FontEntry {
  family: string;
  weight: string;
  style: string;
}

interface MapData {
  colors: ColorEntry[];
  fonts: FontEntry[];
  textClasses: string[];
}

const mapData = mapDataJson as MapData;

function escapeHtml(value: string): string {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

// ---------- Табы ----------

const TAB_IDS = ["pages", "typography", "palette", "icons", "content"] as const;
type TabId = (typeof TAB_IDS)[number];

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

function getTabFromHash(): TabId {
  const hash = location.hash.slice(1);
  return isTabId(hash) ? hash : TAB_IDS[0];
}

function initTabs(): void {
  const links = document.querySelectorAll<HTMLButtonElement>("[data-map-tab]");
  const panels = document.querySelectorAll<HTMLElement>("[data-map-panel]");

  const openTab = (id: TabId): void => {
    links.forEach((link) => link.classList.toggle("is-active", link.dataset.mapTab === id));
    panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.mapPanel === id));
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.dataset.mapTab;
      if (!id || !isTabId(id)) return;
      history.pushState(null, "", `#${id}`);
      openTab(id);
    });
  });

  window.addEventListener("popstate", () => openTab(getTabFromHash()));

  openTab(getTabFromHash());
}

// ---------- 1. Страницы ----------

interface PageInfo {
  route: string;
  title: string;
}

/** `/pages/index.pug` → `/`, `/pages/map/index.pug` → `/map`, `/pages/about.pug` → `/about` — как в @mish.dev/vite-convert-pug-in-html */
function pugPathToRoute(key: string): string {
  const withoutPages = key.replace(/^\/pages/, "");
  const withoutIndex = withoutPages.replace(/\/index\.pug$/, "") || "/";
  return withoutIndex.replace(/\.pug$/, "") || "/";
}

function renderPagesList(): void {
  const list = document.querySelector<HTMLElement>("[data-map-pages-list]");
  if (!list) return;

  const modules = import.meta.glob("/pages/**/*.pug", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const pages: PageInfo[] = Object.entries(modules)
    .filter(([key]) => !(key.split("/").pop() ?? "").startsWith("_"))
    .filter(([key]) => !key.startsWith("/pages/map/"))
    .map(([key, content]) => {
      const route = pugPathToRoute(key);
      const titleMatch = /var\s+title\s*=\s*"([^"]*)"/.exec(content);
      return { route, title: titleMatch?.[1] ?? route };
    })
    .sort((a, b) => a.route.localeCompare(b.route));

  if (pages.length === 0) {
    list.innerHTML = '<li class="map-panel__empty">Страницы не найдены</li>';
    return;
  }

  const baseUrl = document.body.dataset.baseUrl ?? "";

  list.innerHTML = pages
    .map(
      (page) => `
        <li>
          <a class="map-pages-list__link" href="${baseUrl}${page.route}">
            <span class="map-pages-list__title">${escapeHtml(page.title)}</span>
            <span class="map-pages-list__route">${escapeHtml(page.route)}</span>
          </a>
        </li>
      `
    )
    .join("");
}

// ---------- 2. Типографика: шрифты и текстовые классы ----------
// (заголовки h1–h6 свёрстаны статично в sections/typography/_index.pug)

const FONT_SAMPLE_TEXT =
  "Съешь ещё этих мягких французских булок да выпей чаю. The quick brown fox jumps over the lazy dog. 1234567890";

function renderFonts(): void {
  const container = document.querySelector<HTMLElement>("[data-map-fonts]");
  if (!container) return;

  if (mapData.fonts.length === 0) {
    container.innerHTML = '<p class="map-panel__empty">Начертания шрифтов не найдены</p>';
    return;
  }

  container.innerHTML = mapData.fonts
    .map((font) => {
      // "300 400 500 600 700 800" (вариативный шрифт) → отдельная строка-образец на каждое начертание
      const weights = font.weight.split(/\s+/).filter(Boolean);

      const samples = (weights.length > 0 ? weights : ["400"])
        .map(
          (weight) => `
            <p
              class="map-font-specimen__sample"
              style="font-family: '${escapeHtml(font.family)}', sans-serif; font-weight: ${escapeHtml(weight)};"
            >
              <span class="map-font-specimen__weight">${escapeHtml(weight)}</span>
              ${escapeHtml(FONT_SAMPLE_TEXT)}
            </p>
          `
        )
        .join("");

      return `
        <div class="map-font-specimen">
          <p class="map-font-specimen__meta">${escapeHtml(font.family)} · стиль: ${escapeHtml(font.style)}</p>
          ${samples}
        </div>
      `;
    })
    .join("");
}

function renderTextClasses(): void {
  const container = document.querySelector<HTMLElement>("[data-map-text-classes]");
  if (!container) return;

  if (mapData.textClasses.length === 0) {
    container.innerHTML = '<p class="map-panel__empty">Кастомные текстовые классы не найдены</p>';
    return;
  }

  container.innerHTML = mapData.textClasses
    .map(
      (className) => `
        <div class="map-text-classes__item">
          <span class="map-text-classes__name">.${escapeHtml(className)}</span><br>
          <span class="${escapeHtml(className)}">Пример текста</span>
        </div>
      `
    )
    .join("");
}

// ---------- 3. Палитра ----------

function renderPalette(): void {
  const container = document.querySelector<HTMLElement>("[data-map-palette]");
  if (!container) return;

  if (mapData.colors.length === 0) {
    container.innerHTML = '<p class="map-panel__empty">Цвета не найдены</p>';
    return;
  }

  container.innerHTML = mapData.colors
    .map(
      (color) => `
        <div class="map-swatch">
          <span class="map-swatch__color" style="background: ${escapeHtml(color.value)};"></span>
          <span class="map-swatch__name">${escapeHtml(color.name)}</span>
          <span class="map-swatch__value">${escapeHtml(color.value)}</span>
        </div>
      `
    )
    .join("");
}

// ---------- 4. Иконки ----------

async function renderIcons(): Promise<void> {
  const container = document.querySelector<HTMLElement>("[data-map-icons]");
  if (!container) return;

  const spriteUrl = container.dataset.spriteUrl;
  if (!spriteUrl) return;

  try {
    const response = await fetch(spriteUrl);
    const svgText = await response.text();
    const symbols = Array.from(
      new DOMParser().parseFromString(svgText, "image/svg+xml").querySelectorAll("symbol")
    );

    if (symbols.length === 0) {
      container.innerHTML = '<p class="map-panel__empty">Иконки не найдены</p>';
      return;
    }

    container.innerHTML = symbols
      .map((symbol) => {
        const id = symbol.getAttribute("id") ?? "";
        const viewBox = symbol.getAttribute("viewBox") ?? "0 0 20 20";
        return `
          <div class="map-icon-card">
            <span class="map-icon-card__preview">
              <svg viewBox="${escapeHtml(viewBox)}"><use xlink:href="${spriteUrl}#${id}"></use></svg>
            </span>
            <span class="map-icon-card__id">${escapeHtml(id)}</span>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Не удалось загрузить спрайт иконок:", error);
    container.innerHTML = '<p class="map-panel__empty">Не удалось загрузить спрайт</p>';
  }
}

// ---------- Инициализация ----------

initTabs();
renderPagesList();
renderFonts();
renderTextClasses();
renderPalette();
void renderIcons();

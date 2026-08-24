import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Генерирует src/_map/generated/data.json — данные для карты вёрстки (/map),
 * которые нельзя получить из клиентского JS напрямую, т.к. они живут в SCSS:
 * палитра ($colors), подключённые начертания шрифтов (@font-face) и
 * кастомные текстовые классы. Файл читает только сама карта (src/_map/index.ts),
 * в общий (main) бандл он не попадает.
 */

const VARIABLES_SCSS = path.resolve("src/shared/styles/variables.scss");
const FONTS_SCSS = path.resolve("src/shared/styles/base/fonts.scss");
const TEXT_SCSS = path.resolve("src/shared/styles/typography/text.scss");
const OUTPUT_JSON = path.resolve("src/_map/generated/data.json");

const WATCHED_FILES = new Set(
  [VARIABLES_SCSS, FONTS_SCSS, TEXT_SCSS].map((file) => file.replace(/\\/g, "/"))
);

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

function readSafe(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

/** Убирает строки, целиком являющиеся `//`-комментарием (в т.ч. закомментированные @font-face). */
function stripLineComments(scss: string): string {
  return scss
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

/** Парсит `$colors: (name: #hex, ...);` из variables.scss. */
function parseColors(scss: string): ColorEntry[] {
  const mapMatch = /\$colors:\s*\(([\s\S]*?)\)\s*;/.exec(scss);
  if (!mapMatch) return [];

  const colors: ColorEntry[] = [];
  const entryRe = /([\w-]+)\s*:\s*([^,\n]+),?/g;
  let entry: RegExpExecArray | null;

  while ((entry = entryRe.exec(mapMatch[1]))) {
    colors.push({ name: entry[1].trim(), value: entry[2].split("//")[0].trim() });
  }

  return colors;
}

/** Парсит `@font-face { font-family: ...; font-weight: ...; font-style: ...; }` из fonts.scss. */
function parseFonts(scss: string): FontEntry[] {
  const clean = stripLineComments(scss);
  const fonts: FontEntry[] = [];
  const blockRe = /@font-face\s*\{([\s\S]*?)\}/g;
  let block: RegExpExecArray | null;

  while ((block = blockRe.exec(clean))) {
    const body = block[1];
    const family = /font-family:\s*["']?([^;"']+)["']?\s*;/.exec(body)?.[1]?.trim();
    if (!family) continue;

    fonts.push({
      family,
      weight: /font-weight:\s*([^;]+);/.exec(body)?.[1]?.trim() ?? "400",
      style: /font-style:\s*([^;]+);/.exec(body)?.[1]?.trim() ?? "normal",
    });
  }

  return fonts;
}

/** Парсит имена классов верхнего уровня (`.classname {` / `.classname,`) из text.scss. */
function parseTextClasses(scss: string): string[] {
  const clean = stripLineComments(scss);
  const classes = new Set<string>();
  const classRe = /^\.([a-zA-Z][\w-]*)\s*(?:,|\{)/gm;
  let match: RegExpExecArray | null;

  while ((match = classRe.exec(clean))) classes.add(match[1]);

  return Array.from(classes);
}

function generateMapData(): void {
  const data: MapData = {
    colors: parseColors(readSafe(VARIABLES_SCSS)),
    fonts: parseFonts(readSafe(FONTS_SCSS)),
    textClasses: parseTextClasses(readSafe(TEXT_SCSS)),
  };

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function mapDataPlugin(): Plugin {
  return {
    name: "map-data",
    buildStart() {
      generateMapData();
    },
    handleHotUpdate({ file }) {
      if (WATCHED_FILES.has(file.replace(/\\/g, "/"))) {
        generateMapData();
      }
    },
  };
}

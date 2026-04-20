import { promises as fs } from "fs";
import path from "path";
import { Font } from "fonteditor-core";
import ttf2woff2 from "ttf2woff2";

const SRC = "./raw/fonts";
const DEST = "./public/assets/fonts";

// рекурсивный обход
const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    })
  );

  return files.flat();
};

const run = async () => {
  const allFiles = await walk(SRC);

  const fontFiles = allFiles.filter((f) =>
    /\.(ttf|otf)$/i.test(f)
  );

  await fs.mkdir(DEST, { recursive: true });

  for (const file of fontFiles) {
    const ext = path.extname(file);
    const name = path.basename(file, ext);

    let buffer = await fs.readFile(file);

    // otf → ttf
    if (ext === ".otf") {
      const font = Font.create(buffer, { type: "otf" });
      buffer = Buffer.from(font.write({ type: "ttf" }));
    }

    const font = Font.create(buffer, { type: "ttf" });

    // woff (через fonteditor-core)
    const woff = font.write({ type: "woff" });
    await fs.writeFile(
      path.join(DEST, `${name}.woff`),
      Buffer.from(woff)
    );

    // woff2 (через ttf2woff2)
    const woff2buf = ttf2woff2(buffer);
    await fs.writeFile(
      path.join(DEST, `${name}.woff2`),
      woff2buf
    );

    console.log(`✔ ${name}`);
  }

  console.log("Шрифты готовы!");
};

run().catch(console.error);
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import tinify from "tinify";

config();

tinify.key = process.env.KEY_TINYPNG;

const SRC = path.resolve("./raw/img");
const OUT = path.resolve("./public/assets/img");

const exts = new Set([".jpg", ".jpeg", ".png"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function compress(filePath) {
  const relative = path.relative(SRC, filePath);
  const outPath = path.join(OUT, relative);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log("compress:", relative);

  await tinify.fromFile(filePath).toFile(outPath);
}

async function run() {
  const files = walk(SRC);

  for (const file of files) {
    await compress(file);
  }

  console.log("Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

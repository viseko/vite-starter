import fs from "fs";
import path from "path";
import svgstore from "svgstore";

const SRC = path.resolve("./raw/icons/");
const OUT = path.resolve("./public/assets/img/sprite.svg");

const sprites = svgstore();

fs.readdirSync(SRC).forEach((file) => {
  if (!file.endsWith(".svg")) return;

  const id = path.basename(file, ".svg");
  const svg = fs.readFileSync(path.join(SRC, file), "utf8");

  sprites.add(id, svg);
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, sprites.toString({ inline: false }));

console.log("Спрайт готов!");

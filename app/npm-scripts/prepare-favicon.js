import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const SRC = "./raw/favicon/favicon.svg";
const DEST = "./public/favicon";

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const generatePng = async (input, output, size) => {
  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(output);
};

const generateIco = async (input, output) => {
  const sizes = [16, 32, 48];

  const buffers = await Promise.all(
    sizes.map((size) =>
      sharp(input)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  const ico = await pngToIco(buffers);
  await fs.writeFile(output, ico);
};

const generateManifest = async () => {
  const manifest = {
    name: "MyWebSite",
    short_name: "MySite",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  };

  await fs.writeFile(
    path.join(DEST, "site.webmanifest"),
    JSON.stringify(manifest, null, 2)
  );
};

const run = async () => {
  await ensureDir(DEST);

  await Promise.all([
    generatePng(SRC, path.join(DEST, "apple-touch-icon.png"), 180),
    generatePng(SRC, path.join(DEST, "favicon-96x96.png"), 96),
    generatePng(SRC, path.join(DEST, "web-app-manifest-192x192.png"), 192),
    generatePng(SRC, path.join(DEST, "web-app-manifest-512x512.png"), 512),
  ]);

  await generateIco(SRC, path.join(DEST, "favicon.ico"));

  await generateManifest();

  console.log("✔ favicon сгенерен");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
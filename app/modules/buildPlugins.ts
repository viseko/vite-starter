import { viteConvertPugInHtml } from "@mish.dev/vite-convert-pug-in-html";
import type { Plugin } from "vite";

export interface PluginsOptions {
  locals: Record<string, any>;
}

export default function buildPlugins(options: PluginsOptions) {
  const scssHmrPlugin: Plugin = {
    name: "scss-hmr",
    handleHotUpdate({ file, server }) {
      if (file.endsWith(".scss")) {
        console.log(`[HMR] SCSS file changed: ${file}`);
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };

  return [
    viteConvertPugInHtml({
      pugOptions: { pretty: true },
      locals: options.locals,
    }),
    scssHmrPlugin,
  ];
}

import { viteConvertPugInHtml } from '@mish.dev/vite-convert-pug-in-html';


export interface PluginsOptions {
  locals: Record<string, any>,
}

export default function buildPlugins(options: PluginsOptions) {
  return [
    viteConvertPugInHtml({
      pugOptions: { pretty: true },
      locals: options.locals,
    }),
  ]
}
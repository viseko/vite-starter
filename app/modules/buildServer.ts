export default function buildServer() {
  return {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    hmr: true,
  }
}
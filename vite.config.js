import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const entry = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      /* Three entry points. AtolyeCard.html and gizlilik-politikasi.html are
         self-contained — no module script, styles inline — so Rollup only
         copies them through; they're listed here purely so `npm run build`
         emits them into dist/. */
      input: {
        main: entry("./index.html"),
        card: entry("./AtolyeCard.html"),
        policy: entry("./gizlilik-politikasi.html"),
      },
    },
  },
  server: {
    /* Bind to the LAN, not just loopback. The page QR encodes
       window.location.href, so opening the app on localhost produces a QR
       pointing at the *scanning phone's* own localhost. Browse via the
       printed Network URL and the QR resolves to this machine instead. */
    host: true,
  },
});

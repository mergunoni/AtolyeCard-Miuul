import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    /* Bind to the LAN, not just loopback. The page QR encodes
       window.location.href, so opening the app on localhost produces a QR
       pointing at the *scanning phone's* own localhost. Browse via the
       printed Network URL and the QR resolves to this machine instead. */
    host: true,
  },
});

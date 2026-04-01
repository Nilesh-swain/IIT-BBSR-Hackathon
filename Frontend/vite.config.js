import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const frontendRoot = fileURLToPath(new URL("./", import.meta.url));
  const env = loadEnv(mode, frontendRoot, "");
  const proxyTarget = env.VITE_API_URL || "http://localhost:5000";

  return {
    envDir: frontendRoot,
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

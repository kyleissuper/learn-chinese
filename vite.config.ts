import { defineConfig } from "vite";
import { cpSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "agent-content",
      configureServer(server) {
        server.middlewares.use("/content", (req, res, next) => {
          const file = join("agent/content", req.url!);
          if (existsSync(file)) {
            res.setHeader("Content-Type", "application/json");
            res.end(readFileSync(file));
          } else next();
        });
      },
      writeBundle() {
        cpSync("agent/content", "dist/content", { recursive: true });
      },
    },
  ],
  build: { outDir: "dist" },
  server: {
    proxy: { "/api": "http://localhost:8788" },
  },
});

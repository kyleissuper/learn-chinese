import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["test/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    poolOptions: {
      workers: {
        main: "./test/entry.ts",
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});

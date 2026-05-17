import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/services/**",
        "src/utils/**",
        "src/mappers/**",
        "src/middlewares/**",
        "src/schemas/**",
      ],
    },
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
      ".jsx": [".tsx", ".jsx"],
    },
  },
})

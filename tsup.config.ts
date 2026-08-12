import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/http/index.ts", "src/realtime/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: "es2022",
});

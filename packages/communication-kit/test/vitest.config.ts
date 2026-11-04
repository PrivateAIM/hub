import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: { include: ['test/unit/**/*.spec.ts'] },
    plugins: [swc.vite()],
});

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: 'src/index.ts',
    format: 'esm',
    dts: false,
    sourcemap: true,
    plugins: [vue()],
});

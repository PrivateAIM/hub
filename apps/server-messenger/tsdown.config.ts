import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/**/*.ts'],
    format: 'esm',
    unbundle: true,
    dts: false,
    sourcemap: true,
    shims: true,
});

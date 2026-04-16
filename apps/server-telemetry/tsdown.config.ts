import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/**/*.ts'],
    format: 'esm',
    bundle: false,
    dts: false,
    sourcemap: true,
    shims: true,
});

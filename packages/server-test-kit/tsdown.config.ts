import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.ts', 'src/setup.ts'],
    format: 'esm',
    dts: true,
    sourcemap: true,
    shims: true,
    // Test-only dependencies used by the testcontainers helpers. They are declared
    // as devDependencies (not peers, so consumers that only use the fakes — e.g.
    // server-messenger — are not forced to provide them) and resolved from the
    // monorepo at runtime, so they must not be bundled into dist.
    external: [/^testcontainers/, /^vitest/, /^@privateaim\/kit/],
});

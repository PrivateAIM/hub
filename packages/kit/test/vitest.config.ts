/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/unit/**/*.spec.ts'],
        // `test/types/**` holds the compile-time guards (TypedContainer's mount-key
        // narrowing). Nothing else in CI typechecks test files — every
        // `tsconfig.build.json` includes `src/**` only — so they run here.
        typecheck: {
            enabled: true,
            include: ['test/types/**/*.test-d.ts'],
            tsconfig: 'tsconfig.json',
        },
    },
    plugins: [swc.vite()],
});

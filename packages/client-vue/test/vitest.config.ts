/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

// Hub's first non-node vitest environment and first SFC-transforming config:
// the other suites are all `plugins: [swc.vite()]` with the default node
// environment. `@vue/test-utils` needs a DOM, and the components under test
// are `.ts` render functions plus vuecs SFCs pulled in from node_modules.
export default defineConfig({
    test: {
        environment: 'happy-dom',
        include: ['test/unit/**/*.spec.ts'],
    },
    plugins: [vue()],
});

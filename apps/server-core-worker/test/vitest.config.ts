/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/unit/**/*.spec.ts'],

        // Spec files here share one on-disk directory, `writable/master-images`,
        // and the synchronizer `master-images.spec.ts` drives starts by deleting
        // it wholesale (GitHubClient.cloneRepository -> fs.rm(destination,
        // { recursive: true })). Run in parallel, that wipes the fixture
        // `components/master-image-builder/execute.spec.ts` is mid-build on.
        // Costs ~2s across the whole suite.
        fileParallelism: false,
    },
    plugins: [swc.vite()],
});

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

        // Two spec files share one on-disk directory, `writable/master-images`:
        //
        // - `master-images.spec.ts` drives the synchronizer, which begins by
        //   deleting that directory wholesale — `GitHubClient.cloneRepository`
        //   calls `fs.rm(destination, { recursive: true })` before cloning.
        // - `components/master-image-builder/execute.spec.ts` builds an image
        //   from a fixture it writes inside that same directory.
        //
        // Run in parallel, the first deletes the fixture the second is building
        // from. Serializing costs ~2s across the whole suite.
        fileParallelism: false,
    },
    plugins: [swc.vite()],
});

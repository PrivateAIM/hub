/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { defineConfig } from 'vitest/config';

// No plugins: the only suite here drives a vite plugin as a plain object and
// renders nothing, so it needs neither a DOM nor SFC compilation.
export default defineConfig({ test: { include: ['test/unit/**/*.spec.ts'] } });

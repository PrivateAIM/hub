/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import fs from 'node:fs';

import { createConfig } from '../../rollup.config.mjs';

const entrypoint = createConfig({
    pkg: JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), { encoding: 'utf-8' })),
});

const entrypoints = [
    {
        ...entrypoint,
        external: [
            'body-parser',
            'qs',
            'ioredis',
            'winston',
            'winston-transport',
        ],
    },
    {
        ...entrypoint,
        input: 'src/cli/index.ts',
        external: [
            ...entrypoint.external,
            'body-parser',
            'qs',
            'ioredis',
            'winston',
            'winston-transport',
        ],
        output: [
            {
                format: 'mjs',
                file: 'dist/cli/index.mjs',
            },
        ],
    },
];

export default entrypoints;

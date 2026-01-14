/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esmShim from '@rollup/plugin-esm-shim';
import { builtinModules } from 'node:module';
import swc from 'unplugin-swc';

const extensions = [
    '.js', '.mjs', '.cjs', '.ts', '.vue',
];

export function createConfig(
    {
        pkg,
        pluginsPre = [],
        pluginsPost = [],
        external = [],
    },
) {
    external = Object.keys(pkg.dependencies || {})
        .concat(Object.keys(pkg.peerDependencies || {}))
        .concat(builtinModules)
        .concat(external);

    return {
        input: 'src/index.ts',
        external,
        output: [
            {
                format: 'es',
                file: pkg.module,
                sourcemap: true,
            },
        ],
        plugins: [
            ...pluginsPre,

            commonjs(),
            // Allows node_modules resolution
            resolve({ extensions }),

            esmShim(),

            // Compile TypeScript/JavaScript files
            swc.rollup(),

            ...pluginsPost,
        ],
    };
}

/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import { Version, generate } from '@routup/swagger';
import { load } from 'locter';
import process from 'node:process';
import { useEnv } from '../../config';

export async function generateSwaggerDocumentation() {
    const packageJson = await load(path.join(process.cwd(), 'package.json')) as Record<string, any>;

    return generate({
        version: Version.V2,
        options: {
            metadata: {
                cache: false,
                entryPoint: [
                    { pattern: '**/*.ts', cwd: path.join(process.cwd(), 'src', 'http', 'controllers') },
                ],
                ignore: ['**/node_modules/**'],
                allow: ['**/@authup/**'],
            },
            yaml: true,
            servers: [useEnv('publicURL')],
            name: 'API Documentation',
            description: 'Explore the REST Endpoints of the Storage API.',
            version: packageJson.version,
            outputDirectory: path.join(process.cwd(), 'writable'),
            securityDefinitions: {},
            consumes: ['application/json'],
            produces: ['application/json'],
        },
    });
}

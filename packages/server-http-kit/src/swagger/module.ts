/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { GeneratorOptionsInput } from '@routup/swagger';
import { Version, generate } from '@routup/swagger';
import { load } from 'locter';
import process from 'node:process';
import type { SwaggerGenerateOptions } from './types';

export async function generateSwagger(options: SwaggerGenerateOptions) {
    const cwd = options.cwd || process.cwd();
    const packageJson = await load(path.join(cwd, 'package.json')) as Record<string, any>;

    const securityDefinitions : GeneratorOptionsInput['securityDefinitions'] = {
        bearer: {
            name: 'Bearer',
            type: 'apiKey',
            in: 'header',
        },

        basicAuth: {
            type: 'http',
            schema: 'basic',
        },
    };

    if (options.authupURL) {
        securityDefinitions.oauth2 = {
            type: 'oauth2',
            flows: {
                password: {
                    tokenUrl: new URL('token', options.authupURL).href,
                },
            },
        };
    }

    return generate({
        version: Version.V2,
        options: {
            metadata: {
                cache: false,
                entryPoint: [
                    { pattern: '**/*.ts', cwd: options.controllerBasePath },
                ],
                ignore: ['**/node_modules/**'],
                allow: ['**/@authup/**'],
            },
            yaml: false,
            servers: [
                options.baseURL,
            ],
            name: 'API Documentation',
            description: 'Explore the REST Endpoints.',
            version: packageJson.version,
            outputDirectory: path.join(cwd, 'writable'),
            securityDefinitions,
            consumes: ['application/json'],
            produces: ['application/json'],
        },
    });
}

/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SwaggerGenerateOptions } from './types';

// Swagger generation via @routup/swagger was removed in routup v5.
// Generation is now handled by @trapi/cli with trapi.config.ts per service.
// This stub preserves the export to avoid breaking the barrel re-export.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateSwagger(options: SwaggerGenerateOptions) {
    throw new Error(
        'generateSwagger() is no longer available. ' +
        'Use @trapi/cli with trapi.config.ts for swagger generation.',
    );
}

/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core';

// todo: also present in server-core package.
export function generateAnalysisMinioBucketName(id: Analysis['id']) {
    return `trains.${id}`;
}

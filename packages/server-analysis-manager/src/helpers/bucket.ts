/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core';
import type { BucketType } from '../constants';

export function buildBucketName(type: `${BucketType}`, id: Analysis['id']) {
    return `${type}.${id}`;
}

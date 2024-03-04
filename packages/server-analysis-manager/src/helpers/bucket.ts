/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core';
import { BucketType } from '../constants';

export function buildBucketName(type: `${BucketType}`, id: Analysis['id']) {
    switch (type) {
        case BucketType.CODE: {
            return `analysis-code-files.${id}`;
        }
        case BucketType.TEMP: {
            return `analysis-temp-files.${id}`;
        }
        case BucketType.RESULT: {
            return `analysis-result-files.${id}`;
        }
    }

    throw new SyntaxError('The argument can only have any bucket type value.');
}

/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '../analysis';
import { AnalysisBucketType } from './constants';

export function buildAnalysisBucketName(
    type: `${AnalysisBucketType}`,
    id: Analysis['id'],
) {
    switch (type) {
        case AnalysisBucketType.CODE: {
            return `analysis-code-files.${id}`;
        }
        case AnalysisBucketType.TEMP: {
            return `analysis-temp-files.${id}`;
        }
        case AnalysisBucketType.RESULT: {
            return `analysis-result-files.${id}`;
        }
    }

    throw new SyntaxError('The argument can only have any bucket type value.');
}

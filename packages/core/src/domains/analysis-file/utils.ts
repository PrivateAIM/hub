/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '../analysis';
import { AnalysisFileType } from './constants';

export function buildAnalysisFileBucketName(
    type: `${AnalysisFileType}`,
    id: Analysis['id'],
) {
    switch (type) {
        case AnalysisFileType.CODE: {
            return `analysis-code-files.${id}`;
        }
        case AnalysisFileType.TEMP: {
            return `analysis-temp-files.${id}`;
        }
        case AnalysisFileType.RESULT: {
            return `analysis-result-files.${id}`;
        }
    }

    throw new SyntaxError('The argument can only have any bucket type value.');
}

/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisFileType, buildAnalysisFileBucketName } from '@privateaim/core';
import { isClientErrorWithStatusCode } from 'hapic';
import { useStorageClient } from '../../../../core';
import { CoreCommand } from '../../constants';
import type { CoreConfigurePayload } from '../../type';
import { useCoreLogger } from '../../utils';

export async function executeCoreConfigureCommand(
    payload: CoreConfigurePayload,
) : Promise<CoreConfigurePayload> {
    const logger = useCoreLogger();
    const storage = useStorageClient();

    logger.debug('Creating analysis buckets...', {
        command: CoreCommand.CONFIGURE,
    });

    const names = [
        buildAnalysisFileBucketName(AnalysisFileType.CODE, payload.id),
        buildAnalysisFileBucketName(AnalysisFileType.TEMP, payload.id),
        buildAnalysisFileBucketName(AnalysisFileType.RESULT, payload.id),
    ];

    for (let i = 0; i < names.length; i++) {
        try {
            await storage.bucket.create({ name: names[i] });
        } catch (e) {
            if (isClientErrorWithStatusCode(e, [409])) {
                continue;
            }

            throw e;
        }
    }

    logger.debug('Created analysis buckets...', {
        command: CoreCommand.CONFIGURE,
    });

    return payload;
}

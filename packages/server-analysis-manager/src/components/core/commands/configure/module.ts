/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BucketType } from '../../../../constants';
import { useStorageClient } from '../../../../core';
import { buildBucketName } from '../../../../helpers';
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

    await storage.bucket.create({ name: buildBucketName(BucketType.FILES, payload.id) });
    await storage.bucket.create({ name: buildBucketName(BucketType.TEMP, payload.id) });
    await storage.bucket.create({ name: buildBucketName(BucketType.RESULTS, payload.id) });

    logger.debug('Created analysis buckets...', {
        command: CoreCommand.CONFIGURE,
    });

    return payload;
}

/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BucketType } from '../../../../constants';
import { useStorageClient } from '../../../../core';
import { buildBucketName } from '../../../../helpers';
import type { CoreDestroyPayload } from '../../type';

export async function executeCoreDestroyCommand(
    payload: CoreDestroyPayload,
) : Promise<CoreDestroyPayload> {
    const storage = useStorageClient();

    await storage.bucket.delete(buildBucketName(BucketType.FILES, payload.id));
    await storage.bucket.delete(buildBucketName(BucketType.TEMP, payload.id));
    await storage.bucket.delete(buildBucketName(BucketType.RESULTS, payload.id));

    return payload;
}

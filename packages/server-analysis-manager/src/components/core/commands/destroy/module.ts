/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getMinioBucketObjectList, useMinio } from '../../../../core';
import type { CoreDestroyPayload } from '../../type';
import { buildMinioBucketName } from '../utils';

export async function executeCoreDestroyCommand(
    payload: CoreDestroyPayload,
) : Promise<CoreDestroyPayload> {
    const minio = useMinio();

    const bucketName = buildMinioBucketName(payload.id);
    const hasBucket = await minio.bucketExists(bucketName);
    if (hasBucket) {
        const items = await getMinioBucketObjectList(minio, bucketName);
        await minio.removeObjects(bucketName, items);
        await minio.removeBucket(bucketName);
    }

    return payload;
}

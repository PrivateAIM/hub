/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionDeniedError } from '@privateaim/errors';
import type { StorageCapabilityActionName } from '@privateaim/storage-kit';
import { capabilityCoversBucket, capabilityCoversBucketFile } from '@privateaim/storage-kit';
import type { StorageCapability } from './types.ts';

export function assertCapabilityCoversBucket(
    capability: StorageCapability,
    bucketId: string,
    action: StorageCapabilityActionName,
): void {
    if (!capabilityCoversBucket(capability.entries, bucketId, action)) {
        throw new PermissionDeniedError(`The capability does not cover ${action} on this bucket.`);
    }
}

export function assertCapabilityCoversBucketFile(
    capability: StorageCapability,
    file: { id: string, bucketId: string },
    action: StorageCapabilityActionName,
): void {
    if (!capabilityCoversBucketFile(capability.entries, file, action)) {
        throw new PermissionDeniedError(`The capability does not cover ${action} on this bucket file.`);
    }
}

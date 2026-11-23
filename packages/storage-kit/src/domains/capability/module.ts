/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CapabilityEntry } from '@privateaim/kit';
import { StorageCapabilityAction, StorageCapabilityType } from './constants';
import type { StorageCapabilityActionName } from './types';

const ALLOWED_ACTIONS: Record<StorageCapabilityType, string[]> = {
    [StorageCapabilityType.BUCKET]: [
        StorageCapabilityAction.READ,
        StorageCapabilityAction.WRITE,
        StorageCapabilityAction.DELETE,
    ],
    [StorageCapabilityType.BUCKET_FILE]: [
        StorageCapabilityAction.READ,
        StorageCapabilityAction.DELETE,
    ],
};

function isStorageCapabilityType(value: string): value is StorageCapabilityType {
    return Object.values<string>(StorageCapabilityType).includes(value);
}

/**
 * @throws TypeError if the type is unknown or an action is not allowed for the type.
 */
export function assertStorageCapabilityEntry(entry: CapabilityEntry): void {
    if (!isStorageCapabilityType(entry.type)) {
        throw new TypeError(`Unknown storage capability type "${entry.type}".`);
    }

    const allowed = ALLOWED_ACTIONS[entry.type];

    for (const action of entry.actions) {
        if (!allowed.includes(action)) {
            throw new TypeError(`Action "${action}" is not allowed for storage capability type "${entry.type}".`);
        }
    }
}

function collectIds(
    entries: CapabilityEntry[],
    type: StorageCapabilityType,
    action: StorageCapabilityActionName,
): string[] {
    return entries
        .filter((entry) => entry.type === type && entry.actions.includes(action))
        .map((entry) => entry.id);
}

export function capabilityBucketIds(
    entries: CapabilityEntry[],
    action: StorageCapabilityActionName,
): string[] {
    return collectIds(entries, StorageCapabilityType.BUCKET, action);
}

export function capabilityBucketFileIds(
    entries: CapabilityEntry[],
    action: StorageCapabilityActionName,
): string[] {
    return collectIds(entries, StorageCapabilityType.BUCKET_FILE, action);
}

export function capabilityCoversBucket(
    entries: CapabilityEntry[],
    bucketId: string,
    action: StorageCapabilityActionName,
): boolean {
    return capabilityBucketIds(entries, action).includes(bucketId);
}

export function capabilityCoversBucketFile(
    entries: CapabilityEntry[],
    file: { id: string, bucketId: string },
    action: StorageCapabilityActionName,
): boolean {
    return capabilityCoversBucket(entries, file.bucketId, action) ||
        capabilityBucketFileIds(entries, action).includes(file.id);
}

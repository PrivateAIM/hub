/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHash } from 'node:crypto';
import type { RegistryProjectMigrationMarker } from './types.ts';

export function buildRegistryProjectMigrationRobotName(id: string, targetName: string): string {
    const suffix = createHash('sha256').update(targetName).digest('hex').slice(0, 12);

    return `flame-migration-${id}-${suffix}`;
}

export function parseRegistryProjectMigrationMarker(description: unknown): RegistryProjectMigrationMarker | undefined {
    if (typeof description !== 'string') {
        return undefined;
    }

    try {
        const value: unknown = JSON.parse(description);

        if (typeof value !== 'object' || value === null ||
            !('kind' in value) || value.kind !== 'privateaim-registry-project-migration' ||
            !('version' in value) || value.version !== 1) {
            return undefined;
        }

        const keys = [
            'registryId', 
            'registryProjectId', 
            'sourceExternalName', 
            'sourceExternalId',
            'targetExternalName', 
            'targetExternalId',
        ] as const;

        for (const key of keys) {
            if (!(key in value) || typeof value[key] !== 'string' || value[key].length === 0) {
                return undefined;
            }
        }

        if (!('sourceExternalId' in value) || !('targetExternalId' in value) ||
            !/^[1-9]\d*$/.test(String(value.sourceExternalId)) ||
            !/^[1-9]\d*$/.test(String(value.targetExternalId)) ||
            value.sourceExternalId === value.targetExternalId) {
            return undefined;
        }

        // Validate each property above: descriptions are remote, untrusted JSON.
        return value as RegistryProjectMigrationMarker;
    } catch {
        return undefined;
    }
}

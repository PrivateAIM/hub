/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HarborClient } from '@hapic/harbor';
import { parseRegistryProjectMigrationMarker } from '../project/relink/marker.ts';

/**
 * Migration robots are durable retention records, including after local cutover.
 * Read every page before deleting anything; an unavailable or damaged record
 * must stop cleanup rather than turn a retained source into an orphan.
 */
export async function collectRegistryMigrationRetainedProjectIds(client: HarborClient): Promise<Set<string>> {
    const retained = new Set<string>();
    const pageSize = 100;

    for (let page = 1; ; page++) {
        const { data: robots } = await client.robot.getMany({ query: { page, page_size: pageSize } });

        for (const robot of robots) {
            const marker = parseRegistryProjectMigrationMarker(robot.description);

            if (marker) {
                retained.add(marker.sourceExternalId);
                retained.add(marker.targetExternalId);
            } else if (robot.name.includes('flame-migration-')) {
                throw new Error(`Registry cleanup refused: migration robot ${robot.id} has no valid retention record.`);
            }
        }

        if (robots.length < pageSize) {
            return retained;
        }
    }
}

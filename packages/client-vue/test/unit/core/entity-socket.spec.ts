/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { resolveEntitySocketRealmId } from '../../../src/core/entity-socket';

// The global namespace needs a grant reaching every realm, so a realm-bound
// user connecting there is refused and loses realtime silently.
describe('entity socket namespace', () => {
    it('should use the requested realm', () => {
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, 'a', 'm')).toBe('a');
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, ref('a'), 'm')).toBe('a');
    });

    it('should fall back to the management realm, also for an empty ref', () => {
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, undefined, 'm')).toBe('m');
        expect(resolveEntitySocketRealmId(DomainType.ANALYSIS, ref(undefined), 'm')).toBe('m');
    });

    it('should use the global namespace for realm-less catalogs, whose events are published only there', () => {
        for (const type of [DomainType.MASTER_IMAGE, DomainType.MASTER_IMAGE_GROUP, DomainType.REGISTRY, DomainType.REGISTRY_PROJECT]) {
            expect(resolveEntitySocketRealmId(type, ref('a'), 'm')).toBeUndefined();
        }
    });
});

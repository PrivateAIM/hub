/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import FMasterImagePicker from '../../../src/components/master-image/FMasterImagePicker.vue';
import { mountClientVueComponent } from '../../utils';

/**
 * The create-mode path through `createEntityManager`, exercised on a real form
 * component rather than a synthetic probe.
 *
 * `FProjectForm` initialises `form.masterImageId` to `''` and passes it straight
 * in as `entityId` — a blank id is how "no entity yet" is expressed, not a
 * caller bug. It must resolve to nothing, quietly, without adopting an existing
 * master image.
 *
 * `FMasterImages` is behind `v-if="isVirtualGroupPathDefined"`, so with no group
 * chosen the picker renders only the group list. Any request to `/master-images`
 * therefore came from the entity manager — either a `getOne` on a blank id
 * (which would address the COLLECTION endpoint) or a `limit: 1` collection read
 * that substitutes an arbitrary image into the form.
 */
const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

describe('FMasterImagePicker', () => {
    it('should adopt nothing when the id is blank, and issue no master-image request', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FMasterImagePicker,
            { entityId: '' },
            {
                core: {
                    'GET /master-image-groups': () => ({ data: [], meta: { total: 0 } }),
                    'GET /master-images': () => ({
                        data: [{ id: 'someone-elses', name: 'not-picked' }],
                        meta: { total: 1 },
                    }),
                    'GET /master-images/:id': () => ({
                        data: { id: 'someone-elses', name: 'not-picked' },
                        meta: {},
                    }),
                },
            },
        );

        await flush();

        const masterImageRequests = coreClient.requests
            .filter((request) => request.url.includes('master-images'));

        expect(masterImageRequests).toHaveLength(0);
        expect(wrapper.emitted('resolved')).toBeTruthy();
        expect(wrapper.emitted('resolved')[0][0]).toBeUndefined();
    });

    it('should resolve the record when a real id is given', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FMasterImagePicker,
            { entityId: 'abc' },
            {
                core: {
                    'GET /master-image-groups': () => ({ data: [], meta: { total: 0 } }),
                    'GET /master-images/:id': (request) => ({
                        data: { id: request.params.id, name: 'picked' },
                        meta: {},
                    }),
                },
            },
        );

        await flush();

        const recordRequests = coreClient.requests
            .filter((request) => request.params && request.params.id === 'abc');

        expect(recordRequests).toHaveLength(1);
        expect(wrapper.emitted('resolved')).toBeTruthy();
        expect(wrapper.emitted('resolved')[0][0]).toMatchObject({ id: 'abc', name: 'picked' });
    });
});

/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { FProjectForm } from '../../../src/components/project/FProjectForm';
import { mountClientVueComponent } from '../../utils';

const flush = () => new Promise((resolve) => {
    setTimeout(resolve, 0);
});

/**
 * Attaching a node requires PROJECT_UPDATE server-side, so a caller holding
 * only PROJECT_CREATE must not be offered the node picker: its picks would
 * fail after the project was already created.
 */
describe('FProjectForm', () => {
    it('should hide the node picker without project_update', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FProjectForm,
            {},
            { core: { 'GET /master-image-groups': () => ({ data: [], meta: { total: 0 } }) } },
        );

        await flush();

        expect(wrapper.text()).toContain('requires the project_update permission');
        expect(coreClient.requests.filter((request) => request.url.includes('/nodes'))).toHaveLength(0);
    });
});

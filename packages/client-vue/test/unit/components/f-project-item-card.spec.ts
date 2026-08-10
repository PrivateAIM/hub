/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import { describe, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import FProjectItemCard from '../../../src/components/project/FProjectItemCard.vue';
import { createTestProject, createTestProjectNode } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

describe('components/FProjectItemCard', () => {
    it('should render the fleet distribution from the project-node join', async () => {
        const nodes = [
            createTestProjectNode({ approvalStatus: ProjectNodeApprovalStatus.APPROVED }),
            createTestProjectNode({ approvalStatus: ProjectNodeApprovalStatus.APPROVED }),
            createTestProjectNode({ approvalStatus: null }),
            createTestProjectNode({ approvalStatus: ProjectNodeApprovalStatus.REJECTED }),
        ];
        const entity = createTestProject({ nodes: nodes.length, analyses: 2 });

        const { wrapper, coreClient } = mountClientVueComponent(FProjectItemCard, { entity }, { core: { 'GET /project-nodes': () => ({ data: nodes, meta: { total: nodes.length } }) } });

        await flushPromises();

        expect(coreClient.requests[0]).toMatchObject({ method: 'GET' });
        expect(coreClient.requests[0].url).toContain('/project-nodes');
        expect(coreClient.requests[0].url).toContain(entity.id);

        expect(wrapper.text()).toContain('2');
        expect(wrapper.text()).toContain('joined');
        expect(wrapper.text()).toContain('invited');
        expect(wrapper.text()).toContain('declined');
        expect(wrapper.text()).toContain('analyses');
    });

    it('should not fetch the join for a project without nodes', async () => {
        const entity = createTestProject({ nodes: 0 });

        const { wrapper, coreClient } = mountClientVueComponent(FProjectItemCard, { entity }, { core: {} });

        await flushPromises();

        expect(coreClient.requests).toHaveLength(0);
        expect(wrapper.text()).toContain('no nodes assigned yet');
    });
});

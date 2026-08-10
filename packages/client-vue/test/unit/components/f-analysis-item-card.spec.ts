/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { describe, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import FAnalysisItemCard from '../../../src/components/analysis/FAnalysisItemCard.vue';
import FAnalysisNodeDistribution from '../../../src/components/analysis-node/FAnalysisNodeDistribution.vue';
import { createTestAnalysis, createTestAnalysisNode } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

const healthyNode = () => createTestAnalysisNode({
    approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
    executionStatus: ProcessStatus.EXECUTED,
    executionProgress: 100,
});

describe('components/FAnalysisItemCard', () => {
    it('should render one lane per node while the fleet fits the budget', async () => {
        const nodes = [
            healthyNode(),
            createTestAnalysisNode({ approvalStatus: null }),
        ];
        const entity = createTestAnalysis({ nodes: 2, nodesApproved: 1 });

        const { wrapper, coreClient } = mountClientVueComponent(FAnalysisItemCard, { entity }, { core: { 'GET /analysis-nodes': () => ({ data: nodes, meta: { total: nodes.length } }) } });

        await flushPromises();

        expect(coreClient.requests[0]).toMatchObject({ method: 'GET' });
        expect(coreClient.requests[0].url).toContain('/analysis-nodes');
        expect(coreClient.requests[0].url).toContain(entity.id);

        expect(wrapper.text()).toContain(nodes[0].node.name);
        expect(wrapper.text()).toContain(nodes[1].node.name);
        // no summary, no expander below the budget
        expect(wrapper.text()).not.toContain('more nodes on track');
        expect(wrapper.findComponent(FAnalysisNodeDistribution).exists()).toBeFalsy();
    });

    it('should summarize and lead with exceptions above the budget', async () => {
        const rejected = createTestAnalysisNode({
            approvalStatus: AnalysisNodeApprovalStatus.REJECTED,
            comment: 'GPU capacity exhausted',
        });
        const healthy = Array.from({ length: 7 }, healthyNode);
        const nodes = [...healthy, rejected];
        const entity = createTestAnalysis({ nodes: nodes.length, nodesApproved: 7 });

        const { wrapper } = mountClientVueComponent(FAnalysisItemCard, { entity }, { core: { 'GET /analysis-nodes': () => ({ data: nodes, meta: { total: nodes.length } }) } });

        await flushPromises();

        // distribution summary rows
        expect(wrapper.findComponent(FAnalysisNodeDistribution).exists()).toBeTruthy();
        expect(wrapper.text()).toContain('rejected');

        // only the exception lane is visible; the healthy fleet is collapsed
        expect(wrapper.text()).toContain(rejected.node.name);
        expect(wrapper.text()).not.toContain(healthy[0].node.name);
        expect(wrapper.text()).toContain('7 more nodes');

        // expanding reveals the collapsed lanes
        const expander = wrapper.findAll('button').find(
            (button) => button.text().includes('more nodes'),
        );
        expect(expander).toBeDefined();

        await expander!.trigger('click');
        expect(wrapper.text()).toContain(healthy[0].node.name);
        expect(wrapper.text()).toContain('collapse');
    });

    it('should not fetch nodes for an analysis without any', async () => {
        const entity = createTestAnalysis({ nodes: 0 });

        const { wrapper, coreClient } = mountClientVueComponent(FAnalysisItemCard, { entity }, { core: {} });

        await flushPromises();

        expect(coreClient.requests).toHaveLength(0);
        expect(wrapper.text()).toContain('Configuration');
    });
});

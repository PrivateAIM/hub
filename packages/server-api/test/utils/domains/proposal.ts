/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@personalhealthtrain/core';
import { ProposalRisk } from '@personalhealthtrain/core';
import type { SuperTest, Test } from 'supertest';

export const TEST_DEFAULT_PROPOSAL : Partial<Project> = {
    name: 'development',
    requested_data: 'I request everything and more :P',
    risk_comment: 'There is no risk at all :) ^^',
    risk: ProposalRisk.LOW,
};

export async function createSuperTestProposal(superTest: SuperTest<Test>, proposal?: Partial<Project>) {
    return superTest
        .post('/proposals')
        .send({
            ...TEST_DEFAULT_PROPOSAL,
            ...(proposal || {}),
        })
        .auth('admin', 'start123');
}

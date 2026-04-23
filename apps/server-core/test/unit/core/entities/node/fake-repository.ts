/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import type { INodeRepository } from '../../../../../src/core/entities/node/types.ts';
import { FakeEntityRepository } from '@privateaim/server-test-kit';

export class FakeNodeRepository extends FakeEntityRepository<Node> implements INodeRepository {
    async findOneWithExternalName(id: string): Promise<Node | null> {
        return this.findOneById(id);
    }
}

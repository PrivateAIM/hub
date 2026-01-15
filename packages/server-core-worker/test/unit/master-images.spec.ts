/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import type { MasterImageSynchronizerEventMap } from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerCommand,
} from '@privateaim/server-core-worker-kit';
import { DirectComponentCaller } from '@privateaim/server-kit';
import { MasterImageSynchronizerComponent } from '../../src';

describe('components > master-images', () => {
    it('should clone master images to directory', async () => {
        const caller = new DirectComponentCaller<MasterImageSynchronizerEventMap>(
            new MasterImageSynchronizerComponent(),
        );

        const output = await caller.callAndWait(
            MasterImageSynchronizerCommand.EXECUTE,
            {
                owner: 'PrivateAim',
                repository: 'master-images',
                branch: 'develop',
            },
            {},
        );
        expect(output.executionFinished).toBeDefined();

        const { executionFinished: data } = output;

        expect(data.images.length).toBeGreaterThan(0);
        expect(data.groups.length).toBeGreaterThan(0);
    });
});

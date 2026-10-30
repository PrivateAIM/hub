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
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import { LocalDispatcher } from 'hubwire';
import { MasterImageSynchronizerComponent } from '../../src/app/components/index.ts';

describe('components > master-images', () => {
    it('should clone master images to directory', async () => {
        const dispatcher = new LocalDispatcher<MasterImageSynchronizerEventMap>(
            new MasterImageSynchronizerComponent(),
        );

        const { replies } = await dispatcher.dispatch(
            MasterImageSynchronizerCommand.EXECUTE,
            {
                owner: 'PrivateAim',
                repository: 'master-images',
                branch: 'develop',
            },
        );
        const finished = replies.find((reply) => reply.key === MasterImageSynchronizerEvent.EXECUTION_FINISHED);

        expect(finished).toBeDefined();

        expect(finished!.data.images.length).toBeGreaterThan(0);
        expect(finished!.data.groups.length).toBeGreaterThan(0);
    });
});

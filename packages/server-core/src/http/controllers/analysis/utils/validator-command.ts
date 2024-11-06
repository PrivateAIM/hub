/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { AnalysisAPICommand } from '@privateaim/core-kit';
import { createValidationChain, createValidator } from '@validup/adapter-validator';
import { Container } from 'validup';

export class AnalysisCommandValidator extends Container<{ command: AnalysisAPICommand }> {
    protected initialize() {
        super.initialize();

        this.mount(
            'command',
            createValidator(() => {
                const chain = createValidationChain();
                return chain
                    .exists()
                    .custom((command) => Object.values(AnalysisAPICommand).includes(command));
            }),
        );
    }
}

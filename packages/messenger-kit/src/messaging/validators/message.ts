/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { z } from 'zod';
import { createValidator } from '@validup/zod';
import { Container } from 'validup';
import type { CTSMessagingMessage } from '../types';
import { CTSMessagingPartyValidator } from './to';

export class CTSMessagingMessageValidator extends Container<CTSMessagingMessage> {
    protected initialize() {
        super.initialize();

        this.mount(
            'data',
            createValidator(
                z.looseObject({})
                    .or(z.string())
                    .or(z.null())
                    .or(z.undefined())
                    .optional(),
            ),
        );

        this.mount(
            'metadata',
            createValidator(
                z.looseObject({})
                    .or(z.null())
                    .or(z.undefined())
                    .optional(),
            ),
        );

        const partyValidator = new CTSMessagingPartyValidator();

        this.mount('to', async (ctx) => {
            // @validup/zod 0.3 returns a ValidatorDescriptor ({ run }) —
            // mount() normalises those, but manual invocation must call
            // `.run()` instead of the descriptor itself.
            const validator = createValidator(
                z.array(z.looseObject({})),
            );

            const output = (await validator.run(ctx)) as unknown[];
            return Promise.all(output.map((el) => partyValidator.run(el, {
                path: ctx.path,
                group: ctx.group,
            })));
        });
    }
}

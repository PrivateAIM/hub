/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { z } from 'zod';
import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import type { CTSMessagingMessage } from '../types';
import { CTSMessagingPartyValidator } from './to';

export class CTSMessagingMessageValidator extends Container<CTSMessagingMessage> {
    protected initialize() {
        super.initialize();

        this.mount(
            'data',
            createValidator(
                z.object({})
                    .passthrough()
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
            const validator = createValidator(
                z.array(z.looseObject({})),
            );

            const output = (await validator(ctx)) as unknown[];
            return Promise.all(output.map((el) => partyValidator.run(el, {
                path: ctx.path,
                group: ctx.group,
            })));
        });
    }
}

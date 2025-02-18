/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import { z } from 'zod';
import type { MasterImageCommandArgument } from '@privateaim/core-kit';
import type { MasterImageSyncAttributes } from '../types';
import { MasterImageCommandArgumentValidator } from './command-argument';

export class MasterImageSyncAttributesValidator extends Container<MasterImageSyncAttributes> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            createValidator(
                z.string()
                    .min(3)
                    .max(128),
            ),
        );

        this.mount(
            'command',
            { optional: true },
            createValidator(
                z.string()
                    .min(3)
                    .max(256),
            ),
        );

        const commandArgumentValidator = new MasterImageCommandArgumentValidator();
        this.mount('commandArguments', { optional: true }, (ctx) => {
            if (!Array.isArray(ctx.value)) {
                // todo: throw error
                return undefined;
            }

            /*
            todo: support string[] or [ { value: "xxx", "position": "xxx"]
            const container = new Container({ oneOf: true });
            container.mount(() => {

            });
             */
            const value : unknown[] = ctx.value.map((child) => {
                if (typeof child === 'string') {
                    return {
                        value: child,
                    } satisfies MasterImageCommandArgument;
                }

                return child;
            });

            const promises = value.map((child) => commandArgumentValidator.run(child, {
                group: ctx.group,
                flat: false,
                path: ctx.pathAbsolute,
            }));

            return Promise.all(promises);
        });
    }
}

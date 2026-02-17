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
import { DockenImageAttributeCommandArguments } from './image-command-argument';
import type { DockenImageAttributes } from '../types';

export class DockenImageAttributesValidator extends Container<DockenImageAttributes> {
    protected initialize() {
        super.initialize();

        this.mount(
            'name',
            { optional: true },
            createValidator(
                z.string()
                    .min(1)
                    .max(128)
                    .or(z.null())
                    .or(z.undefined())
                    .optional(),
            ),
        );

        this.mount(
            'command',
            createValidator(
                z.string()
                    .min(3)
                    .max(256),
            ),
        );

        const commandArgumentValidator = new DockenImageAttributeCommandArguments();
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
                path: ctx.path,
            }));

            return Promise.all(promises);
        });
    }
}

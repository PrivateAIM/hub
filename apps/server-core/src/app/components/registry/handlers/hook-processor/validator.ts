/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line max-classes-per-file
import zod from 'zod';
import { TypedContainer } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import type {
    RegistryHook,
    RegistryHookEventData,
    RegistryHookRepository,
    RegistryHookResource,
} from './types.ts';

class RegistryHookResourceValidator extends TypedContainer<RegistryHookResource> {
    protected initialize() {
        super.initialize();

        this.mount('digest', createValidator(
            zod.string(),
        ));

        this.mount('tag', createValidator(
            zod.string().min(1).max(100),
        ));

        this.mount('resource_url', createValidator(
            zod.string(),
        ));
    }
}

class RegistryHookRepositoryValidator extends TypedContainer<RegistryHookRepository> {
    protected initialize() {
        super.initialize();

        this.mount('name', createValidator(
            zod.string().min(3).max(128),
        ));

        this.mount('repo_full_name', createValidator(
            zod.string().min(3).max(256),
        ));

        this.mount('namespace', createValidator(
            zod.string().min(3).max(128),
        ));
    }
}

class RegistryHookEventDataValidator extends TypedContainer<RegistryHookEventData> {
    protected initialize() {
        super.initialize();

        this.mount('repository', new RegistryHookRepositoryValidator());

        const resourceValidator = new RegistryHookResourceValidator();
        this.mount('resources', (ctx) => {
            if (!Array.isArray(ctx.value)) {
                return undefined;
            }

            return Promise.all(
                ctx.value.map((value) => resourceValidator.run(value, {
                    group: ctx.group,
                    flat: false,
                    path: ctx.path,
                })),
            );
        });
    }
}

export class RegistryHookValidator extends TypedContainer<RegistryHook> {
    protected initialize() {
        super.initialize();

        this.mount('type', createValidator(
            zod.string(),
        ));

        this.mount('operator', createValidator(
            zod.string().min(3).max(128),
        ));

        this.mount('event_data', new RegistryHookEventDataValidator());
    }
}

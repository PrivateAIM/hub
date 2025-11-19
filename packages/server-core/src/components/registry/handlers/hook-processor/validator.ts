/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

// eslint-disable-next-line max-classes-per-file
import zod from 'zod';
import { Container } from 'validup';
import { createValidator } from '@validup/adapter-zod';
import type {
    RegistryHook,
    RegistryHookEventData,
    RegistryHookRepository,
    RegistryHookResource,
} from './types';

class RegistryHookResourceValidator extends Container<RegistryHookResource> {
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

class RegistryHookRepositoryValidator extends Container<RegistryHookRepository> {
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

class RegistryHookEventDataValidator extends Container<RegistryHookEventData> {
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
                    path: ctx.pathAbsolute,
                })),
            );
        });
    }
}

export class RegistryHookValidator extends Container<RegistryHook> {
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

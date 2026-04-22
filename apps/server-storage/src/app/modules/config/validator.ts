/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { createValidator } from '@validup/adapter-zod';
import { Container } from 'validup';
import zod from 'zod';
import type { Config } from './types.ts';

export class ConfigValidator extends Container<Config> {
    protected initialize() {
        super.initialize();

        this.mount('env', { optional: true }, createValidator(
            zod.enum([EnvironmentName.TEST, EnvironmentName.DEVELOPMENT, EnvironmentName.PRODUCTION]),
        ));
        this.mount('port', { optional: true }, createValidator(zod.number().int().nonnegative()));

        this.mount('realm', { optional: true }, createValidator(zod.string().min(1)));
        this.mount('clientId', { optional: true }, createValidator(zod.string().min(1)));
        this.mount('clientSecret', { optional: true }, createValidator(zod.string().min(1)));

        this.mount('publicURL', { optional: true }, createValidator(zod.string()));

        this.mount('authupURL', { optional: true }, createValidator(zod.string()));
        this.mount('redisConnectionString', { optional: true }, createValidator(zod.string()));
        this.mount('rabbitMqConnectionString', { optional: true }, createValidator(zod.string()));

        this.mount('minioConnectionString', { optional: true }, createValidator(zod.string().min(1)));
    }
}

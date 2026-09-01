/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/server-kit';
import { createValidator } from '@validup/zod';
import { TypedContainer } from '@privateaim/kit';
import zod from 'zod';
import type { Config } from './types.ts';

export class ConfigValidator extends TypedContainer<Config> {
    protected initialize() {
        super.initialize();

        this.mount('env', { optional: true }, createValidator(
            zod.enum([EnvironmentName.TEST, EnvironmentName.DEVELOPMENT, EnvironmentName.PRODUCTION]),
        ));
        this.mount('port', { optional: true }, createValidator(zod.number().int().nonnegative().max(65535)));
        // Fail loud on a negative value: readInt passes it through, and a
        // negative retention would stamp an already-expired row on every write.
        this.mount('eventRetentionDays', { optional: true }, createValidator(zod.number().int().nonnegative()));

        this.mount('realm', { optional: true }, createValidator(zod.string().min(1)));
        this.mount('clientId', { optional: true }, createValidator(zod.string().min(1)));
        this.mount('clientSecret', { optional: true }, createValidator(zod.string().min(1)));

        this.mount('publicURL', { optional: true }, createValidator(zod.url()));

        this.mount('authupURL', { optional: true }, createValidator(zod.url()));
        this.mount('redisConnectionString', { optional: true }, createValidator(zod.string().min(1)));
        this.mount('rabbitMqConnectionString', { optional: true }, createValidator(zod.string().min(1)));

        this.mount('victoriaLogsURL', { optional: true }, createValidator(zod.url().nullable()));
        this.mount('victoriaLogsIngestorURL', { optional: true }, createValidator(zod.url().nullable()));
        this.mount('victoriaLogsQuerierURL', { optional: true }, createValidator(zod.url().nullable()));
    }
}

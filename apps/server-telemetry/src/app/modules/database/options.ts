/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { DataSourceOptionsBuilder as BaseBuilder } from '@privateaim/server-db-kit';
import { EventEntity } from '../../../adapters/database/entities/event.ts';

export class DataSourceOptionsBuilder extends BaseBuilder {
    constructor() {
        super();

        this.setEntities([
            EventEntity,
        ]);

        this.setMigrationDirectory('src/adapters/database/migrations');
    }
}

/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DataSourceOptionsBuilder as BaseBuilder } from '@privateaim/server-db-kit';
import {
    BucketEntity, BucketFileEntity, BucketFileSubscriber, BucketSubscriber,
} from './domains/index.ts';

export class DataSourceOptionsBuilder extends BaseBuilder {
    constructor() {
        super();

        this.setEntities([
            BucketEntity,
            BucketFileEntity,
        ]);

        this.setSubscribers([
            BucketSubscriber,
            BucketFileSubscriber,
        ]);
    }
}

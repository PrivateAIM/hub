/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import { EventEvent } from '@privateaim/server-telemetry-kit';
import { TelemetryEventCreatorFinishedHandler } from './handler';

export class TelemetryEventAggregator extends BaseComponent<EventComponentEventMap> {
    constructor() {
        super();

        this.mount(EventEvent.CREATION_FINISHED, new TelemetryEventCreatorFinishedHandler());
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}

/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator } from '@privateaim/server-kit';
import { buildDomainEventRedisChannel, useLogger, useRedisSubscribeClient } from '@privateaim/server-kit';
import type { Event } from '@privateaim/telemetry-kit';
import { DomainType as TelemetryDomainType } from '@privateaim/telemetry-kit';
import { useDataSource } from 'typeorm-extension';
import { DomainType } from '@privateaim/core-kit';
import { DomainEventNamespace } from '@privateaim/kit';
import { AnalysisNodeEventEntity } from '../../database';

export class TelemetryAggregator implements Aggregator {
    start() {
        const redisSub = useRedisSubscribeClient();

        redisSub.subscribe(
            buildDomainEventRedisChannel(
                TelemetryDomainType.EVENT,
                DomainEventNamespace,
            ),
        );

        redisSub.on('message', async (channel, message) => {
            useLogger().info(`Received event from channel ${channel}`);
            const event = JSON.parse(message);

            switch (event.type) {
                case TelemetryDomainType.EVENT: {
                    await this.handleEventEntity(event);
                    break;
                }
            }
        });
    }

    async handleEventEntity(input: Event) {
        const dataSource = await useDataSource();

        if (input.ref_type === DomainType.ANALYSIS_NODE) {
            const repository = dataSource.getRepository(AnalysisNodeEventEntity);

            // todo: maybe validate input.data

            const entity = repository.create({
                event_id: input.id,
                node_id: input.data.node_id,
                node_realm_id: input.data.node_realm_id,
                analysis_id: input.data.analysis_id,
                analysis_realm_id: input.data.analysis_realm_id,
            });

            await repository.insert(entity);
        }
    }
}

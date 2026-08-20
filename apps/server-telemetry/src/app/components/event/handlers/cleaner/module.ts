/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentHandler, Logger } from '@privateaim/server-kit';
import cron from 'node-cron';
import type { EventCommand, EventComponentEventMap } from '@privateaim/server-telemetry-kit';
import type { IEventRepository } from '../../../../../core/entities/index.ts';

export class EventComponentCleanerHandler implements ComponentHandler<
    EventComponentEventMap,
    EventCommand.CLEAN
> {
    protected repository: IEventRepository;

    protected logger: Logger | undefined;

    constructor(ctx: { repository: IEventRepository, logger?: Logger }) {
        this.repository = ctx.repository;
        this.logger = ctx.logger;
    }

    async initialize() : Promise<void> {
        await this.handle();

        cron.schedule('0 1 * * *', async () => {
            await this.handle();
        });
    }

    async handle(): Promise<void> {
        // ISO-8601, because expiresAt is a varchar compared lexicographically.
        const isoDate = new Date().toISOString();

        this.logger?.info(`Removing expired event entities before ${isoDate}`);

        // Batching, the id-only select and the delete-by-id all live behind the
        // port — the sweep can match millions of rows after a retention change.
        const removed = await this.repository.deleteExpired(isoDate);

        if (removed > 0) {
            this.logger?.info(`Removed ${removed} expired event entities`);
        }
    }
}

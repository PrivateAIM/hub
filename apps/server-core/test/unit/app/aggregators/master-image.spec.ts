/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage, MasterImageGroup  } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import {
    MasterImageBuilderEvent,
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import {
    EVENT_ERROR_MESSAGE_MAX_LENGTH,
} from '../../../../src/app/aggregators/worker/helpers.ts';
import { MasterImageBuilderAggregator } from '../../../../src/app/aggregators/worker/master-image-builder/index.ts';
import { MasterImageSynchronizerAggregator } from '../../../../src/app/aggregators/worker/master-image-synchronizer/index.ts';
import { MasterImageBuilderService } from '../../../../src/core/services/master-image/index.ts';
import { FakeMasterImageRepository } from '../../core/entities/master-image/fake-repository.ts';
import { FakeEventPublisher } from './fake-event-publisher.ts';

describe('master-image builder aggregator', () => {
    let imageRepository: FakeMasterImageRepository;
    let publisher: FakeEventPublisher;
    let aggregator: MasterImageBuilderAggregator;
    let image: MasterImage;

    beforeEach(() => {
        imageRepository = new FakeMasterImageRepository();
        publisher = new FakeEventPublisher();
        aggregator = new MasterImageBuilderAggregator({
            service: new MasterImageBuilderService({ imageRepository }),
            eventComponentDispatcher: publisher,
        });

        image = imageRepository.seed(imageRepository.create({
            name: 'base',
            path: 'python/base',
            virtualPath: 'python/base',
            groupVirtualPath: 'python',
            buildStatus: ProcessStatus.STARTED,
        }));
    });

    it('should not record a telemetry event per progress tick', async () => {
        await aggregator.handle(MasterImageBuilderEvent.EXECUTION_PROGRESS, {
            id: image.id,
            progress: {
                current: 1, 
                total: 2, 
                percent: 50, 
            },
        });

        expect(imageRepository.getAll()[0].buildProgress).toBe(50);
        expect(publisher.events).toHaveLength(0);
    });

    it('should record the failure reason as data.error', async () => {
        // the AMQP shape: hubwire serializes an Error to { name, message, code }
        await aggregator.handle(MasterImageBuilderEvent.EXECUTION_FAILED, {
            id: image.id,
            error: { name: 'Error', message: 'Step 4/7 exited with 1' } as Error,
        });

        expect(publisher.events).toHaveLength(1);
        expect(publisher.events[0]).toMatchObject({
            name: MasterImageBuilderEvent.EXECUTION_FAILED,
            refType: DomainType.MASTER_IMAGE,
            refId: image.id,
            scope: 'builder',
            data: { error: 'Step 4/7 exited with 1' },
        });
    });

    it('should cut an over-long failure reason', async () => {
        await aggregator.handle(MasterImageBuilderEvent.EXECUTION_FAILED, {
            id: image.id,
            error: new Error('x'.repeat(EVENT_ERROR_MESSAGE_MAX_LENGTH + 100)),
        });

        expect(publisher.events[0].data.error).toHaveLength(EVENT_ERROR_MESSAGE_MAX_LENGTH);
    });

    it('should record a finished build with empty data', async () => {
        await aggregator.handle(MasterImageBuilderEvent.EXECUTION_FINISHED, { id: image.id });

        expect(publisher.events).toHaveLength(1);
        expect(publisher.events[0]).toMatchObject({
            name: MasterImageBuilderEvent.EXECUTION_FINISHED,
            data: {},
        });
    });
});

describe('master-image synchronizer aggregator', () => {
    it('should record the sync failure reason as data.error', async () => {
        const publisher = new FakeEventPublisher();
        const aggregator = new MasterImageSynchronizerAggregator({
            imageRepository: new FakeMasterImageRepository(),
            groupRepository: new FakeEntityRepository<MasterImageGroup>(),
            eventComponentDispatcher: publisher,
        });

        await aggregator.handle(MasterImageSynchronizerEvent.EXECUTION_FAILED, { error: { name: 'ScanValidationError', message: 'r/geospatial: command is required' } as Error });

        expect(publisher.events).toHaveLength(1);
        expect(publisher.events[0]).toMatchObject({
            name: MasterImageSynchronizerEvent.EXECUTION_FAILED,
            refType: DomainType.MASTER_IMAGE,
            scope: 'synchronizer',
            data: { error: 'r/geospatial: command is required' },
        });
    });
});

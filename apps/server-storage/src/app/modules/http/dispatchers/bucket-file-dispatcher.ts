/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import {
    BucketFileCommand,
    BucketFileEvent,
    type BucketFileEventDispatcher,
} from '@privateaim/server-storage-kit';
import type { IBucketFileDispatcher } from '../../../../core/entities/index.ts';
import type { BucketFileComponent } from '../../../components/bucket-file/module.ts';

export class BucketFileDispatcherAdapter implements IBucketFileDispatcher {
    protected component: BucketFileComponent;

    protected eventDispatcher: BucketFileEventDispatcher | undefined;

    constructor(component: BucketFileComponent, eventDispatcher?: BucketFileEventDispatcher) {
        this.component = component;
        this.eventDispatcher = eventDispatcher;
    }

    async delete(id: string): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.component.handle(
                BucketFileCommand.DELETE,
                { id },
                // one correlationId for every event of this command
                { correlationId: randomUUID() },
                {
                    handle: async (childValue, childContext) => {
                        try {
                            await this.eventDispatcher?.dispatch(
                                childContext.key,
                                childValue,
                                childContext.metadata,
                            );
                        } catch (err) {
                            reject(err);
                            return;
                        }

                        if (childContext.key === BucketFileEvent.DELETION_FINISHED) {
                            resolve();
                            return;
                        }

                        if (childContext.key === BucketFileEvent.DELETION_FAILED) {
                            reject(childValue);
                        }
                    },
                },
            ).catch(reject);
        });
    }
}

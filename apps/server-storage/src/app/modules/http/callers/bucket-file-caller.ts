/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DirectComponentCaller } from '@privateaim/server-kit';
import {
    BucketFileCommand,
    type BucketFileDeletionFinishedEventPayload,
    BucketFileEvent,
    type BucketFileEventCaller,
} from '@privateaim/server-storage-kit';
import type { IBucketFileCaller } from '../../../../core/entities/index.ts';
import type { BucketFileComponent } from '../../../components/bucket-file/module.ts';

export class BucketFileCallerAdapter implements IBucketFileCaller {
    protected component: BucketFileComponent;

    protected eventCaller: BucketFileEventCaller;

    constructor(component: BucketFileComponent, eventCaller: BucketFileEventCaller) {
        this.component = component;
        this.eventCaller = eventCaller;
    }

    async delete(id: string): Promise<void> {
        const caller = new DirectComponentCaller(this.component);

        await new Promise((resolve, reject) => {
            caller.callWith(
                BucketFileCommand.DELETE,
                { id },
                {},
                {
                    handle: async (childValue, childContext) => {
                        await this.eventCaller.call(
                            childContext.key,
                            childValue,
                            childContext.metadata,
                        );

                        if (childContext.key === BucketFileEvent.DELETION_FINISHED) {
                            resolve(childValue as BucketFileDeletionFinishedEventPayload);
                        }

                        if (childContext.key === BucketFileEvent.DELETION_FAILED) {
                            reject(childValue);
                        }
                    },
                },
            );
        });
    }
}

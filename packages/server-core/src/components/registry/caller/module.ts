/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    CompoundComponentCaller,
    DirectComponentCaller,
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import type { RegistryEventMap } from '../type';
import { RegistryTaskQueueRouterRouting } from '../constants';
import { useRegistryComponent } from '../singleton';

export class RegistryComponentCaller extends CompoundComponentCaller<RegistryEventMap> {
    constructor() {
        super([
            new DirectComponentCaller<RegistryEventMap>(useRegistryComponent()),
            new QueueDispatchComponentCaller<RegistryEventMap>({
                queue: RegistryTaskQueueRouterRouting,
            }),
        ]);
    }
}

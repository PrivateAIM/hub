/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { MessageBus } from '@privateaim/server-kit';
import {
    CompoundComponentCaller,
    DirectComponentCaller,
    MessageBusDispatchComponentCaller,
} from '@privateaim/server-kit';
import type { RegistryEventMap } from '../type.ts';
import { RegistryTaskMessageBusRouting } from '../constants.ts';
import type { RegistryComponent } from '../module.ts';

export class RegistryComponentCaller extends CompoundComponentCaller<RegistryEventMap> {
    constructor(component: RegistryComponent, ctx?: { messageBus?: MessageBus }) {
        super([
            new DirectComponentCaller<RegistryEventMap>(component),
            new MessageBusDispatchComponentCaller<RegistryEventMap>({
                routing: RegistryTaskMessageBusRouting,
                messageBus: ctx?.messageBus,
            }),
        ]);
    }
}

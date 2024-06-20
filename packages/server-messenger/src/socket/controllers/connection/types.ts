/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { EventCallback, EventTarget, STCEventContext } from '../../types';
import type { CTSConnectionEventName, STCConnectionEventName } from './constants';

export type CTSConnectionEvents = {
    [K in `${CTSConnectionEventName.USER_CONNECTION_SUBSCRIBE}` |
        `${CTSConnectionEventName.USER_CONNECTION_UNSUBSCRIBE}` |
        `${CTSConnectionEventName.ROBOT_CONNECTION_SUBSCRIBE}` |
        `${CTSConnectionEventName.ROBOT_CONNECTION_UNSUBSCRIBE}`]: (
        target: EventTarget,
        cb?: EventCallback<undefined>
    ) => void
} & {
    [K in `${CTSConnectionEventName.USER_CONNECTIONS}` | `${CTSConnectionEventName.ROBOT_CONNECTIONS}`]: (
        target: EventTarget,
        cb?: EventCallback<number>
    ) => void
};

export type STCConnectionEvents = {
    [K in `${STCConnectionEventName}`]: (data: STCEventContext<{ id: string }>) => void
};

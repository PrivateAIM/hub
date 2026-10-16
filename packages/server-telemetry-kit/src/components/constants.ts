/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageRouting } from 'hubwire';
import { EventTaskMessageBusRouting } from './event/constants';
import { LogTaskMessageBusRouting } from './log/constants';

/**
 * Routings whose publishes a service must not log (MessageBusModule
 * silentRoutings): they carry the log lines and audit events themselves,
 * so logging their publish would feed the logger back into the bus.
 */
export const TELEMETRY_SILENT_MESSAGE_BUS_ROUTINGS: MessageRouting[] = [
    LogTaskMessageBusRouting,
    EventTaskMessageBusRouting,
];

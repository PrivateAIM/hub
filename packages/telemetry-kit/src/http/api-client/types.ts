/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientOptionsInput, IClient as IBaseClient } from 'hapic';
import type { IEventAPI, ILogAPI } from '../../domains';

/**
 * hapic's full construction surface, which — unlike `RequestBaseOptions` —
 * carries `transport`. That is what lets a test inject a `MemoryTransport`
 * (see `@privateaim/telemetry-kit/testing`) without touching the client.
 */
export type ClientOptions = ClientOptionsInput;

/**
 * Replaceable contract of the hub telemetry HTTP client. Implemented by
 * `APIClient`. Members are typed as INTERFACES rather than the concrete API
 * classes, so the type stays purely structural.
 */
export interface ITelemetryClient extends IBaseClient {
    readonly event : IEventAPI;
    readonly log : ILogAPI;
}

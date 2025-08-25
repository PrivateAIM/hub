/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BuilderCommand, BuilderEvent } from './constants';

export type BuilderBasePayload = {
    id: string,
    error?: Error
};

export type BuilderBuildPayload = BuilderBasePayload;
export type BuilderPushPayload = BuilderBasePayload;
export type BuilderCheckPayload = BuilderBasePayload;

export type BuilderBuildCommandContext = {
    command: `${BuilderCommand.BUILD}`,
    data: BuilderBuildPayload,
};

export type BuilderPushCommandContext = {
    command: `${BuilderCommand.PUSH}`,
    data: BuilderPushPayload
};

export type BuilderCheckCommandContext = {
    command: `${BuilderCommand.CHECK}`,
    data: BuilderCheckPayload
};

export type BuilderBuildEventContext = {
    data: BuilderBuildPayload;
    event: `${BuilderEvent.BUILD_FAILED}` |
        `${BuilderEvent.BUILT}` |
        `${BuilderEvent.BUILDING}`;
};

export type BuilderPushEventContext = {
    data: BuilderPushPayload,
    event: `${BuilderEvent.PUSH_FAILED}` |
        `${BuilderEvent.PUSHED}` |
        `${BuilderEvent.PUSHING}`;
};

export type BuilderCheckEventContext = {
    data: BuilderCheckPayload,
    event: `${BuilderEvent.CHECK_FAILED}` |
        `${BuilderEvent.CHECKED}` |
        `${BuilderEvent.CHECKING}` |
        `${BuilderEvent.NONE}`;
};

export type BuilderCommandContext = BuilderCheckCommandContext | BuilderBuildCommandContext | BuilderPushCommandContext;
export type BuilderEventContext = BuilderCheckEventContext | BuilderBuildEventContext | BuilderPushEventContext;

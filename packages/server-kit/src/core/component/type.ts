/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../type';
import type { QueueRouterPayloadMetadataInput } from '../queue-router';

export type ComponentData = ObjectLiteral;
export type ComponentMetadata = QueueRouterPayloadMetadataInput;

export type ComponentStartFn = () => Promise<void> | void;

export type ComponentTriggerFn = (
    key: string,
    value?: ObjectLiteral,
    metadata?: ObjectLiteral
) => Promise<void> | void;

export interface ComponentWithTrigger {
    trigger: ComponentTriggerFn
}

export type Component = {
    start: ComponentStartFn,
    trigger?: ComponentTriggerFn,
};

export type ComponentErrorOptions = {
    code?: string | null,
    message?: string
    cause?: unknown
};
export type ComponentEvents = {
    [key: string]: [ComponentData, ComponentMetadata]
};

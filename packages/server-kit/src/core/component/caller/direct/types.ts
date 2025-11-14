/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { ComponentEventMap } from '../../type';

export type ComponentDirectCallerResponse<
    EventMap extends ComponentEventMap = ComponentEventMap,
> = {
    [K in keyof EventMap]?: EventMap[K][0]
};

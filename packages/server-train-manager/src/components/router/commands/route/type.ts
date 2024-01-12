/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    RegistryProject,
    Node,
    AnalysisNode,
} from '@personalhealthtrain/core';
import type { RouterRoutePayload } from '../../type';

export type StationExtended = Node & Pick<AnalysisNode, 'index' | 'run_status'>;

export type RouteContext = {
    payload: RouterRoutePayload,
    project: RegistryProject,
};

export type RouteContextExtended = RouteContext & {
    items: StationExtended[],
};

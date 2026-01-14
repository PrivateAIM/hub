/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DController, DGet, DRequest, DResponse, DTags,
} from '@routup/decorators';
import type { EndpointInfo } from './status/index.ts';
import { useStatusRouteHandler } from './status/index.ts';

@DTags('root')
@DController('')
export class RootController {
    @DGet('/', [])
    async status(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<EndpointInfo> {
        return useStatusRouteHandler(req, res);
    }
}

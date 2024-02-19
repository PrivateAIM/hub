import {
    DController, DGet, DRequest, DResponse, DTags,
} from '@routup/decorators';
import type { EndpointInfo } from './status';
import { useStatusRouteHandler } from './status';

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

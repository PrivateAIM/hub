/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { decorators } from '@routup/decorators';
import {
    useRequestBody,
} from '@routup/basic/body';
import {
    useRequestCookie,
    useRequestCookies,
} from '@routup/basic/cookie';
import {
    useRequestQuery,
} from '@routup/basic/query';
import type { Router } from 'routup';
import { AnalysisFileController } from './controllers/core/analysis-file';
import { AnalysisLogController } from './controllers/core/analysis-log';
import { MasterImageController } from './controllers/core/master-image';
import { ProposalController } from './controllers/core/project';
import { ProposalStationController } from './controllers/core/project-node';
import { NodeController } from './controllers/core/node';
import { AnalysisController } from './controllers/core/analysis';
import { AnalysisNodeController } from './controllers/core/analysis-node';
import { RootController } from './controllers/core/root';
import { ServiceController } from './controllers/special/service';
import { MasterImageGroupController } from './controllers/core/master-image-group';
import { RegistryController } from './controllers/core/registry';
import { RegistryProjectController } from './controllers/core/registry-project';

export function registerControllers(router: Router) {
    router.use(decorators({
        controllers: [
            // Core
            MasterImageController,
            MasterImageGroupController,
            ProposalController,
            ProposalStationController,
            RegistryController,
            RegistryProjectController,
            NodeController,
            AnalysisController,
            AnalysisFileController,
            AnalysisLogController,
            AnalysisNodeController,

            RootController,

            // Extra
            ServiceController,
        ],
        parameter: {
            body: (context, name) => {
                if (name) {
                    return useRequestBody(context.request, name);
                }

                return useRequestBody(context.request);
            },
            cookie: (context, name) => {
                if (name) {
                    return useRequestCookie(context.request, name);
                }

                return useRequestCookies(context.request);
            },
            query: (context, name) => {
                if (name) {
                    return useRequestQuery(context.request, name);
                }

                return useRequestQuery(context.request);
            },
        },
    }));

    return router;
}

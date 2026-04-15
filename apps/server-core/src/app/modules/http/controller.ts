/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import {
    MasterImageBuilderComponentCaller,
    MasterImageSynchronizerComponentCaller,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBucketFileService,
    AnalysisBucketService,
    AnalysisNodeEventService,
    AnalysisNodeService,
    AnalysisPermissionService,
    AnalysisService,
    MasterImageGroupService,
    MasterImageService,
    NodeService,
    ProjectNodeService,
    ProjectService,
    RegistryProjectService,
    RegistryService,
} from '../../../core/index.ts';
import { NodeController } from '../../../adapters/http/controllers/entities/node/module.ts';
import { RegistryController } from '../../../adapters/http/controllers/entities/registry/module.ts';
import { MasterImageController } from '../../../adapters/http/controllers/entities/master-image/module.ts';
import { MasterImageGroupController } from '../../../adapters/http/controllers/entities/master-image-group/module.ts';
import { ProjectController } from '../../../adapters/http/controllers/entities/project/module.ts';
import { RegistryProjectController } from '../../../adapters/http/controllers/entities/registry-project/module.ts';
import { AnalysisController } from '../../../adapters/http/controllers/entities/analysis/module.ts';
import { AnalysisBucketController } from '../../../adapters/http/controllers/entities/analysis-bucket/module.ts';
import { AnalysisBucketFileController } from '../../../adapters/http/controllers/entities/analysis-bucket-file/module.ts';
import { ProjectNodeController } from '../../../adapters/http/controllers/entities/project-node/module.ts';
import { AnalysisNodeController } from '../../../adapters/http/controllers/entities/analysis-node/module.ts';
import { AnalysisPermissionController } from '../../../adapters/http/controllers/entities/analysis-permission/module.ts';
import { AnalysisNodeEventController } from '../../../adapters/http/controllers/entities/analysis-node-event/module.ts';
import { ServiceController } from '../../../adapters/http/controllers/workflows/service/index.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';
import { ConfigInjectionKey } from '../config/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    // Resolve repositories from container
    const nodeRepository = container.resolve(DatabaseInjectionKey.NodeRepository);
    const registryRepository = container.resolve(DatabaseInjectionKey.RegistryRepository);
    const masterImageRepository = container.resolve(DatabaseInjectionKey.MasterImageRepository);
    const masterImageGroupRepository = container.resolve(DatabaseInjectionKey.MasterImageGroupRepository);
    const projectRepository = container.resolve(DatabaseInjectionKey.ProjectRepository);
    const registryProjectRepository = container.resolve(DatabaseInjectionKey.RegistryProjectRepository);
    const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
    const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
    const analysisBucketFileRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository);
    const projectNodeRepository = container.resolve(DatabaseInjectionKey.ProjectNodeRepository);
    const analysisNodeRepository = container.resolve(DatabaseInjectionKey.AnalysisNodeRepository);
    const analysisPermissionRepository = container.resolve(DatabaseInjectionKey.AnalysisPermissionRepository);
    const analysisNodeEventRepository = container.resolve(DatabaseInjectionKey.AnalysisNodeEventRepository);
    const registryManager = container.resolve(DatabaseInjectionKey.RegistryManager);

    // Create services
    const nodeService = new NodeService({ repository: nodeRepository, registryManager });
    const callerResult = container.tryResolve(ComponentsInjectionKey.RegistryComponentCaller);
    const registryService = new RegistryService({
        repository: registryRepository,
        registryProjectRepository,
        registryCaller: callerResult.success ? callerResult.data : undefined,
    });
    const config = container.resolve(ConfigInjectionKey);
    const masterImageService = new MasterImageService({
        repository: masterImageRepository,
        synchronizerCaller: new MasterImageSynchronizerComponentCaller(),
        builderCaller: new MasterImageBuilderComponentCaller(),
        masterImagesConfig: {
            owner: config.masterImagesOwner,
            repository: config.masterImagesRepository,
            branch: config.masterImagesBranch,
        },
    });
    const masterImageGroupService = new MasterImageGroupService({ repository: masterImageGroupRepository });
    const projectService = new ProjectService({ repository: projectRepository });
    const registryProjectService = new RegistryProjectService({ repository: registryProjectRepository, registryManager });
    const analysisService = new AnalysisService({
        repository: analysisRepository,
        projectRepository,
        builder: container.resolve(AnalysisInjectionKey.Builder),
        configurator: container.resolve(AnalysisInjectionKey.Configurator),
        distributor: container.resolve(AnalysisInjectionKey.Distributor),
        storageManager: container.resolve(AnalysisInjectionKey.StorageManager),
        skipAnalysisApproval: container.resolve(ConfigInjectionKey).skipAnalysisApproval,
    });
    const analysisBucketService = new AnalysisBucketService({ repository: analysisBucketRepository });
    const analysisBucketFileService = new AnalysisBucketFileService({ repository: analysisBucketFileRepository });
    const projectNodeService = new ProjectNodeService({ repository: projectNodeRepository, projectRepository });
    const analysisNodeService = new AnalysisNodeService({ repository: analysisNodeRepository, projectNodeRepository });
    const analysisPermissionService = new AnalysisPermissionService({ repository: analysisPermissionRepository });
    const analysisNodeEventService = new AnalysisNodeEventService({ repository: analysisNodeEventRepository });

    // Create controller instances
    const controllers: Record<string, any>[] = [
        new NodeController({ service: nodeService }),
        new RegistryController({ service: registryService }),
        new MasterImageController({ service: masterImageService }),
        new MasterImageGroupController({ service: masterImageGroupService }),
        new ProjectController({ service: projectService }),
        new RegistryProjectController({ service: registryProjectService }),
        new AnalysisController({ service: analysisService }),
        new AnalysisBucketController({ service: analysisBucketService }),
        new AnalysisBucketFileController({ service: analysisBucketFileService }),
        new ProjectNodeController({ service: projectNodeService }),
        new AnalysisNodeController({ service: analysisNodeService }),
        new AnalysisPermissionController({ service: analysisPermissionService }),
        new AnalysisNodeEventController({ service: analysisNodeEventService }),
    ];

    if (callerResult.success) {
        controllers.push(new ServiceController({
            registryService,
            registryCaller: callerResult.data,
        }));
    }

    return controllers;
}

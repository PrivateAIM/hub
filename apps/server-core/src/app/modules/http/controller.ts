/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
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
import { DatabaseInjectionKey } from '../database/constants.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
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
    const registryService = new RegistryService({ repository: registryRepository });
    const masterImageService = new MasterImageService({ repository: masterImageRepository });
    const masterImageGroupService = new MasterImageGroupService({ repository: masterImageGroupRepository });
    const projectService = new ProjectService({ repository: projectRepository });
    const registryProjectService = new RegistryProjectService({ repository: registryProjectRepository, registryManager });
    const analysisService = new AnalysisService({ repository: analysisRepository, projectRepository });
    const analysisBucketService = new AnalysisBucketService({ repository: analysisBucketRepository });
    const analysisBucketFileService = new AnalysisBucketFileService({ repository: analysisBucketFileRepository });
    const projectNodeService = new ProjectNodeService({ repository: projectNodeRepository, projectRepository });
    const analysisNodeService = new AnalysisNodeService({ repository: analysisNodeRepository, projectNodeRepository });
    const analysisPermissionService = new AnalysisPermissionService({ repository: analysisPermissionRepository });
    const analysisNodeEventService = new AnalysisNodeEventService({ repository: analysisNodeEventRepository });

    // Create controller instances
    return [
        new NodeController({ service: nodeService }),
        new RegistryController({ service: registryService }),
        new MasterImageController({ service: masterImageService }),
        new MasterImageGroupController({ service: masterImageGroupService }),
        new ProjectController({ service: projectService }),
        new RegistryProjectController({ service: registryProjectService }),
        new AnalysisController({
            service: analysisService,
            builder: container.resolve(AnalysisInjectionKey.Builder),
            configurator: container.resolve(AnalysisInjectionKey.Configurator),
            distributor: container.resolve(AnalysisInjectionKey.Distributor),
            storageManager: container.resolve(AnalysisInjectionKey.StorageManager),
            skipAnalysisApproval: container.resolve(ConfigInjectionKey).skipAnalysisApproval,
        }),
        new AnalysisBucketController({ service: analysisBucketService }),
        new AnalysisBucketFileController({ service: analysisBucketFileService }),
        new ProjectNodeController({ service: projectNodeService }),
        new AnalysisNodeController({ service: analysisNodeService }),
        new AnalysisPermissionController({ service: analysisPermissionService }),
        new AnalysisNodeEventController({ service: analysisNodeEventService }),
    ];
}

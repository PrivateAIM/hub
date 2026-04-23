/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { AnalysisBuilder } from '../../../core/services/analysis-builder/index.ts';
import type { AnalysisConfigurator } from '../../../core/services/analysis-configurator/index.ts';
import type { AnalysisDistributor } from '../../../core/services/analysis-distributor/index.ts';
import type { AnalysisStorageManager } from '../../../core/services/analysis-storage-manager/index.ts';
import type { IAnalysisMetadataRecalculator } from '../../../core/entities/analysis/types.ts';
import type { IAnalysisNodeMetadataRecalculator } from '../../../core/entities/analysis-node/types.ts';
import type { IAnalysisFileMetadataRecalculator } from '../../../core/entities/analysis-bucket-file/types.ts';

export const AnalysisInjectionKey = {
    Builder: new TypedToken<AnalysisBuilder>('AnalysisBuilder'),
    Configurator: new TypedToken<AnalysisConfigurator>('AnalysisConfigurator'),
    Distributor: new TypedToken<AnalysisDistributor>('AnalysisDistributor'),
    StorageManager: new TypedToken<AnalysisStorageManager>('AnalysisStorageManager'),
    AnalysisRecalculator: new TypedToken<IAnalysisMetadataRecalculator>('AnalysisMetadataRecalculator'),
    NodeRecalculator: new TypedToken<IAnalysisNodeMetadataRecalculator>('AnalysisNodeMetadataRecalculator'),
    FileRecalculator: new TypedToken<IAnalysisFileMetadataRecalculator>('AnalysisFileMetadataRecalculator'),
} as const;

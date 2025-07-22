/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client as BaseClient, HookName, isClientError } from 'hapic';
import {
    AnalysisAPI,
    AnalysisBucketAPI,
    AnalysisBucketFileAPI, AnalysisLogAPI,
    AnalysisNodeAPI,
    AnalysisNodeEventAPI,
    AnalysisNodeLogAPI,
    AnalysisPermissionAPI,
    MasterImageAPI,
    MasterImageEventAPI,
    MasterImageGroupAPI,
    NodeAPI,
    ProjectAPI,
    ProjectNodeAPI,
    RegistryAPI,
    RegistryProjectAPI,
    ServiceAPI,
} from '../domains';

export class Client extends BaseClient {
    public readonly masterImage : MasterImageAPI;

    public readonly masterImageGroup : MasterImageGroupAPI;

    public readonly masterImageEvent : MasterImageEventAPI;

    public readonly project : ProjectAPI;

    public readonly projectNode: ProjectNodeAPI;

    public readonly registry : RegistryAPI;

    public readonly registryProject : RegistryProjectAPI;

    public readonly node : NodeAPI;

    public readonly analysis : AnalysisAPI;

    public readonly analysisBucket : AnalysisBucketAPI;

    public readonly analysisBucketFile : AnalysisBucketFileAPI;

    public readonly analysisLog: AnalysisLogAPI;

    public readonly analysisNode : AnalysisNodeAPI;

    public readonly analysisNodeEvent: AnalysisNodeEventAPI;

    public readonly analysisNodeLog: AnalysisNodeLogAPI;

    public readonly analysisPermission : AnalysisPermissionAPI;

    public readonly service : ServiceAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.masterImage = new MasterImageAPI({ client: this });
        this.masterImageGroup = new MasterImageGroupAPI({ client: this });
        this.masterImageEvent = new MasterImageEventAPI({ client: this });
        this.project = new ProjectAPI({ client: this });
        this.projectNode = new ProjectNodeAPI({ client: this });
        this.registry = new RegistryAPI({ client: this });
        this.registryProject = new RegistryProjectAPI({ client: this });
        this.node = new NodeAPI({ client: this });
        this.analysis = new AnalysisAPI({ client: this });
        this.analysisBucket = new AnalysisBucketAPI({ client: this });
        this.analysisBucketFile = new AnalysisBucketFileAPI({ client: this });
        this.analysisLog = new AnalysisLogAPI({ client: this });
        this.analysisNode = new AnalysisNodeAPI({ client: this });
        this.analysisNodeEvent = new AnalysisNodeEventAPI({ client: this });
        this.analysisNodeLog = new AnalysisNodeLogAPI({ client: this });
        this.analysisPermission = new AnalysisPermissionAPI({ client: this });
        this.service = new ServiceAPI({ client: this });

        this.on(HookName.RESPONSE_ERROR, ((error) => {
            if (
                isClientError(error) &&
                error.response &&
                error.response.data &&
                typeof error.response.data.message === 'string'
            ) {
                error.message = error.response.data.message;
            }

            throw error;
        }));
    }
}

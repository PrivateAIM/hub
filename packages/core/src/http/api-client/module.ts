/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client, HookName, isClientError } from 'hapic';
import {
    AnalysisAPI,
    AnalysisFileAPI,
    AnalysisLogAPI,
    MasterImageAPI,
    MasterImageGroupAPI,
    NodeAPI,
    ProjectAPI,
    ProjectNodeAPI,
    RegistryAPI,
    RegistryProjectAPI,
    ServiceAPI,
    TrainStationAPI,
} from '../../domains';

export class APIClient extends Client {
    public readonly masterImage : MasterImageAPI;

    public readonly masterImageGroup : MasterImageGroupAPI;

    public readonly project : ProjectAPI;

    public readonly projectNode: ProjectNodeAPI;

    public readonly registry : RegistryAPI;

    public readonly registryProject : RegistryProjectAPI;

    public readonly node : NodeAPI;

    public readonly analysis : AnalysisAPI;

    // todo: this is going to be moved to storage service package.
    public readonly analysisFile : AnalysisFileAPI;

    public readonly analysisLog: AnalysisLogAPI;

    public readonly analysisNode : TrainStationAPI;

    public readonly service : ServiceAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.masterImage = new MasterImageAPI({ client: this });
        this.masterImageGroup = new MasterImageGroupAPI({ client: this });
        this.project = new ProjectAPI({ client: this });
        this.projectNode = new ProjectNodeAPI({ client: this });
        this.registry = new RegistryAPI({ client: this });
        this.registryProject = new RegistryProjectAPI({ client: this });
        this.node = new NodeAPI({ client: this });
        this.analysis = new AnalysisAPI({ client: this });
        this.analysisFile = new AnalysisFileAPI({ client: this });
        this.analysisLog = new AnalysisLogAPI({ client: this });
        this.analysisNode = new TrainStationAPI({ client: this });
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

/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RequestBaseOptions } from 'hapic';
import { Client, HookName, isClientError } from 'hapic';
import {
    MasterImageAPI,
    MasterImageGroupAPI,
    ProjectAPI,
    ProjectNodeAPI,
    RegistryAPI,
    RegistryProjectAPI,
    ServiceAPI,
    NodeAPI,
    AnalysisAPI,
    AnalysisFileAPI,
    AnalysisLogAPI,
    TrainStationAPI,
} from '../../domains';

export class APIClient extends Client {
    public readonly masterImage : MasterImageAPI;

    public readonly masterImageGroup : MasterImageGroupAPI;

    public readonly project : ProjectAPI;

    public readonly projectNode: ProjectNodeAPI;

    public readonly registry : RegistryAPI;

    public readonly registryProject : RegistryProjectAPI;

    public readonly station : NodeAPI;

    public readonly train : AnalysisAPI;

    public readonly trainFile : AnalysisFileAPI;

    public readonly trainLog: AnalysisLogAPI;

    public readonly trainStation : TrainStationAPI;

    public readonly service : ServiceAPI;

    constructor(config: RequestBaseOptions) {
        super(config);

        this.masterImage = new MasterImageAPI({ client: this });
        this.masterImageGroup = new MasterImageGroupAPI({ client: this });
        this.project = new ProjectAPI({ client: this });
        this.projectNode = new ProjectNodeAPI({ client: this });
        this.registry = new RegistryAPI({ client: this });
        this.registryProject = new RegistryProjectAPI({ client: this });
        this.station = new NodeAPI({ client: this });
        this.train = new AnalysisAPI({ client: this });
        this.trainFile = new AnalysisFileAPI({ client: this });
        this.trainLog = new AnalysisLogAPI({ client: this });
        this.trainStation = new TrainStationAPI({ client: this });
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

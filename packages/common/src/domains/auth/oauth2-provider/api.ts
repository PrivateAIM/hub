/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {formatRequestRecord, RequestRecord} from "@trapi/data-fetching";
import {
    CollectionResourceResponse,
    SingleResourceResponse,
    useAPI, APIType
} from "../../../modules";
import {OAuth2Provider} from "./entity";

export function getProviderAuthorizeUri(id) : string {
    const baseUrl: string = useAPI(APIType.DEFAULT).config.baseURL ?? '';

    return baseUrl + 'providers/' + id + '/authorize-url';
}

export async function getAPIProviders(record?: RequestRecord<OAuth2Provider>) : Promise<CollectionResourceResponse<OAuth2Provider>> {
    let response = await useAPI(APIType.DEFAULT).get('providers' + formatRequestRecord(record));

    return response.data;
}

export async function getAPIProvider(id: number) : Promise<SingleResourceResponse<OAuth2Provider>>  {
    let response = await useAPI(APIType.DEFAULT).get('providers/' + id);

    return response.data;
}

export async function dropAPIProvider(id: number) : Promise<SingleResourceResponse<OAuth2Provider>>{
    let response = await useAPI(APIType.DEFAULT).delete('providers/' + id);

    return response.data;
}

export async function addAPIProvider(data: { [key: string]: any }): Promise<SingleResourceResponse<OAuth2Provider>> {
    let response = await useAPI('auth').post('providers', data);

    return response.data;
}

export async function editAPIProvider(userId: number, data: { [key: string]: any }): Promise<SingleResourceResponse<OAuth2Provider>> {
    let response = await useAPI('auth').post('providers/' + userId, data);

    return response.data;
}

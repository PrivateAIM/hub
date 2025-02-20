/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { scanDirectory } from 'docken';
import type { MasterImageGroupSyncData, MasterImageSyncData } from '@privateaim/server-analysis-manager-kit';
import { DockenGroupAttributesValidator, DockenImageAttributesValidator } from './validators';
import { MASTER_IMAGES_DATA_DIRECTORY_PATH } from '../../../../constants';

const groupValidator = new DockenGroupAttributesValidator();
const imageValidator = new DockenImageAttributesValidator();

export async function scanMasterImagesDirectory() : Promise<{
    images: MasterImageSyncData[],
    groups: MasterImageGroupSyncData[]
}> {
    const result = await scanDirectory(MASTER_IMAGES_DATA_DIRECTORY_PATH);

    const output : {
        images: MasterImageSyncData[],
        groups: MasterImageGroupSyncData[]
    } = {
        images: [],
        groups: [],
    };

    for (let i = 0; i < result.images.length; i++) {
        const attributes = await imageValidator.run(result.images[i].attributes);

        output.images.push({
            path: result.images[i].path,
            virtualPath: result.images[i].virtualPath,
            name: result.images[i].path.split('/').pop() || result.images[i].path,
            command: attributes.command,
            commandArguments: attributes.commandArguments || [],
        });
    }

    for (let i = 0; i < result.groups.length; i++) {
        const attributes = await groupValidator.run(result.groups[i].attributes);

        let name : string;
        if (attributes.name) {
            name = attributes.name;
        } else {
            const parts = result.groups[i].path.split('/');
            name = parts.slice(0, -1).join('/');
        }

        output.groups.push({
            path: result.groups[i].path,
            virtualPath: result.groups[i].virtualPath,
            name: name || result.groups[i].path,
        });
    }

    return output;
}

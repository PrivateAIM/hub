/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketFile } from '@privateaim/storage-kit';
import path from 'node:path';
import type {
    Analysis,
    MasterImage,
} from '@privateaim/core';
import { AnalysisContainerPath, getHostNameFromString } from '@privateaim/core';
import { useCoreClient, useStorageClient } from '../../../core';
import { BuilderError } from '../error';

type DockerFileBuildContext = {
    entity: Pick<Analysis, 'id' | 'master_image_id' | 'entrypoint_file_id'>,
    hostname: string
};

export async function buildTrainDockerFile(context: DockerFileBuildContext) : Promise<{
    content: string,
    masterImagePath: string
}> {
    const storageClient = useStorageClient();
    const coreClient = useCoreClient();

    let entryPoint : BucketFile;

    try {
        entryPoint = await storageClient.bucketFile.getOne(context.entity.entrypoint_file_id);
    } catch (e) {
        throw BuilderError.entrypointNotFound();
    }

    let masterImage : MasterImage;

    try {
        masterImage = await coreClient.masterImage.getOne(context.entity.master_image_id);
    } catch (e) {
        throw BuilderError.masterImageNotFound();
    }

    const entrypointPath = path.posix.join(
        entryPoint.directory,
        entryPoint.name,
    );

    let entrypointCommand = masterImage.command;
    let entrypointCommandArguments = masterImage.command_arguments;

    const { data: masterImageGroups } = await coreClient.masterImageGroup.getMany({
        filter: {
            virtual_path: masterImage.group_virtual_path,
        },
    });

    if (masterImageGroups.length > 0) {
        const masterImageGroup = masterImageGroups.shift();
        if (masterImageGroup) {
            entrypointCommand = entrypointCommand || masterImageGroup.command;
            entrypointCommandArguments = entrypointCommandArguments || masterImageGroup.command_arguments;
        }
    }

    let argumentsString = '';

    if (entrypointCommandArguments) {
        let parts = Array.isArray(entrypointCommandArguments) ?
            entrypointCommandArguments :
            [entrypointCommandArguments];

        parts = parts.map((part) => `"${part}"`);
        argumentsString = `${parts.join(', ')} `;
    }

    const masterImagePath = `${getHostNameFromString(context.hostname)}/master/${masterImage.virtual_path}`;
    const content = `
    FROM ${masterImagePath}
    RUN mkdir ${AnalysisContainerPath.MAIN} &&\
        chmod -R +x ${AnalysisContainerPath.MAIN}

    CMD ["${entrypointCommand}", ${argumentsString}"${path.posix.join(AnalysisContainerPath.MAIN, entrypointPath)}"]
    `;

    return {
        content,
        masterImagePath,
    };
}

/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getHostNameFromString } from '@privateaim/kit';
import { AnalysisBucketType, AnalysisContainerPath } from '@privateaim/core-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import path from 'node:path';
import type {
    Analysis,
    MasterImage,
} from '@privateaim/core-kit';
import { useCoreClient, useStorageClient } from '../../../core';
import { BuilderError } from '../error';

type DockerFileBuildContext = {
    entity: Pick<Analysis, 'id' | 'master_image_id'>,
    hostname: string
};

export async function bundleDockerFile(context: DockerFileBuildContext) : Promise<{
    content: string,
    masterImagePath: string
}> {
    const storageClient = useStorageClient();
    const coreClient = useCoreClient();

    const { data: analysisBuckets } = await coreClient.analysisBucket.getMany({
        filter: {
            analysis_id: context.entity.id,
            type: AnalysisBucketType.CODE,
        },
    });
    const [analysisBucket] = analysisBuckets;
    if (typeof analysisBucket === 'undefined') {
        throw BuilderError.entrypointNotFound();
    }

    const { data: analysisBucketFiles } = await coreClient.analysisBucketFile.getMany({
        filter: {
            root: true,
            bucket_id: analysisBucket.id,
        },
    });

    const [analysisBucketFile] = analysisBucketFiles;
    if (typeof analysisBucketFile === 'undefined') {
        throw BuilderError.entrypointNotFound();
    }

    let entryPoint : BucketFile;
    try {
        entryPoint = await storageClient.bucketFile.getOne(analysisBucketFile.external_id);
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

    let { command } = masterImage;
    let commandArguments : string[] = [];

    if (
        masterImage.command_arguments &&
        Array.isArray(masterImage.command_arguments)
    ) {
        commandArguments = masterImage.command_arguments;
    }

    const { data: masterImageGroups } = await coreClient.masterImageGroup.getMany({
        filter: {
            virtual_path: masterImage.group_virtual_path,
        },
    });

    if (masterImageGroups.length > 0) {
        const masterImageGroup = masterImageGroups[0];

        if (
            !command &&
            masterImageGroup.command
        ) {
            command = masterImageGroup.command;
        }

        if (
            commandArguments.length === 0 &&
            masterImageGroup.command_arguments &&
            Array.isArray(masterImageGroup.command_arguments)
        ) {
            commandArguments = masterImageGroup.command_arguments;
        }
    }

    const cmdParts : string[] = [];
    cmdParts.push(`"${command}"`);
    for (let i = 0; i < commandArguments.length; i++) {
        cmdParts.push(`"${commandArguments[i]}"`);
    }
    cmdParts.push(`"${path.posix.join(AnalysisContainerPath.CODE, entrypointPath)}"`);

    const masterImagePath = `${getHostNameFromString(context.hostname)}/master/${masterImage.virtual_path}`;
    const content = `
    FROM ${masterImagePath}
    RUN mkdir -p ${AnalysisContainerPath.CODE}
    RUN chmod -R +x ${AnalysisContainerPath.CODE}

    CMD [${cmdParts.join(', ')}]
    `;

    return {
        content,
        masterImagePath,
    };
}

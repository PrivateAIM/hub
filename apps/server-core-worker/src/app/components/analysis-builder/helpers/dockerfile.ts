/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis,
    MasterImage,
    MasterImageCommandArgument,
} from '@privateaim/core-kit';
import {
    AnalysisBucketType,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
} from '@privateaim/core-kit';
import type { BucketFile, APIClient as StorageClient  } from '@privateaim/storage-kit';
import type { Client as CoreClient } from '@privateaim/core-http-kit';
import path from 'node:path';
import { AnalysisContainerPath } from '../constants';
import { BuilderError } from '../error';

export async function generateDockerFileContent(
    entity: Analysis,
    ctx: { coreClient: CoreClient; storageClient: StorageClient },
) : Promise<string> {
    const { data: analysisBuckets } = await ctx.coreClient.analysisBucket.getMany({
        filter: {
            analysis_id: entity.id,
            type: AnalysisBucketType.CODE,
        },
    });
    const [analysisBucket] = analysisBuckets;
    if (typeof analysisBucket === 'undefined') {
        throw BuilderError.entrypointNotFound();
    }

    const { data: analysisBucketFiles } = await ctx.coreClient.analysisBucketFile.getMany({
        filter: {
            root: true,
            analysis_bucket_id: analysisBucket.id,
        },
    });

    const [analysisBucketFile] = analysisBucketFiles;
    if (typeof analysisBucketFile === 'undefined') {
        throw BuilderError.entrypointNotFound();
    }

    let entryPoint : BucketFile;
    try {
        entryPoint = await ctx.storageClient.bucketFile.getOne(analysisBucketFile.bucket_file_id);
    } catch {
        throw BuilderError.entrypointNotFound();
    }

    let masterImage : MasterImage;

    try {
        masterImage = await ctx.coreClient.masterImage.getOne(entity.master_image_id);
    } catch {
        throw BuilderError.masterImageNotFound();
    }

    const entrypointPath = path.posix.join(
        entryPoint.directory,
        entryPoint.name,
    );

    let commandArguments : MasterImageCommandArgument[];
    if (entity.image_command_arguments) {
        commandArguments = entity.image_command_arguments;
    } else if (masterImage.command_arguments) {
        commandArguments = masterImage.command_arguments;
    } else {
        commandArguments = [];
    }

    const cmdParts : string[] = [];

    // todo: maybe rename to binary
    cmdParts.push(`"${masterImage.command}"`);

    if (commandArguments) {
        for (const commandArgument of commandArguments) {
            if (
                commandArgument.position === 'before' ||
                !commandArgument.position
            ) {
                cmdParts.push(`"${commandArgument.value}"`);
            }
        }
    }

    cmdParts.push(`"${path.posix.join(AnalysisContainerPath.CODE, entrypointPath)}"`);

    if (commandArguments) {
        for (const commandArgument of commandArguments) {
            if (
                commandArgument.position === 'after'
            ) {
                cmdParts.push(`"${commandArgument.value}"`);
            }
        }
    }

    return `
    FROM ${REGISTRY_MASTER_IMAGE_PROJECT_NAME}/${masterImage.virtual_path}
    RUN mkdir -p ${AnalysisContainerPath.CODE}
    RUN chmod -R +x ${AnalysisContainerPath.CODE}

    CMD [${cmdParts.join(', ')}]
    `;
}

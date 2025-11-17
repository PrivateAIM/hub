/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImageSynchronizerEventMap,
    MasterImageSynchronizerExecutePayload,
    MasterImageSynchronizerExecutionFinishedPayload,
} from '@privateaim/server-core-worker-kit';
import {
    MasterImageSynchronizerCommand,
    MasterImageSynchronizerEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentHandler, ComponentHandlerContext } from '@privateaim/server-kit';
import { scanDirectory } from 'docken';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../../../constants';
import { GitHubClient } from '../../../../core';
import { useAnalysisBuilderLogger } from '../../../analysis-builder/utils';
import {
    DockenGroupAttributesValidator,
    DockenImageAttributesValidator,
} from './validators';

export class MasterImageSynchronizerExecuteHandler implements ComponentHandler<
MasterImageSynchronizerEventMap,
MasterImageSynchronizerCommand.EXECUTE
> {
    protected groupValidator : DockenGroupAttributesValidator;

    protected imageValidator : DockenImageAttributesValidator;

    constructor() {
        this.groupValidator = new DockenGroupAttributesValidator();
        this.imageValidator = new DockenImageAttributesValidator();
    }

    async handle(
        payload: MasterImageSynchronizerExecutePayload,
        context: ComponentHandlerContext<MasterImageSynchronizerEventMap, MasterImageSynchronizerCommand.EXECUTE>,
    ) {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(payload, context);
        } catch (e) {
            useAnalysisBuilderLogger().error({
                message: e,
                command: MasterImageSynchronizerCommand.EXECUTE,
                event: MasterImageSynchronizerEvent.EXECUTION_FAILED,
            });

            await context.handle(
                MasterImageSynchronizerEvent.EXECUTION_FAILED,
                {
                    ...payload,
                    error: e,
                },
            );
        }
    }

    async handleInternal(
        payload: MasterImageSynchronizerExecutePayload,
        context: ComponentHandlerContext<MasterImageSynchronizerEventMap, MasterImageSynchronizerCommand.EXECUTE>,
    ) {
        await context.handle(
            MasterImageSynchronizerEvent.EXECUTION_STARTED,
            payload,
        );

        const gitHubClient = new GitHubClient();
        const directoryPath = await gitHubClient.cloneRepository({
            destination: MASTER_IMAGES_DIRECTORY_PATH,
            owner: payload.owner,
            repository: payload.repository,
            branch: payload.branch,
        });

        const data = await this.scanDirectory(directoryPath);

        await context.handle(
            MasterImageSynchronizerEvent.EXECUTION_FINISHED,
            data,
        );
    }

    protected async scanDirectory(directoryPath : string) : Promise<MasterImageSynchronizerExecutionFinishedPayload> {
        const output : MasterImageSynchronizerExecutionFinishedPayload = {
            images: [],
            groups: [],
        };

        const result = await scanDirectory(directoryPath);
        for (let i = 0; i < result.images.length; i++) {
            const attributes = await this.imageValidator.run(result.images[i].attributes);

            output.images.push({
                path: result.images[i].path,
                virtualPath: result.images[i].virtualPath,
                name: result.images[i].path.split('/').pop() || result.images[i].path,
                command: attributes.command,
                commandArguments: attributes.commandArguments || [],
            });
        }

        for (let i = 0; i < result.groups.length; i++) {
            const attributes = await this.groupValidator.run(result.groups[i].attributes);

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
}

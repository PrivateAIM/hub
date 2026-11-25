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
import type { Logger } from '@privateaim/server-kit';
import type { ComponentHandler, ComponentHandlerContext } from 'hubwire';
import { scanDirectory } from 'docken';
import { MASTER_IMAGES_DIRECTORY_PATH } from '../../../../../constants';
import { GitHubClient } from '../../../../../adapters/github/index.ts';
import {
    DockenGroupAttributesValidator,
    DockenImageAttributesValidator,
} from './validators';
import { isRetryableFailure } from '../../../helpers.ts';

export class MasterImageSynchronizerExecuteHandler implements ComponentHandler<
    MasterImageSynchronizerEventMap,
    MasterImageSynchronizerCommand.EXECUTE
> {
    protected groupValidator : DockenGroupAttributesValidator;

    protected imageValidator : DockenImageAttributesValidator;

    protected logger: Logger | undefined;

    constructor(ctx?: { logger?: Logger }) {
        this.groupValidator = new DockenGroupAttributesValidator();
        this.imageValidator = new DockenImageAttributesValidator();
        this.logger = ctx?.logger;
    }

    async handle(
        payload: MasterImageSynchronizerExecutePayload,
        context: ComponentHandlerContext<MasterImageSynchronizerEventMap, MasterImageSynchronizerCommand.EXECUTE>,
    ) {
        try {
            // todo: check if image exists, otherwise local queue task
            await this.handleInternal(payload, context);
        } catch (e) {
            const reason = Error.isError(e) ? e.message : String(e);

            if (isRetryableFailure(e, context.metadata)) {
                this.logger?.warn({
                    message: `Synchronizing master images failed, retrying: ${reason}`,
                    command: MasterImageSynchronizerCommand.EXECUTE,
                    retry: true,
                });

                throw e;
            }

            this.logger?.error({
                message: `Synchronizing master images failed: ${reason}`,
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

        // a failed validation rejects with a ScanValidationError naming the item's path
        const result = await scanDirectory(directoryPath, {
            validate: {
                image: (attributes) => this.imageValidator.run(attributes),
                group: (attributes) => this.groupValidator.run(attributes),
            },
        });

        for (const image of result.images) {
            output.images.push({
                path: image.path,
                virtualPath: image.virtualPath,
                name: image.path.split('/').pop() || image.path,
                command: image.attributes.command,
                commandArguments: image.attributes.commandArguments || [],
            });
        }

        for (const group of result.groups) {
            let name : string;

            if (group.attributes.name) {
                name = group.attributes.name;
            } else {
                const parts = group.path.split('/');

                name = parts.slice(0, -1).join('/');
            }

            output.groups.push({
                path: group.path,
                virtualPath: group.virtualPath,
                name: name || group.path,
            });
        }

        return output;
    }
}

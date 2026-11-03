/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as AuthupClient } from '@authup/core-http-kit';
import type { 
    HarborClient, 
    ProjectWebhookPolicy, 
    Robot, 
    RobotPermission, 
} from '@hapic/harbor';
import { isClientErrorWithStatusCode } from '@hapic/harbor';
import { ServiceID, buildRegistryClientConnectionStringFromRegistry } from '@privateaim/core-kit';
import { EntityConflictError } from '@privateaim/errors';
import { stringifyAuthorizationHeader } from 'hapic';
import { createBasicHarborAPIClient } from '../../utils.ts';
import { migrateRegistryProjectArtifacts } from '../../helpers/migrate-artifacts.ts';
import { buildRegistryProjectMigrationRobotName, parseRegistryProjectMigrationMarker } from './marker.ts';
import type {
    IRegistryProjectMigration,
    RegistryProjectMigrationMarker,
    RegistryProjectRelinkSource,
    RegistryProjectRelinkTarget,
} from './types.ts';

export class RegistryProjectMigration implements IRegistryProjectMigration {
    constructor(private readonly context: {
        publicURL: string;
        authupClient?: AuthupClient;
        createClient?: (connectionString: string) => HarborClient;
    }) {}

    async prepare(source: RegistryProjectRelinkSource, targetName: string): Promise<RegistryProjectRelinkTarget> {
        if (!this.context.authupClient || !this.context.publicURL) {
            throw new Error('Registry migration requires Authup and a public webhook URL.');
        }

        const client = this.client(source);
        const remoteSource = await client.project.getOne(source.project.externalName, true);

        if (!Number.isSafeInteger(remoteSource.project_id) || remoteSource.project_id <= 0 ||
            `${remoteSource.project_id}` !== source.project.externalId) {
            throw new EntityConflictError('The remote migration source no longer matches its stored id.');
        }

        let target;
        let created = false;

        try {
            target = await client.project.getOne(targetName, true);
        } catch (error) {
            if (!isClientErrorWithStatusCode(error, 404)) {
                throw error;
            }

            // Never update a conflicting existing project to make it ours.
            await client.project.create({ project_name: targetName, public: source.project.public });
            created = true;
            target = await client.project.getOne(targetName, true);
        }

        if (!Number.isSafeInteger(target.project_id) || target.project_id <= 0 || target.project_id === remoteSource.project_id) {
            throw new EntityConflictError('Harbor returned an invalid migration destination id.');
        }

        const marker: RegistryProjectMigrationMarker = {
            kind: 'privateaim-registry-project-migration',
            version: 1,
            registryId: source.registry.id,
            registryProjectId: source.project.id,
            sourceExternalName: source.project.externalName,
            sourceExternalId: `${remoteSource.project_id}`,
            targetExternalName: targetName,
            targetExternalId: `${target.project_id}`,
        };
        const robotName = buildRegistryProjectMigrationRobotName(source.project.id, targetName);
        let robot: Robot;

        if (created) {
            // If this fails, the unowned destination is deliberately not adopted
            // on retry. Operators must inspect/recover that creation gap.
            robot = await client.robot.create({
                name: robotName,
                description: JSON.stringify(marker),
                level: 'system',
                duration: -1,
                permissions: [this.pullPermissions(targetName)],
            });
        } else {
            const robots: Robot[] = [];

            for (let page = 1; ; page++) {
                const { data } = await client.robot.getMany({ query: { page, page_size: 100 } });

                robots.push(...data);

                if (data.length < 100) {
                    break;
                }
            }

            const owned = robots.filter((entry) => {
                const recorded = parseRegistryProjectMigrationMarker(entry.description);

                return recorded && Object.keys(marker).every((key) =>
                    recorded[key as keyof RegistryProjectMigrationMarker] === marker[key as keyof RegistryProjectMigrationMarker]);
            });

            if (owned.length !== 1 || !Number.isSafeInteger(owned[0].id) || owned[0].id <= 0 ||
                `${owned[0].id}` === source.project.accountId || !owned[0].name?.endsWith(robotName)) {
                throw new EntityConflictError('The migration destination is not verifiably owned by this relink.');
            }

            await client.robot.update(owned[0].id, {
                ...owned[0],
                description: JSON.stringify(marker),
                disable: false,
                level: 'system',
                duration: -1,
                permissions: [this.pullPermissions(targetName)],
            });

            const rotated = await client.robot.updateSecret(owned[0].id);

            robot = { ...owned[0], ...rotated };
        }

        if (!Number.isSafeInteger(robot.id) || robot.id <= 0 || !robot.name || !robot.secret) {
            throw new Error('Harbor did not return complete migration robot credentials.');
        }

        const persistedRobot = await client.robot.getOne(robot.id);
        const persistedMarker = parseRegistryProjectMigrationMarker(persistedRobot.description);
        const matchesMarker = persistedMarker && Object.keys(marker).every((key) =>
            persistedMarker[key as keyof RegistryProjectMigrationMarker] === marker[key as keyof RegistryProjectMigrationMarker]);

        if (!matchesMarker || persistedRobot.disable === true || persistedRobot.name !== robot.name) {
            throw new EntityConflictError('Harbor did not persist a usable migration ownership robot.');
        }

        return {
            externalName: targetName,
            externalId: `${target.project_id}`,
            accountId: `${robot.id}`,
            accountName: robot.name,
            accountSecret: robot.secret,
        };
    }

    async copy(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void> {
        await migrateRegistryProjectArtifacts(this.client(source), source.project.externalName, target.externalName);
        await this.verifyPullAccess(source, target);
    }

    async configureWebhook(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void> {
        const { authupClient } = this.context;

        if (!authupClient) {
            throw new Error('Registry migration requires Authup for webhook authentication.');
        }

        const { data: service } = await authupClient.client.getOne(ServiceID.REGISTRY, { fields: ['+secret'] });

        if (!service.secret) {
            throw new Error('Registry webhook service credentials are missing.');
        }

        const client = this.client(source);
        const data: Partial<ProjectWebhookPolicy> = {
            name: 'api',
            enabled: true,
            event_types: ['PUSH_ARTIFACT'],
            targets: [{
                type: 'http',
                address: `${this.context.publicURL.replace(/\/$/, '')}/services/${ServiceID.REGISTRY}/hook`,
                auth_header: stringifyAuthorizationHeader({
                    type: 'Basic', 
                    username: service.id, 
                    password: service.secret, 
                }),
                skip_cert_verify: true,
            }],
        };
        const context = { projectIdOrName: target.externalName, isProjectName: true };
        const policies: ProjectWebhookPolicy[] = [];

        for (let page = 1; ; page++) {
            const { data: entries } = await client.projectWebhookPolicy.getMany({ ...context, query: { page, page_size: 100 } });

            policies.push(...entries);

            if (entries.length < 100) {
                break;
            }
        }

        const matches = policies.filter((policy) => policy.name === 'api');

        if (matches.length > 1) {
            throw new EntityConflictError('The migration destination has ambiguous webhook policies.');
        }

        if (matches.length === 1) {
            await client.projectWebhookPolicy.update({
                ...context, 
                id: matches[0].id, 
                data, 
            });
        } else {
            await client.projectWebhookPolicy.create({ ...context, data });
        }
    }

    private async verifyPullAccess(source: RegistryProjectRelinkSource, target: RegistryProjectRelinkTarget): Promise<void> {
        const client = (this.context.createClient ?? createBasicHarborAPIClient)(
            buildRegistryClientConnectionStringFromRegistry({
                ...source.registry,
                accountName: target.accountName,
                accountSecret: target.accountSecret,
            }),
        );
        const project = await client.project.getOne(target.externalName, true);

        if (`${project.project_id}` !== target.externalId) {
            throw new EntityConflictError('The destination robot cannot resolve the expected target project.');
        }

        for (let page = 1; ; page++) {
            const { data: repositories } = await client.projectRepository.getMany({
                projectName: target.externalName,
                query: { page, page_size: 100 },
            });

            for (const repository of repositories) {
                const prefix = `${target.externalName}/`;

                if (!repository.name.startsWith(prefix)) {
                    throw new Error('Harbor returned an invalid destination repository name.');
                }

                await client.projectRepositoryArtifact.getMany({
                    projectName: target.externalName,
                    // Harbor decodes once while routing and once in the handler.
                    repositoryName: encodeURIComponent(encodeURIComponent(repository.name.slice(prefix.length))),
                    query: { page: 1, page_size: 1 },
                });
            }

            if (repositories.length < 100) {
                break;
            }
        }
    }

    private client(source: RegistryProjectRelinkSource): HarborClient {
        return (this.context.createClient ?? createBasicHarborAPIClient)(
            buildRegistryClientConnectionStringFromRegistry(source.registry),
        );
    }

    private pullPermissions(namespace: string): RobotPermission {
        return {
            namespace,
            kind: 'project',
            access: [
                { resource: 'artifact', action: 'list' },
                { resource: 'artifact', action: 'read' },
                { resource: 'repository', action: 'list' },
                { resource: 'repository', action: 'pull' },
                { resource: 'tag', action: 'list' },
                { resource: 'project', action: 'read' },
            ],
        };
    }
}

/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    HarborClient,
    ProjectArtifact,
    ProjectArtifactTag,
    ProjectRepository,
} from '@hapic/harbor';
import { isClientErrorWithStatusCode } from '@hapic/harbor';

type HarborArtifact = Pick<ProjectArtifact, 'digest'> & {
    references?: { child_digest: string }[] | null
};

// These v2 REST shapes are not declared by the installed Harbor client.
type HarborAccessory = {
    digest: string,
    type: string,
    subject_artifact_digest: string,
    subject_artifact_repo: string
};

type ArtifactInventory = {
    digest: string,
    tags: string[],
    references: string[],
    accessories: { digest: string, type: string }[]
};

type RepositoryInventory = {
    name: string,
    roots: string[],
    artifacts: ArtifactInventory[]
};

const PAGE_SIZE = 100;

async function getAll<T>(client: HarborClient, path: string) : Promise<T[]> {
    const items: T[] = [];
    const separator = path.includes('?') ? '&' : '?';

    for (let page = 1; ; page++) {
        const { data } = await client.get<T[]>(`${path}${separator}page=${page}&page_size=${PAGE_SIZE}`);

        if (!Array.isArray(data)) {
            throw new Error(`Invalid Harbor inventory response for ${path}`);
        }

        items.push(...data);

        if (data.length < PAGE_SIZE) {
            return items;
        }
    }
}

function repositoryPath(project: string, repository: string) : string {
    // Harbor decodes the repository parameter twice; nested names need %252F.
    return `projects/${encodeURIComponent(project)}/repositories/${encodeURIComponent(encodeURIComponent(repository))}`;
}

function artifactPath(project: string, repository: string, reference: string) : string {
    return `${repositoryPath(project, repository)}/artifacts/${encodeURIComponent(reference)}`;
}

async function verifyReference(
    client: HarborClient,
    project: string,
    repository: string,
    reference: string,
    digest: string,
) : Promise<HarborArtifact> {
    const { data } = await client.get<HarborArtifact>(artifactPath(project, repository, reference));

    if (data.digest !== digest) {
        throw new Error(`Harbor digest mismatch for ${project}/${repository}@${reference}: expected ${digest}, received ${data.digest}`);
    }

    return data;
}

async function readArtifact(
    client: HarborClient,
    project: string,
    repository: string,
    digest: string,
) : Promise<ArtifactInventory> {
    const artifact = await verifyReference(client, project, repository, digest, digest);
    const path = artifactPath(project, repository, digest);
    const tags = await getAll<Pick<ProjectArtifactTag, 'name'>>(client, `${path}/tags`);
    const accessories = await getAll<HarborAccessory>(client, `${path}/accessories`);
    const references = (artifact.references || []).map((reference) => reference.child_digest);

    for (const accessory of accessories) {
        if (
            !accessory.digest || !accessory.type ||
            accessory.subject_artifact_digest !== digest ||
            accessory.subject_artifact_repo !== `${project}/${repository}`
        ) {
            throw new Error(`Unsupported Harbor accessory association for ${project}/${repository}@${digest}`);
        }
    }

    for (const reference of references) {
        if (!reference) {
            throw new Error(`Unsupported Harbor artifact reference for ${project}/${repository}@${digest}`);
        }
    }

    return {
        digest,
        tags: tags.map((tag) => tag.name).sort(),
        references: references.sort(),
        accessories: accessories.map(({ digest: accessoryDigest, type }) => ({ digest: accessoryDigest, type }))
            .sort((a, b) => a.digest.localeCompare(b.digest) || a.type.localeCompare(b.type)),
    };
}

async function readInventory(client: HarborClient, project: string) : Promise<RepositoryInventory[]> {
    const repositories = await getAll<Pick<ProjectRepository, 'name'>>(
        client,
        `projects/${encodeURIComponent(project)}/repositories`,
    );
    const inventory: RepositoryInventory[] = [];

    for (const repository of repositories) {
        const prefix = `${project}/`;

        if (!repository.name.startsWith(prefix) || repository.name.length === prefix.length) {
            throw new Error(`Invalid Harbor repository name: ${repository.name}`);
        }

        const name = repository.name.slice(prefix.length);
        // Default listing hides untagged index children. Hard accessories remain
        // hidden even with base=* and must be discovered through their subjects.
        const artifacts = await getAll<Pick<ProjectArtifact, 'digest'>>(
            client,
            `${repositoryPath(project, name)}/artifacts?q=${encodeURIComponent('base=*')}`,
        );
        const roots = artifacts.map((artifact) => artifact.digest).sort();
        const pending = [...roots];
        const entries = new Map<string, ArtifactInventory>();

        for (const digest of pending) {
            if (!digest) {
                throw new Error(`Missing Harbor artifact digest in ${repository.name}`);
            }

            if (entries.has(digest)) {
                continue;
            }

            const entry = await readArtifact(client, project, name, digest);

            entries.set(digest, entry);
            pending.push(...entry.references, ...entry.accessories.map((accessory) => accessory.digest));
        }

        inventory.push({
            name, 
            roots, 
            artifacts: entries.values().toArray().sort((a, b) => a.digest.localeCompare(b.digest)), 
        });
    }

    return inventory.sort((a, b) => a.name.localeCompare(b.name));
}

/** Copy only. The caller must quiesce writes, provision the target and perform any cutover/retirement. */
export async function migrateRegistryProjectArtifacts(
    client: HarborClient,
    sourceProject: string,
    targetProject: string,
) : Promise<void> {
    if (!sourceProject || !targetProject || sourceProject === targetProject) {
        throw new Error('Harbor artifact migration requires distinct, non-empty projects');
    }

    const source = await readInventory(client, sourceProject);

    // Harbor's COPY itself ensures tags, potentially moving mutable tags. Check
    // ALL tags (including children/accessories) before issuing even the first COPY.
    for (const repository of source) {
        for (const artifact of repository.artifacts) {
            for (const tag of artifact.tags) {
                try {
                    await verifyReference(client, targetProject, repository.name, tag, artifact.digest);
                } catch (error) {
                    if (!isClientErrorWithStatusCode(error, 404)) {
                        throw error;
                    }
                }
            }
        }
    }

    for (const repository of source) {
        // Copy every ordinary digest, including children whose tags can be skipped
        // by Harbor's recursive copy on retry. Never copy a hard accessory as root.
        for (const digest of repository.roots) {
            const from = encodeURIComponent(`${sourceProject}/${repository.name}@${digest}`);

            try {
                // Do not use artifact.copy(): its builder does not encode the from query.
                await client.post<void>(`${repositoryPath(targetProject, repository.name)}/artifacts?from=${from}`);
            } catch (error) {
                if (!isClientErrorWithStatusCode(error, 409)) {
                    throw error;
                }
            }

            // A 409 can mean a conflict other than an already-copied artifact.
            await verifyReference(client, targetProject, repository.name, digest, digest);
        }

        for (const artifact of repository.artifacts) {
            await verifyReference(client, targetProject, repository.name, artifact.digest, artifact.digest);

            const target = artifactPath(targetProject, repository.name, artifact.digest);

            for (const tag of artifact.tags) {
                try {
                    await client.post<void>(`${target}/tags`, { name: tag });
                } catch (error) {
                    if (!isClientErrorWithStatusCode(error, 409)) {
                        throw error;
                    }
                }

                await verifyReference(client, targetProject, repository.name, tag, artifact.digest);
            }
        }
    }

    // Re-read each destination independently, not just the COPY/create responses.
    for (const repository of source) {
        for (const artifact of repository.artifacts) {
            const actual = await readArtifact(client, targetProject, repository.name, artifact.digest);

            if (JSON.stringify(actual.references) !== JSON.stringify(artifact.references)) {
                throw new Error(`Harbor destination reference mismatch for ${repository.name}@${artifact.digest}`);
            }

            const tags = new Set(actual.tags);

            for (const tag of artifact.tags) {
                if (!tags.has(tag)) {
                    throw new Error(`Missing Harbor destination tag ${targetProject}/${repository.name}:${tag}`);
                }
            }

            for (const accessory of artifact.accessories) {
                const exists = actual.accessories.some((entry) => entry.digest === accessory.digest && entry.type === accessory.type);

                if (!exists) {
                    throw new Error(`Missing Harbor destination accessory ${targetProject}/${repository.name}@${accessory.digest}`);
                }
            }
        }
    }

    if (JSON.stringify(source) !== JSON.stringify(await readInventory(client, sourceProject))) {
        throw new Error(`Harbor source inventory changed during migration: ${sourceProject}`);
    }
}

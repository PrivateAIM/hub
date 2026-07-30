/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { RegistryProject } from '@privateaim/core-kit';
import type { IRegistryManager } from '../../../../../src/core/entities/node/types.ts';

export class FakeRegistryManager implements IRegistryManager {
    private projects: RegistryProject[] = [];

    private defaultRegistryId: string | null = null;

    private linkCalls: string[] = [];

    private unlinkCalls: RegistryProject[] = [];

    private relinkCalls: RegistryProject[] = [];

    private removeCalls: RegistryProject[] = [];

    private removeObserver?: (project: RegistryProject) => void;

    setDefaultRegistryId(id: string | null): void {
        this.defaultRegistryId = id;
    }

    async findDefaultRegistryId(): Promise<string | null> {
        return this.defaultRegistryId;
    }

    async createProject(data: Partial<RegistryProject>): Promise<RegistryProject> {
        const project = {
            id: randomUUID(),
            ...data,
        } as RegistryProject;
        this.projects.push(project);
        return project;
    }

    async findProject(id: string): Promise<RegistryProject | null> {
        return this.projects.find((p) => p.id === id) ?? null;
    }

    async saveProject(project: RegistryProject): Promise<RegistryProject> {
        const index = this.projects.findIndex((p) => p.id === project.id);
        if (index >= 0) {
            this.projects[index] = project;
        } else {
            this.projects.push(project);
        }
        return project;
    }

    async removeProject(project: RegistryProject): Promise<void> {
        this.removeCalls.push(project);
        this.removeObserver?.(project);
        this.projects = this.projects.filter((p) => p.id !== project.id);
    }

    async linkProject(id: string): Promise<void> {
        this.linkCalls.push(id);
    }

    async relinkProject(project: RegistryProject): Promise<void> {
        this.relinkCalls.push(project);
    }

    async unlinkProject(project: RegistryProject): Promise<void> {
        this.unlinkCalls.push(project);
    }

    // --- Test helpers ---

    getLinkCalls(): string[] {
        return [...this.linkCalls];
    }

    getUnlinkCalls(): RegistryProject[] {
        return [...this.unlinkCalls];
    }

    getRelinkCalls(): RegistryProject[] {
        return [...this.relinkCalls];
    }

    getRemoveCalls(): RegistryProject[] {
        return [...this.removeCalls];
    }

    /**
     * Observe the exact moment a project is torn down. `nodes.registryProjectId`
     * carries an `ON DELETE CASCADE` FK in the real schema, so removing a project
     * a node still references deletes that node too — tests use this to assert the
     * node was already detached and persisted before the removal happens.
     */
    observeRemoveProject(fn: (project: RegistryProject) => void): void {
        this.removeObserver = fn;
    }

    getProjects(): RegistryProject[] {
        return [...this.projects];
    }

    seedProject(project: RegistryProject): void {
        this.projects.push(project);
    }
}

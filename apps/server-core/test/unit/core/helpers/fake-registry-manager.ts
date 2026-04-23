/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { RegistryProject } from '@privateaim/core-kit';
import type { IRegistryManager } from '../../../../src/core/entities/node/types.ts';

export class FakeRegistryManager implements IRegistryManager {
    private projects: RegistryProject[] = [];

    private defaultRegistryId: string | null = null;

    private linkCalls: string[] = [];

    private unlinkCalls: RegistryProject[] = [];

    private relinkCalls: RegistryProject[] = [];

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

    getProjects(): RegistryProject[] {
        return [...this.projects];
    }

    seedProject(project: RegistryProject): void {
        this.projects.push(project);
    }
}

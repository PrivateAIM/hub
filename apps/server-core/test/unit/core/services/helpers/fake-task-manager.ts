/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITaskManager } from '../../../../../src/core/services/analysis-storage-manager/types.ts';

type TaskManagerCall = {
    type: string;
    data: Record<string, any>;
    correlationId: string;
};

export class FakeTaskManager implements ITaskManager {
    private calls: TaskManagerCall[] = [];

    private nextId = 0;

    async create(type: string, data: Record<string, any>): Promise<string> {
        const correlationId = `task-${this.nextId++}`;
        this.calls.push({
            type, 
            data, 
            correlationId, 
        });
        return correlationId;
    }

    getCalls(): TaskManagerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(type: string): TaskManagerCall[] {
        return this.calls.filter((c) => c.type === type);
    }

    clear(): void {
        this.calls = [];
        this.nextId = 0;
    }
}

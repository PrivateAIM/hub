/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';

type ComponentsModuleContext = {
    aggregators: Component[];
    components: Component[];
};

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    private ctx: ComponentsModuleContext;

    constructor(ctx: ComponentsModuleContext) {
        this.ctx = ctx;
    }

    async setup(): Promise<void> {
        this.ctx.components.forEach((c) => c.start());
        this.ctx.aggregators.forEach((a) => a.start());
    }
}

/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IdentityPolicyData } from '@authup/access';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import type { Store } from '@authup/client-web-kit';
import type {
    NavigationItem,
} from '@vuecs/navigation';
import {
    LayoutSideAdminNavigation,
    LayoutSideDefaultNavigation,
    LayoutTopNavigation,
} from './contants';
import type { NavigationItemMeta } from './types';

export class Navigation {
    protected store : Store;

    protected initialized: boolean;

    constructor(store: Store) {
        this.store = store;
        this.initialized = false;
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        try {
            await this.store.resolve();
        } catch {
            // do nothing :)
        }
    }

    /**
     * Resolve the top navigation items, filtered against the current session.
     * Used as the `:data` resolver of the header's `<VCNavItems>`.
     */
    getTopItems(): Promise<NavigationItem[]> {
        return this.reduce(LayoutTopNavigation);
    }

    /**
     * Resolve the sidebar navigation items, filtered against the current
     * session. The admin sidebar is selected when the active route lives under
     * `/admin/` (mirrors the pre-4.x `parent.name === 'Admin'` branch — the
     * @vuecs/navigation 4.x registry model has no NavigationManager to carry
     * the active top-level item, so the variant is derived from the path).
     * Used as the `:data` resolver of the sidebar's `<VCNavItems>`.
     */
    getSideItems(path?: string): Promise<NavigationItem[]> {
        if (path && path.startsWith('/admin')) {
            return this.reduce(LayoutSideAdminNavigation);
        }

        return this.reduce(LayoutSideDefaultNavigation);
    }

    protected async reduce(items: NavigationItem[]) : Promise<NavigationItem[]> {
        await this.initialize();

        const promises = items.map(
            (item) => this.reduceItem(item),
        );

        const output = await Promise.all(promises);

        return output.filter((item) => !!item);
    }

    protected async reduceItem(
        item: NavigationItem<NavigationItemMeta>,
    ) : Promise<NavigationItem | undefined> {
        if (!item.meta) {
            return item;
        }

        const { loggedIn } = this.store;
        let identity: IdentityPolicyData | undefined;
        if (this.store.userId) {
            identity = {
                type: 'user',
                id: this.store.userId,
            };
        }

        if (
            typeof item.meta.requireLoggedIn !== 'undefined' &&
            item.meta.requireLoggedIn &&
            !loggedIn
        ) {
            return undefined;
        }

        if (
            typeof item.meta.requireLoggedOut !== 'undefined' &&
            item.meta.requireLoggedOut &&
            loggedIn
        ) {
            return undefined;
        }

        let canPass = true;

        if (item.meta.requirePermissions) {
            const permissions : string[] = Array.isArray(item.meta.requirePermissions) ?
                item.meta.requirePermissions :
                [item.meta.requirePermissions];

            if (permissions.length > 0) {
                try {
                    const input = new PolicyData();
                    input.set(BuiltInPolicyType.IDENTITY, identity);
                    await this.store.permissionEvaluator.preEvaluateOneOf({
                        name: permissions,
                        input,
                    });
                } catch {
                    canPass = false;
                }
            }
        }

        if (canPass) {
            if (item.children) {
                item.children = await this.reduce(item.children);
            }

            return item;
        }

        return undefined;
    }
}

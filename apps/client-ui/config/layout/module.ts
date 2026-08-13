/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IdentityPolicyData } from '@authup/access';
import { BuiltInPolicyType, PolicyData } from '@authup/access';
import type { Store } from '@authup/client-web-kit';
import { StoreAuthStatus } from '@authup/client-web-kit';
import type {
    NavigationItem,
} from '@vuecs/navigation';
import {
    LayoutSideAdminNavigation,
    LayoutSideDefaultNavigation,
    LayoutTopNavigation,
    LayoutTopNavigationName,
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
     * session. The admin sidebar is selected when the header's top nav has
     * the "Admin" section active — the sidebar reads that active section name
     * from the shared navigation registry (published by the top
     * `<VCNavItems registry>`). This switches the sidebar both on navigation
     * into `/admin/*` (path-matched via the section's `activeMatch`) AND on a
     * direct click of the url-less "Admin" top tab (selection republished
     * through the registry). Used as the `:data` resolver of the sidebar's
     * `<VCNavItems>`.
     */
    getSideItems(activeTopName?: string): Promise<NavigationItem[]> {
        if (activeTopName === LayoutTopNavigationName.ADMIN) {
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

        const authenticated = this.store.status === StoreAuthStatus.AUTHENTICATED;
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
            !authenticated
        ) {
            return undefined;
        }

        if (
            typeof item.meta.requireLoggedOut !== 'undefined' &&
            item.meta.requireLoggedOut &&
            authenticated
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
                    const data = new PolicyData();
                    data.set(BuiltInPolicyType.IDENTITY, identity);
                    await this.store.permissionEvaluator.preEvaluateOneOf({
                        name: permissions,
                        data,
                    });
                } catch {
                    canPass = false;
                }
            }
        }

        if (canPass) {
            if (item.children) {
                const children = await this.reduce(item.children);

                // A group parent that lost every child has nothing left to
                // reveal, and `VCNavItem` renders a childless item as a leaf
                // — which for a url-less group means an inert dead entry.
                // Reachable for the "Projects" group: its gate is the UNION
                // of both directions, so an actor holding only
                // ANALYSIS_APPROVE passes the parent while failing both
                // "Outgoing" (no analysis-approve there) and "Incoming"
                // (PROJECT_APPROVE).
                if (children.length === 0 && !item.url) {
                    return undefined;
                }

                // Copy rather than assign into `item.children`: `item` is the
                // very object held by the module-level LayoutSide*Navigation
                // constant, so writing the filtered list back would prune the
                // source permanently. Every later resolve reduces the ALREADY
                // reduced array, and the arrays only ever shrink — so a realm
                // switch into a realm without PROJECT_APPROVE would drop
                // "Incoming" for the rest of the page's life, including after
                // switching back. The resolver re-runs on exactly that signal
                // (the sidebar watches `store.realmManagement`).
                return { ...item, children };
            }

            return item;
        }

        return undefined;
    }
}

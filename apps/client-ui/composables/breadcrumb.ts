/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BreadcrumbItem } from '@vuecs/navigation';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

type BreadcrumbCrumb = {
    label: string,
    url: string,
    icon?: string
};

export type SectionBreadcrumbContext = {
    /**
     * Optional ancestor above the section — `Admin` for the admin console.
     * Omitted for a top-level section such as `Projects`.
     */
    root?: BreadcrumbCrumb,
    /** The section itself, e.g. `Clients` -> `/admin/clients`. */
    section: BreadcrumbCrumb,
    /**
     * Extra leaf crumbs, each shown only on its own route, e.g.
     * `[{ url: '/projects/in', label: 'Incoming' }]`. Only the crumb whose
     * url matches the current path is appended.
     */
    children?: {
        url: string, 
        label: string, 
        icon?: string 
    }[]
};

/**
 * The `Root > Section [> Leaf]` trail shared by every collection page.
 *
 * Detail pages do NOT use this — their trail names resolved entities
 * (`Projects > <project> > Analyses > <analysis>`), which has to be built from
 * the loaded records rather than from url segments so it cannot go stale.
 *
 * `VCBreadcrumb` treats the last crumb as the current page, so the section
 * crumb is navigable only while a leaf is appended after it.
 */
export function useSectionBreadcrumb(
    ctx: SectionBreadcrumbContext,
): ComputedRef<BreadcrumbItem[]> {
    const route = useRoute();

    // A trailing slash is a distinct `route.path` but the same page.
    const normalize = (value: string) => (
        value.length > 1 && value.endsWith('/') ?
            value.slice(0, -1) :
            value
    );

    return computed<BreadcrumbItem[]>(() => {
        const path = normalize(route.path);

        const items: BreadcrumbItem[] = [];

        if (ctx.root) {
            items.push({
                label: ctx.root.label,
                to: ctx.root.url,
                icon: ctx.root.icon,
            });
        }

        items.push({
            label: ctx.section.label,
            to: ctx.section.url,
            icon: ctx.section.icon,
        });

        const child = (ctx.children ?? [])
            .find((entry) => normalize(entry.url) === path);

        if (child) {
            items.push({ label: child.label, icon: child.icon });
        }

        return items;
    });
}

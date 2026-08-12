<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { usePermissionCheck } from '@authup/client-web-kit';
import type { Project } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { FContentAction } from '@privateaim/client-vue';
import { VCBreadcrumb } from '@vuecs/navigation';
import { VCIcon } from '@vuecs/icon';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta, useToast } from '#imports';
import { useSectionBreadcrumb } from '../../composables/breadcrumb';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        FContentAction, 
        VCBreadcrumb, 
        VCIcon, 
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        });

        // "Outgoing" / "Incoming" are children of the global sidebar's
        // "Projects" group, not tabs of this page.
        const breadcrumbItems = useSectionBreadcrumb({
            section: {
                label: 'Projects', 
                url: '/projects', 
                icon: 'fa6-solid:diagram-project', 
            },
            children: [
                {
                    url: '/projects/in', 
                    label: 'Incoming', 
                    icon: 'fa6-solid:file-import', 
                },
                {
                    url: '/projects/add', 
                    label: 'Add', 
                    icon: 'fa6-solid:plus', 
                },
            ],
        });

        const route = useRoute();

        /**
         * One `<h1>` serves `/projects`, `/projects/in` and `/projects/add`, so
         * the description has to follow the route — a single line covering both
         * directions ("incoming & outgoing") described neither view accurately
         * once they became separate sidebar entries.
         */
        const subtitle = computed(() => {
            if (route.path === '/projects/in') {
                return 'Projects other realms want your nodes to join';
            }

            if (route.path === '/projects/add') {
                return 'Name it now — nodes and analyses come after';
            }

            return 'Projects your realm created';
        });

        const canCreate = usePermissionCheck({ name: PermissionName.PROJECT_CREATE });

        const toast = useToast();

        const handleCreated = (entity: Project) => {
            toast.show({ variant: 'success', body: 'The project was successfully created.' });

            navigateTo({ path: `/projects/${entity.id}` });
        };

        return {
            breadcrumbItems,
            subtitle,
            canCreate,
            handleCreated,
        };
    },
});
</script>
<template>
    <div>
        <VCBreadcrumb
            :items="breadcrumbItems"
        />

        <div class="flex flex-row flex-wrap gap-3 items-start justify-between mb-2">
            <div>
                <h1 class="title no-border mb-0">
                    <VCIcon
                        name="fa6-solid:diagram-project"
                        class="me-1"
                    /> Projects
                </h1>
                <p class="mt-1 text-sm text-fg-muted">
                    {{ subtitle }}
                </p>
            </div>

            <FContentAction
                overview-url="/projects"
                add-url="/projects/add"
                :add-disabled="!canCreate"
            />
        </div>

        <NuxtPage @created="handleCreated" />
    </div>
</template>

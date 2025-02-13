<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { computed } from 'vue';
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import {
    FPagination, FProjectItem, FProjects, FSearch, FTitle,
} from '@privateaim/client-vue';
import { PermissionName } from '@privateaim/kit';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';
import { defineNuxtComponent, definePageMeta } from '#imports';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination, ListSearch: FSearch, ListTitle: FTitle, FProjects, FProjectItem,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PROJECT_CREATE,
                PermissionName.PROJECT_DELETE,
                PermissionName.PROJECT_UPDATE,

                PermissionName.ANALYSIS_CREATE,
                PermissionName.ANALYSIS_UPDATE,
                PermissionName.ANALYSIS_DELETE,

                PermissionName.ANALYSIS_RESULT_READ,

                PermissionName.ANALYSIS_EXECUTION_START,
                PermissionName.ANALYSIS_EXECUTION_STOP,
            ],
        });

        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const query = computed(() => ({
            filter: {
                realm_id: realmId.value,
            },
            sort: {
                updated_at: 'DESC',
            },
        }));

        return {
            query,
        };
    },
});
</script>
<template>
    <div>
        <div class="m-t-10">
            <FProjects
                :query="query"
            >
                <template #header="props">
                    <ListTitle />
                    <ListSearch
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #footer="props">
                    <ListPagination
                        :load="props.load"
                        :meta="props.meta"
                    />
                </template>
                <template #item="props">
                    <FProjectItem
                        :entity="props.data"
                        @updated="props.updated"
                        @deleted="props.deleted"
                    />
                </template>
            </FProjects>
        </div>
    </div>
</template>

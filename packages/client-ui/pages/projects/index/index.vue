<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@privateaim/core';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
    FPagination, FProjectItem, FProjects, FSearch, FTitle,
} from '@privateaim/client-vue';
import { useStore } from '@authup/client-web-kit';
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
                PermissionID.PROJECT_ADD,
                PermissionID.PROJECT_DROP,
                PermissionID.PROJECT_EDIT,

                PermissionID.ANALYSIS_ADD,
                PermissionID.ANALYSIS_EDIT,
                PermissionID.ANALYSIS_DROP,

                PermissionID.ANALYSIS_RESULT_READ,

                PermissionID.ANALYSIS_EXECUTION_START,
                PermissionID.ANALYSIS_EXECUTION_STOP,
            ],
        });

        const store = useStore();
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

<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { BuildInput } from 'rapiq';
import { computed } from 'vue';
import {
    FAnalyses, FPagination, FSearch, FTitle,
} from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination, ListSearch: FSearch, ListTitle: FTitle, FAnalyses,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
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

        const query = computed<BuildInput<Analysis>>(() => ({
            filter: {
                realm_id: realmId.value,
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
            <FAnalyses :query="query">
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
            </FAnalyses>
        </div>
    </div>
</template>

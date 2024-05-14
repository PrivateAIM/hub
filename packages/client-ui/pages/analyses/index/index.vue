<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { useStore } from '@authup/client-web-kit';
import type { Analysis } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { storeToRefs } from 'pinia';
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

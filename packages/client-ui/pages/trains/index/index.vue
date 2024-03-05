<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Analysis } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';
import { storeToRefs } from 'pinia';
import type { BuildInput } from 'rapiq';
import { computed } from 'vue';
import {
    FPagination, FSearch, FTitle, FAnalyses,
} from '@privateaim/client-vue';
import { definePageMeta } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { useAuthStore } from '../../../store/auth';

export default defineNuxtComponent({
    components: {
        ListPagination: FPagination, ListSearch: FSearch, ListTitle: FTitle, TrainList: FAnalyses,
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

        const store = useAuthStore();
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
        <div class="alert alert-primary alert-sm">
            This is an overview of all created trains, either by you or a person of your station.
        </div>

        <div class="m-t-10">
            <TrainList :query="query">
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
            </TrainList>
        </div>
    </div>
</template>

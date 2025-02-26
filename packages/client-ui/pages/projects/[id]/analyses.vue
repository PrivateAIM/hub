<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { injectStore, storeToRefs } from '@authup/client-web-kit';
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import type { Project, ProjectNode } from '@privateaim/core-kit';
import { defineNuxtComponent } from '#app';
import DomainEntityNav from '../../../components/DomainEntityNav';

export default defineNuxtComponent({
    components: { DomainEntityNav },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
        visitorProjectNode: {
            type: Object as PropType<ProjectNode>,
            default: undefined,
        },
    },
    setup(props) {
        const entity = toRef(props, 'entity');

        const store = injectStore();
        const { realmId } = storeToRefs(store);

        const isOwner = computed(() => entity.value.realm_id === realmId.value);

        const tabs = computed(() => [
            {
                name: 'Outgoing', icon: 'fa fa-file-export', path: '',
            },
            {
                name: 'Incoming', icon: 'fa fa-file-import', path: '/in',
            },
            ...(isOwner.value ? [
                {
                    name: 'Add', routeName: 'settings-id-security', icon: 'fa fa-plus', path: '/add',
                },
            ] : []),
        ]);

        return {
            tabs,
        };
    },
});
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar flex-column">
            <DomainEntityNav
                :items="tabs"
                :direction="'vertical'"
                :path="'/projects/' + entity.id + '/analyses'"
            />
        </div>
        <div class="content-container">
            <NuxtPage
                :entity="entity"
                :visitor-project-node="visitorProjectNode"
            />
        </div>
    </div>
</template>

<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ServiceID } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { definePageMeta, navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.SERVICE_MANAGE,
            ],
        });

        const items = [
            {
                id: 'master-images',
                name: 'Master Images',
                icon: 'fa6-solid:atom',
                version: 'v1.0.0-alpha.0',
            },
        ];

        const thirdPartyItems = [
            {
                id: ServiceID.REGISTRY,
                name: 'Image Registry',
                icon: 'fa6-brands:docker',
                version: 'v2.4.0',
            },
        ];

        const goTo = async (id: string) => {
            await navigateTo(`/admin/services/${id}`);
        };

        return {
            goTo,
            items,
            thirdPartyItems,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon name="fa6-solid:signs-post" /> Services <span class="sub-title">Management</span>
        </h1>

        <h6>
            Internal
        </h6>
        <div class="m-t-10">
            <div class="row">
                <div
                    v-for="(item,key) in items"
                    :key="key"
                    class="col-sm-4 col-md-3 col-12 mb-3"
                >
                    <div
                        class="event-card p-3 flex flex-col text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div class="event-card-header">
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div class="event-card-body">
                            <VCIcon :name="item.icon" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <h6>External</h6>
        <div class="m-t-10">
            <div class="row">
                <div
                    v-for="(item,key) in thirdPartyItems"
                    :key="key"
                    class="col-sm-4 col-md-3 col-12 mb-3"
                >
                    <div
                        class="event-card p-3 flex flex-col text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div class="event-card-header">
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div class="event-card-body">
                            <VCIcon :name="item.icon" />
                        </div>
                        <div class="event-card-footer">
                            <div class="flex flex-row">
                                <div class="ms-auto">
                                    <span class="foot-print">{{ item.version }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
.event-card {
    background-color: #ececec;
    border: 1px solid #dedede;
    box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%);
    border-radius: 4px;
    cursor: pointer;
}
.event-card-header,
.event-card-header a {
    text-decoration: none;
}
.event-card-header a:hover,
.event-card-header a:active {
    font-weight: 600;
    color: inherit;
}
.event-card-body svg.iconify {
    font-size: 5rem;
}
.event-card .foot-print {
    color: #cc8181;
}

</style>

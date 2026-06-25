<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ServiceID } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { VCIcon } from '@vuecs/icon';
import { definePageMeta, navigateTo } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '~/config/layout';

export default defineNuxtComponent({
    components: { VCIcon },
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
            <div class="flex flex-wrap -mx-2">
                <div
                    v-for="(item,key) in items"
                    :key="key"
                    class="w-full px-2 sm:w-4/12 md:w-3/12 mb-3"
                >
                    <div
                        class="card card-event p-3 flex flex-col text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div>
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div>
                            <VCIcon
                                :name="item.icon"
                                class="text-[5rem]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <h6>External</h6>
        <div class="m-t-10">
            <div class="flex flex-wrap -mx-2">
                <div
                    v-for="(item,key) in thirdPartyItems"
                    :key="key"
                    class="w-full px-2 sm:w-4/12 md:w-3/12 mb-3"
                >
                    <div
                        class="card card-event p-3 flex flex-col text-center"
                        @click.prevent="goTo(item.id)"
                    >
                        <div>
                            <h3>{{ item.name }}</h3>
                        </div>
                        <div>
                            <VCIcon
                                :name="item.icon"
                                class="text-[5rem]"
                            />
                        </div>
                        <div class="mt-auto flex flex-row">
                            <div class="ms-auto">
                                <span class="text-fg-muted">{{ item.version }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

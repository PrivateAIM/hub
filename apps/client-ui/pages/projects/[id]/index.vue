<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARealm } from '@authup/client-web-kit';
import {
    FDisplayName,
    FMasterImage,
    FProjectCreator,
    FProjectNodeApprovalStatus,
    FProjectNodes,
} from '@privateaim/client-vue';
import type { Project, ProjectNode } from '@privateaim/core-kit';
import { VCIcon } from '@vuecs/icon';
import type { QueryBuildInput } from '@rapiq/core';
import type { PropType } from 'vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: {
        FDisplayName,
        FProjectCreator,
        ARealm,
        FMasterImage,
        FProjectNodeApprovalStatus,
        FProjectNodes,
        VCIcon,
    },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    props: {
        entity: {
            type: Object as PropType<Project>,
            required: true,
        },
    },
    setup(props) {
        const projectNodeQuery : QueryBuildInput<ProjectNode, 3> = {
            filters: { projectId: props.entity.id },
            sorts: 'node.name',
        };

        return { projectNodeQuery };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="mb-2">
            <h6><VCIcon name="fa6-solid:info" /> Info</h6>
            <div class="flex flex-row gap-3 w-full">
                <div class="card-grey card grow">
                    <div class="card-header">
                        <span class="title">Analyses</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <VCIcon
                                name="fa6-solid:microscope"
                                class="text-4xl"
                            />
                        </div>
                        <div class="h6">
                            {{ entity.analyses }}
                        </div>
                    </div>
                </div>

                <template v-if="entity.masterImageId">
                    <div class="card-grey card grow">
                        <div class="card-header">
                            <span class="title">MasterImage</span>
                        </div>
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <VCIcon
                                    name="fa6-solid:compact-disc"
                                    class="text-4xl"
                                />
                            </div>
                            <div class="h6">
                                <template v-if="entity.masterImage">
                                    {{ entity.masterImage.name }}
                                </template>
                                <template v-else>
                                    <FMasterImage :entity-id="entity.masterImageId">
                                        <template #default="{ data }">
                                            <template v-if="data">
                                                {{ data.name }}
                                            </template>
                                        </template>
                                        <template #error>
                                            {{ entity.masterImageId }}
                                        </template>
                                    </FMasterImage>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="card-grey card grow">
                    <div class="card-header">
                        <span class="title">Realm</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <VCIcon
                                name="fa6-solid:building-columns"
                                class="text-4xl"
                            />
                        </div>
                        <div class="h6">
                            <ARealm :entity-id="entity.realmId">
                                <template #default="scope">
                                    <template v-if="scope?.data">
                                        <FDisplayName
                                            :name="scope.data.name"
                                            :display-name="scope.data.displayName"
                                        />
                                    </template>
                                </template>
                                <template #error>
                                    {{ entity.realmId }}
                                </template>
                            </ARealm>
                        </div>
                    </div>
                </div>

                <div class="card-grey card grow">
                    <div class="card-header">
                        <span class="title">Creator</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-1">
                            <VCIcon
                                name="fa6-solid:user"
                                class="text-4xl"
                            />
                        </div>
                        <div class="h6">
                            <FProjectCreator :entity="entity" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <FProjectNodes
            :header-search="false"
            :query="projectNodeQuery"
        >
            <template #body="{ data }">
                <div class="flex flex-row gap-3 w-full">
                    <template
                        v-for="item in data"
                        :key="item.id"
                    >
                        <div class="card card-grey grow">
                            <div class="card-header">
                                <span class="title">{{ item.node.name }}</span>
                            </div>
                            <div class="card-body">
                                <div>
                                    <strong>Status</strong> <FProjectNodeApprovalStatus :status="item.approvalStatus ?? undefined" />
                                </div>
                                <div>
                                    <strong>Updated</strong> <VCTimeago :datetime="item.updatedAt" />
                                </div>
                                <template v-if="item.node">
                                    <div>
                                        <strong>Type</strong> {{ item.node.type }}
                                    </div>
                                </template>
                                <div>
                                    <strong>Comment</strong><br> {{ item.comment || 'No comment' }}
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </FProjectNodes>
    </div>
</template>
<style>
.widget-content {
    padding: 1rem;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.widget-content .widget-content-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    position: relative;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}

.widget-content .widget-content-left {
    align-items: center;
    display: flex;
}

.widget-content .widget-content-left .widget-heading {
    opacity: .8;
    font-weight: 700;
    text-align: left;
}

.widget-content .widget-content-left .widget-subheading {
    opacity: .5;
}

.widget-content .widget-content-right {
    margin-left: auto;
}

.widget-content .widget-numbers {
    font-weight: 700;
    font-size: 1.8rem;
    display: block;
}
</style>

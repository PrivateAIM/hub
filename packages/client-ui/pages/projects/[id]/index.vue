<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Project, ProjectNode } from '@privateaim/core-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import { FProjectNodeApprovalStatus, FProjectNodes } from '@privateaim/client-vue';
import { defineNuxtComponent } from '#app';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';

export default defineNuxtComponent({
    components: { FProjectNodeApprovalStatus, FProjectNodes },
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
        const projectNodeQuery : BuildInput<ProjectNode> = {
            filter: {
                project_id: props.entity.id,
            },
            sort: {
                node: {
                    name: 'ASC',
                },
            },
        };

        return {
            projectNodeQuery,
        };
    },
});
</script>
<template>
    <div v-if="entity">
        <div class="mb-2">
            <h6><i class="fa-solid fa-info" /> Info</h6>
            <div class="d-flex flex-row gap-3 w-100">
                <div class="card-grey card flex-grow-1">
                    <div class="card-header">
                        <span class="title">Analyses</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-microscope fa-4x" />
                        </div>
                        <div class="h6">
                            {{ entity.analyses }}
                        </div>
                    </div>
                </div>

                <template v-if="entity.master_image_id">
                    <div class="card-grey card flex-grow-1">
                        <div class="card-header">
                            <span class="title">MasterImage</span>
                        </div>
                        <div class="card-body text-center">
                            <div class="mb-2">
                                <i class="fa fa-compact-disc fa-4x" />
                            </div>
                            <div class="h6">
                                {{ entity.master_image ? entity.master_image.name : entity.master_image_id }}
                            </div>
                        </div>
                    </div>
                </template>

                <div class="card-grey card flex-grow-1">
                    <div class="card-header">
                        <span class="title">Realm</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <i class="fas fa-university fa-4x" />
                        </div>
                        <div class="h6">
                            {{ entity.realm_id }}
                        </div>
                    </div>
                </div>

                <div class="card-grey card flex-grow-1">
                    <div class="card-header">
                        <span class="title">Creator</span>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-1">
                            <i class="fa fa-user fa-4x" />
                        </div>
                        <div class="h6">
                            {{ entity.user_id }}
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
                <div class="d-flex flex-row gap-3 w-100">
                    <template
                        v-for="item in data"
                        :key="item.id"
                    >
                        <div class="card card-grey flex-grow-1">
                            <div class="card-header">
                                <span class="title">{{ item.node.name }}</span>
                            </div>
                            <div class="card-body">
                                <div>
                                    <strong>Status</strong> <FProjectNodeApprovalStatus :status="item.approval_status" />
                                </div>
                                <div>
                                    <strong>Updated</strong> <VCTimeago :datetime="item.updated_at" />
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

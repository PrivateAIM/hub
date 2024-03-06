<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Project, ProjectNode } from '@privateaim/core';
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
        <div class="row">
            <div class="col">
                <h6><i class="fa-solid fa-info" /> Info</h6>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>Analyses</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-bar-chart fa-4x" />
                                </div>
                                <p class="badge bg-dark">
                                    {{ entity.analyses }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>MasterImage</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-compact-disc fa-4x" />
                                </div>
                                <p class="badge bg-dark">
                                    {{ entity.master_image ? entity.master_image.name : entity.master_image_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>Realm</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fas fa-university fa-4x" />
                                </div>
                                <p class="badge bg-dark">
                                    {{ entity.realm_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card-grey card mt-2">
                            <div class="card-header">
                                <h5>User</h5>
                            </div>
                            <div class="card-body text-center">
                                <div class="mb-1">
                                    <i class="fa fa-user fa-4x" />
                                </div>
                                <p class="badge bg-dark">
                                    {{ entity.user_id }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <FProjectNodes
                    :header-search="false"
                    :query="projectNodeQuery"
                >
                    <template #body="{ data }">
                        <div class="list">
                            <template
                                v-for="item in data"
                                :key="item.id"
                            >
                                <div
                                    class="list-item card mb-2"
                                >
                                    <div class="card-header">
                                        <h5>{{ item.node.name }}</h5>
                                    </div>
                                    <div class="card-body">
                                        <strong>Status</strong> <FProjectNodeApprovalStatus :status="item.approval_status" />
                                        <br>
                                        <strong>Comment</strong><br> {{ item.comment || 'No comment' }}
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </FProjectNodes>
            </div>
        </div>
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

<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { FEvents, FMasterImageCard } from '@privateaim/client-vue';
import FMasterImages from '@privateaim/client-vue/components/master-image/FMasterImages';
import { APagination, ASearch, ATitle } from '@authup/client-web-kit';
import FMasterImageCommand from '@privateaim/client-vue/components/master-image/FMasterImageCommand';
import { useToast } from '../../../../composables/toast';

export default {
    components: {
        FMasterImageCommand,
        FMasterImageCard,
        ATitle,
        APagination,
        ASearch,
        FMasterImages,
        FEvents,
    },
    setup() {
        const toast = useToast();

        const tabs = [
            {
                name: 'overview',
                path: '',
                icon: 'fa fa-bars',
            },
        ];

        const handleFailed = (e: Error) => {
            toast.show({ body: e.message, variant: 'warning' }, {
                pos: 'top-center',
            });
        };

        return {
            handleFailed,
            tabs,
        };
    },
};
</script>
<template>
    <div class="d-flex flex-column gap-3">
        <h1 class="title no-border mb-0">
            <i class="fa-solid fa-atom" /> Master Images <span class="sub-title">Management</span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :items="tabs"
                :prev-link="true"
                :path="'/admin/services/master-images'"
            />
        </div>
        <div>
            <p>
                The master images and groups are extracted from the GitHub repository after
                executing the sync command and are then transferred to the database.
                <br>
                In addition, the master images are built and transferred to all registered registry instances.
            </p>
        </div>
        <div class="row">
            <div class="col-6">
                <div class="d-flex flex-column gap-3">
                    <div>
                        <FMasterImageCommand
                            :command="'sync'"
                            @failed="handleFailed"
                        >
                            <template #default="props">
                                <button
                                    type="button"
                                    class="btn btn-block btn-primary"
                                    @click.prevent="props.execute"
                                >
                                    <span class="me-2">{{ props.commandText }}</span>  <i :class="props.iconClass" />
                                </button>
                            </template>
                        </FMasterImageCommand>
                    </div>
                    <div>
                        <FMasterImages>
                            <template #header="props">
                                <ATitle />
                                <ASearch
                                    :load="props.load"
                                    :busy="props.busy"
                                />
                            </template>
                            <template #footer="props">
                                <APagination
                                    :busy="props.busy"
                                    :meta="props.meta"
                                    :load="props.load"
                                />
                            </template>
                            <template #body="{ data }">
                                <div class="d-flex flex-column mt-2 mb-2 gap-3">
                                    <template
                                        v-for="item in data"
                                        :key="item.id"
                                    >
                                        <FMasterImageCard
                                            :entity="item"
                                        />
                                    </template>
                                </div>
                            </template>
                        </FMasterImages>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <h6><i class="fa-solid fa-bullhorn" /> Events</h6>
                <FEvents
                    :query="{
                        filters: {
                            ref_type: 'masterImage'
                        },
                        sort: {
                            created_at: 'DESC'
                        }
                    }"
                />
            </div>
        </div>
    </div>
</template>

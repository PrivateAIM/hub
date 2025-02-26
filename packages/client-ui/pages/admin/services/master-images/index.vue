<!--
  - Copyright (c) 2022-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { FMasterImageEventLogs, MasterImagesSync } from '@privateaim/client-vue';
import { useToast } from '../../../../composables/toast';

export default {
    components: { FMasterImageEventLogs, MasterImagesSync },
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
            <i class="fa-brands fa-docker" /> Master Images <span class="sub-title">Management</span>
        </h1>
        <div class="panel-card">
            <div class="panel-card-body">
                <div class="flex-wrap flex-row d-flex">
                    <DomainEntityNav
                        :items="tabs"
                        :prev-link="true"
                        :path="'/admin/services/master-images'"
                    />
                </div>
            </div>
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
                <MasterImagesSync @failed="handleFailed" />
            </div>
            <div class="col-6">
                <FMasterImageEventLogs />
            </div>
        </div>
    </div>
</template>

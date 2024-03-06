<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import {
    Analysis, AnalysisFile, AnalysisFileType, buildAnalysisFileBucketName,
} from '@privateaim/core';
import {
    hasOwnProperty,
} from '@privateaim/core';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, ref, toRefs, watch,
} from 'vue';
import type { BuildInput } from 'rapiq';
import { injectCoreAPIClient, injectStorageAPIClient, wrapFnWithBusyState } from '../../core';
import TrainFileNode from './FAnalysisFile.vue';
import TrainFileList from './FAnalysisFiles';
import TrainFormFile from './FAnalysisFormFile.vue';
import TrainImageCommand from '../analysis/FAnalysisImageCommand';

export default defineComponent({
    components: {
        TrainFileList,
        TrainImageCommand,
        TrainFormFile,
        TrainFileNode,
    },
    props: {
        entity: {
            type: Object as PropType<Analysis>,
            required: true,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed', 'setEntrypointFile'],
    setup(props, { emit }) {
        const coreClient = injectCoreAPIClient();
        const storageClient = injectStorageAPIClient();

        const refs = toRefs(props);

        const form = reactive({
            path: '',
            files: [],
        });

        const selected = ref([]);
        const selectAll = ref(false);
        const directoryMode = ref(true);
        const busy = ref(false);

        const paths = computed(() => form.path.split('/').filter((el) => el !== ''));

        const updatedAt = computed(() => (refs.entity.value ?
            refs.entity.value.updated_at :
            undefined));

        const fileListNode = ref<null | typeof TrainFileList>(null);
        const fileListQuery = computed<BuildInput<AnalysisFile>>(() => ({
            filters: {
                train_id: refs.entity.value.id,
            },
        }));

        const handleCreated = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleCreated(entity);
            }

            emit('created', entity);
        };
        const handleDeleted = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleDeleted(entity);
            }

            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: AnalysisFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleUpdated(entity);
            }

            emit('updated', entity);
        };

        const upload = wrapFnWithBusyState(busy, async () => {
            if (form.files.length === 0) return;

            try {
                const formData = new FormData();
                formData.set('train_id', refs.entity.value.id);

                for (let i = 0; i < form.files.length; i++) {
                    formData.append(`files[${i}]`, form.files[i]);
                }

                form.files = [];

                // todo: replace this with reference
                const {
                    data: bucketFiles
                } = await storageClient.bucket.upload(buildAnalysisFileBucketName(AnalysisFileType.CODE, props.entity.id), formData);
                for(let i=0; i<bucketFiles.length; i++) {
                    const file = await coreClient.analysisFile.create({
                        type: AnalysisFileType.CODE,
                        bucket_file_id: bucketFiles[i].id,
                        analysis_id: props.entity.id
                    });

                    handleCreated(file);
                }

                emit('uploaded');
            } catch (e) {
                emit('failed', e);
            }
        });

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
                    const file = await coreClient.analysisFile.delete(selected.value[i]);
                    handleDeleted(file);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const selectAllFiles = () => {
            if (selectAll.value) {
                if (fileListNode.value) {
                    selected.value = (fileListNode.value.data as unknown as AnalysisFile[])
                        .map((file) => file.id);
                }
            } else {
                selected.value = [];
            }
        };

        const toggleFile = (file: AnalysisFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);
            }
        };

        const filesNode = ref<null | string>(null);

        const checkFormFiles = ($event: any) => {
            $event.preventDefault();

            for (let i = 0; i < $event.target.files.length; i++) {
                form.files.push($event.target.files[i]);
            }

            if (filesNode.value) {
                filesNode.value = '';
            }
        };

        const dropFormFile = ($event: any) => {
            const index = form.files.findIndex((file) => {
                if (
                    hasOwnProperty(file, 'webkitRelativePath') &&
                    hasOwnProperty($event, 'webkitRelativePath')
                ) {
                    return file.webkitRelativePath === $event.webkitRelativePath;
                }
                return file.name === $event.name;
            });

            if (index !== -1) {
                form.files.splice(index, 1);
            }
        };

        const changeEntryPointFile = (file: AnalysisFile) => {
            // todo: submit to api update ( root: true/false )
            // todo: set old analysis root file to false.

            emit('setEntrypointFile', file);
        };

        return {
            directoryMode,
            busy,
            checkFormFiles,
            paths,
            form,

            selected,
            selectAll,
            dropSelected,
            selectAllFiles,

            dropFormFile,

            upload,

            handleCreated,
            handleDeleted,
            handleUpdated,

            toggleFile,
            changeEntryPointFile,

            filesNode,
            fileListNode,
            fileListQuery,
        };
    },
});
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <h6><i class="fa fa-upload" /> Upload</h6>
                <div class="form-group">
                    <label class="form-label">{{ directoryMode ? 'Directories' : 'Files' }}</label>
                    <input
                        id="files"
                        ref="filesNode"
                        type="file"
                        :webkitdirectory="directoryMode"
                        class="form-control"
                        multiple
                        :disbaled="busy"
                        @change="checkFormFiles"
                    >
                </div>
                <div class="form-group">
                    <div class="form-check form-switch">
                        <input
                            id="train-file-manager-switch"
                            v-model="directoryMode"
                            class="form-check-input"
                            type="checkbox"
                        >
                        <label
                            class="form-check-label"
                            for="train-file-manager-switch"
                        >Directory Mode</label>
                    </div>
                </div>

                <hr>

                <div class="d-flex flex-row">
                    <div>
                        <h6 class="title text-muted">
                            Files
                            <span style="font-size: 0.65rem">
                                <span class="text-info">
                                    <i class="fa fa-memory" /> in Memory
                                </span>
                            </span>
                        </h6>
                    </div>
                    <div class="ms-auto">
                        <h6 class="title text-muted">
                            Path:
                            <span class="sub-title">
                                <template
                                    v-for="(path, key) in paths"
                                    :key="key"
                                >
                                    {{ path }} <span class="text-dark">/</span>
                                </template>
                                <template v-if="paths.length === 0">
                                    [root]
                                </template>
                            </span>
                        </h6>
                    </div>
                </div>

                <div
                    v-if="form.files.length === 0"
                    class="alert alert-info alert-sm m-t-10"
                >
                    You have not selected any files to upload...
                </div>

                <div class="d-flex flex-column">
                    <template
                        v-for="(file,key) in form.files"
                        :key="key"
                    >
                        <train-form-file
                            class="me-1"
                            :file="file"
                            @drop="dropFormFile"
                        />
                    </template>
                </div>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="busy || form.files.length === 0"
                        @click.prevent="upload"
                    >
                        Upload
                    </button>
                </div>
            </div>
            <div class="col">
                <h6><i class="fa fa-bars" /> Manage</h6>

                <span>Entrypoint Command</span>
                <br>
                <train-image-command
                    class="mt-2 mb-2"
                    :master-image-id="entity.master_image_id"
                    :analysis-id="entity.id"
                />

                <hr>

                <h6 class="title text-muted">
                    Files
                    <span style="font-size: 0.65rem">
                        <span class="text-success">
                            <i class="fa fa-file" /> uploaded
                        </span>
                    </span>
                </h6>

                <div
                    class="form-check"
                >
                    <input
                        id="selectAllFiles"
                        v-model="selectAll"
                        type="checkbox"
                        class="form-check-input"
                        @change="selectAllFiles"
                    >
                    <label for="selectAllFiles">Select all</label>
                </div>

                <TrainFileList
                    ref="fileListNode"
                    :query="fileListQuery"
                    :header-search="false"
                    :header-title="false"
                    :footer-pagination="false"
                    @created="handleCreated"
                    @updated="handleUpdated"
                    @deleted="handleDeleted"
                >
                    <template #body="props">
                        <div class="d-flex flex-column">
                            <template
                                v-for="file in props.data"
                                :key="file.id"
                            >
                                <TrainFileNode
                                    class="me-1"
                                    :entity="file"
                                    :files-selected="selected"
                                    @check="toggleFile"
                                    @updated="props.updated"
                                    @deleted="props.deleted"
                                    @toggle="changeEntryPointFile"
                                />
                            </template>
                        </div>
                    </template>
                </TrainFileList>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-warning btn-xs"
                        :disabled="busy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AnalysisBucketType, DomainType } from '@privateaim/core-kit';
import type { Analysis, AnalysisBucketFile, MasterImage } from '@privateaim/core-kit/src';
import {
    type PropType, computed, defineComponent, watch,
} from 'vue';
import { useUpdatedAt } from '../../composables';
import { createEntityManager, defineEntityManagerEvents } from '../../core';
import ImageCommand from '../image/ImageCommand.vue';

export default defineComponent({
    components: { ImageCommand },
    props: {
        entityId: {
            type: String as PropType<string | null>,
        },
        entity: {
            type: Object as PropType<Analysis | null>,
        },
        analysisFileId: {
            type: String as PropType<string | null>,
        },
        analysisFile: {
            type: Object as PropType<AnalysisBucketFile | null>,
        },
        masterImageId: {
            type: String as PropType<string | null>,
        },
        masterImage: {
            type: Object as PropType<MasterImage | null>,
        },
    },
    emits: {
        ...defineEntityManagerEvents<Analysis>(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        analysisBucketFileResolved: (_entity: AnalysisBucketFile | null) => true,
    },
    setup(props, setup) {
        const masterImageManager = createEntityManager({
            type: DomainType.MASTER_IMAGE,
            props: {
                entityId: props.masterImageId,
                entity: props.masterImage,
            },
        });

        const analysisBucketFileManager = createEntityManager({
            type: DomainType.ANALYSIS_BUCKET_FILE,
            props: {
                entityId: props.analysisFileId,
                entity: props.analysisFile,
            },
            onResolved: (entity) => {
                setup.emit('analysisBucketFileResolved', entity);
            },
        });

        const analysisManager = createEntityManager({
            type: DomainType.ANALYSIS,
            setup,
            props,
            onResolved: (entity) => {
                if (entity) {
                    if (entity.master_image) {
                        masterImageManager.data.value = entity.master_image;
                    } else if (entity.master_image_id) {
                        masterImageManager.resolve({ id: entity.master_image_id });
                    }

                    analysisBucketFileManager.resolve({
                        query: {
                            filters: {
                                analysis_id: entity.id,
                                analysis_bucket: {
                                    type: AnalysisBucketType.CODE,
                                },
                                root: true,
                            },
                            relations: {
                                analysis_bucket: true,
                            },
                        },
                    });
                } else {
                    masterImageManager.data.value = null;
                    analysisBucketFileManager.data.value = null;
                }
            },
        });

        Promise.resolve()
            .then(() => analysisManager.resolve());

        const setAnalysisBucketFile = (entity: AnalysisBucketFile | null) => {
            analysisBucketFileManager.data.value = entity;
        };

        setup.expose({
            setAnalysisBucketFile,
        });

        const entityId = computed(() => {
            if (props.entityId) {
                return props.entityId;
            }

            if (props.entity) {
                return props.entity.id;
            }

            return null;
        });

        watch(entityId, (value, oldValue) => {
            if (value && value !== oldValue) {
                analysisManager.resolve({ reset: true, id: value });
            }
        });

        const updatedAt = useUpdatedAt(props.entity);
        watch(updatedAt, (value, oldValue) => {
            if (!value || !oldValue) {
                return;
            }

            const entity = props.entity as Analysis;
            if (entity.master_image_id) {
                if (entity.master_image) {
                    masterImageManager.data.value = entity.master_image;
                } else if (
                    !masterImageManager.data.value ||
                        masterImageManager.data.value.id !== entity.master_image_id
                ) {
                    masterImageManager.resolve({ id: entity.master_image_id, reset: true });
                }
            } else {
                masterImageManager.data.value = null;
            }
        });

        const command = computed(() => {
            if (masterImageManager.data.value) {
                return masterImageManager.data.value.command;
            }

            return null;
        });

        const commandArguments = computed(() => analysisManager.data.value?.image_command_arguments ??
                masterImageManager.data.value?.command_arguments);

        const file = computed(() => {
            if (analysisBucketFileManager.data.value) {
                return analysisBucketFileManager.data.value.name;
            }

            return null;
        });

        return {
            command,
            commandArguments,
            file,
        };
    },
});
</script>
<template>
    <ImageCommand
        :command="command"
        :command-arguments="commandArguments"
        :file="file"
    />
</template>

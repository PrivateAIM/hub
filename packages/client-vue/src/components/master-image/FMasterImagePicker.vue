<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { MasterImage } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import {
    type PropType, computed, defineComponent, nextTick, reactive, ref, toRef, useTemplateRef, watch,
} from 'vue';
import { IVuelidate } from '@ilingo/vuelidate';
import FMasterImageGroups from '../master-image-group/FMasterImageGroups';
import FMasterImages from './FMasterImages';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

export default defineComponent({
    components: { FMasterImages, FMasterImageGroups, IVuelidate },
    props: {
        entityId: {
            type: String,
        },
        entity: {
            type: Object as PropType<MasterImage>,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        ...defineEntityManagerEvents<MasterImage>(),
        reset: (() => Promise.resolve()),
    },
    setup(props, setup) {
        const entityId = toRef(props, 'entityId');
        const vMasterImages = useTemplateRef<typeof FMasterImages | null>('masterImages');

        const form = reactive({
            group_virtual_path: '',
            master_image_id: '',
        });

        const imageQuery = computed(() => ({
            filters: {
                ...(form.group_virtual_path !== '' ? {
                    group_virtual_path: form.group_virtual_path,
                } : {}),
            },
        }));

        const resolved = ref(false);

        const manager = createEntityManager({
            type: DomainType.MASTER_IMAGE,
            props,
            setup,
            onResolved: (entity) => {
                if (entity) {
                    form.group_virtual_path = entity.group_virtual_path;
                    form.master_image_id = entity.id;
                } else {
                    form.group_virtual_path = '';
                    form.master_image_id = '';
                }

                resolved.value = true;

                setup.emit('resolved', entity);
            },
        });

        if (props.entityId) {
            form.master_image_id = props.entityId;
        }

        if (props.entity) {
            form.master_image_id = props.entity.id;
        }

        Promise.resolve()
            .then(() => manager.resolve());

        const v$ = useVuelidate({
            group_virtual_path: {
                required,
            },
            master_image_id: {
                required,
            },
        }, form, {
            $scope: false,
        });

        const isVirtualGroupPathDefined = computed(() => !!form.group_virtual_path &&
            form.group_virtual_path.length > 0);

        watch(entityId, (val, oldValue) => {
            if (
                val &&
                val !== oldValue &&
                manager.data.value?.id !== val
            ) {
                manager.resolveByRest({ id: val, reset: true });
            }
        });

        watch(imageQuery, (val, oldValue) => {
            if (val && val !== oldValue) {
                nextTick(async () => {
                    if (vMasterImages.value) {
                        await vMasterImages.value.load();
                    }
                });
            }
        });

        const selectGroup = (input: string | null) => {
            if (!input) {
                form.master_image_id = '';
                form.group_virtual_path = '';
                return;
            }
            form.group_virtual_path = input;

            form.master_image_id = '';
        };

        const selectImage = (id: string | null) => {
            manager.data.value = null;

            manager.resolveByRest({ reset: true, id });
        };

        return {
            isVirtualGroupPathDefined,

            imageQuery,

            selectImage,
            selectGroup,

            v$,

            busy: manager.busy,
            data: manager.data,

            resolved,
        };
    },
});
</script>
<template>
    <div class="row">
        <div class="col">
            <FMasterImageGroups>
                <template #default=" { data }">
                    <IVuelidate :validation="v$.group_virtual_path">
                        <template #default="props">
                            <VCFormGroup
                                :validation-messages="props.data"
                                :validation-severity="props.severity"
                            >
                                <template #label>
                                    Group
                                    <template v-if="isVirtualGroupPathDefined">
                                        <i class="fa fa-check text-success" />
                                    </template>
                                </template>
                                <template #default>
                                    <VCFormSelect
                                        v-model="v$.group_virtual_path.$model"
                                        :options="data.map((el) => {
                                            return {
                                                id: el.virtual_path,
                                                value: el.virtual_path
                                            }
                                        })"
                                        :disabled="readonly || busy"

                                        @update:model-value="selectGroup"
                                    />
                                </template>
                            </VCFormGroup>
                        </template>
                    </IVuelidate>
                </template>
            </FMasterImageGroups>
        </div>
        <div class="col">
            <FMasterImages
                v-if="isVirtualGroupPathDefined"
                ref="masterImages"
                :query="imageQuery"
            >
                <template #default="{ data }">
                    <IVuelidate :validation="v$.master_image_id">
                        <template #default="props">
                            <VCFormGroup
                                :validation-messages="props.data"
                                :validation-severity="props.severity"
                            >
                                <template #label>
                                    Image
                                    <template v-if="v$.master_image_id.$model">
                                        <i class="fa fa-check text-success" />
                                    </template>
                                </template>
                                <template #default>
                                    <VCFormSelect
                                        v-model="v$.master_image_id.$model"
                                        :options="data.map((el) => {
                                            return {
                                                id: el.id,
                                                value: el.name,
                                                disabled: el.build_status !== 'executed',
                                            }
                                        })"
                                        :disabled="readonly || busy"
                                        @update:model-value="selectImage"
                                    />
                                </template>
                            </VCFormGroup>
                        </template>
                    </IVuelidate>
                </template>
            </FMasterImages>
        </div>
    </div>
</template>

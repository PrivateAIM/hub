/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType, VNodeChild } from 'vue';
import {
    computed,
    defineComponent,
    h,
    ref,
    toRef,
    watch,
} from 'vue';
import {
    hasNormalizedSlot,
    injectCoreHTTPClient,
    normalizeSlot,
    wrapFnWithBusyState,
} from '../../core';

export default defineComponent({
    props: {
        entityId: {
            type: String,
            required: true,
        },
        entityName: {
            type: String as PropType<string | null | undefined>,
            default: undefined,
        },
        entityDisplayName: {
            type: String as PropType<string | null | undefined>,
            default: undefined,
        },
        editable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['updated', 'failed'],
    setup(props, { emit, slots }) {
        const apiClient = injectCoreHTTPClient();
        const busy = ref(false);
        const displayName = ref('');

        if (props.entityDisplayName) {
            displayName.value = props.entityDisplayName;
        }

        const propDisplayName = toRef(props, 'entityDisplayName');
        watch(propDisplayName, (val) => {
            displayName.value = val || '';
        });

        const editing = ref(false);

        // Prefer the human-readable display_name, fall back to the URL-friendly
        // name (slug). The opaque id is intentionally never shown.
        const nameDisplay = computed(() => {
            if (displayName.value) {
                return displayName.value;
            }

            return props.entityName || '';
        });

        const toggle = () => {
            editing.value = !editing.value;
        };

        const save = wrapFnWithBusyState(busy, async () => {
            try {
                const train = await apiClient.analysis.update(props.entityId, { display_name: displayName.value });

                emit('updated', train);

                editing.value = false;
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        return () => {
            if (editing.value) {
                return h('div', { class: 'input-group' }, [
                    h('input', {
                        value: displayName.value,
                        onInput($event: any) {
                            $event.preventDefault();
                            displayName.value = $event.target.value;
                        },
                        disabled: busy.value,
                        class: 'form-control',
                        placeholder: '...',
                    }),
                    h('button', {
                        class: 'btn btn-xs btn-primary',
                        onClick($event: any) {
                            $event.preventDefault();

                            return save();
                        },
                    }, [
                        h('i', { class: 'fa fa-save' }),
                    ]),
                ]);
            }

            let text : VNodeChild;

            if (hasNormalizedSlot('default', slots)) {
                text = normalizeSlot('default', {
                    entityId: props.entityId,
                    entityName: props.entityName,
                    entityDisplayName: props.entityDisplayName,
                    nameDisplay: nameDisplay.value,
                }, slots);
            } else {
                text = nameDisplay.value;
            }

            return h('span', [
                text,
                ...(!editing.value && props.editable ? [
                    h('a', {
                        class: 'ms-1',
                        // eslint-disable-next-line no-script-url
                        href: 'javascript:void(0)',
                        disabled: busy.value,
                        onClick($event: any) {
                            $event.preventDefault();
                            return toggle();
                        },
                    }, [
                        h('i', { class: 'fa fa-pencil-alt' }),
                    ]),
                ] : []),
            ]);
        };
    },
});

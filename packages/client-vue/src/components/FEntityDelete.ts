/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TranslatorTranslationDefaultKey, TranslatorTranslationGroup, useTranslation } from '@authup/client-web-kit';
import type { EntityAPISlim } from '@authup/core-http-kit';
import type { DomainType } from '@privateaim/core-kit';
import type {
    Component,
    PropType,
    VNodeArrayChildren,
    VNodeProps,
} from 'vue';
import {
    defineComponent, getCurrentInstance, h, mergeProps, ref, resolveDynamicComponent,
} from 'vue';
import type { DomainAPISlim } from '@privateaim/core-http-kit';
import { injectCoreHTTPClient, injectStorageHTTPClient, injectTelemetryHTTPClient } from '../core';
import { ElementType } from './constants';

export default defineComponent({
    name: 'FEntityDelete',
    props: {
        service: {
            type: String as PropType<'core' | 'storage' | 'telemetry'>,
            default: 'core',
        },
        elementIcon: {
            type: String,
            default: 'fa-solid fa-trash',
        },
        withText: {
            type: Boolean,
            default: true,
        },
        elementType: {
            type: String as PropType<`${ElementType}`>,
            default: `${ElementType.BUTTON}`,
        },

        entityId: {
            type: String,
            required: true,
        },
        entityType: {
            type: String as PropType<`${DomainType}`>,
            required: true,
        },

        hint: {
            type: String,
            default: undefined,
        },
        locale: {
            type: String,
            default: undefined,
        },
    },
    emits: ['deleted', 'failed'],
    setup(props, ctx) {
        const coreClient = injectCoreHTTPClient();
        const telemetryClient = injectTelemetryHTTPClient();
        const storageClient = injectStorageHTTPClient();

        const instance = getCurrentInstance();
        const busy = ref(false);

        const submit = async () => {
            if (busy.value) return;

            let domainAPI : DomainAPISlim<any> | undefined;
            switch (props.service) {
                case 'core': {
                    domainAPI = (coreClient as Record<string, any>)[props.entityType] as EntityAPISlim<any> | undefined;
                    break;
                }
                case 'storage': {
                    domainAPI = (storageClient as Record<string, any>)[props.entityType] as EntityAPISlim<any> | undefined;
                    break;
                }
                case 'telemetry': {
                    domainAPI = (telemetryClient as Record<string, any>)[props.entityType] as EntityAPISlim<any> | undefined;
                    break;
                }
            }

            if (!domainAPI) {
                return;
            }

            if (typeof domainAPI.delete !== 'function') {
                return;
            }

            busy.value = true;

            try {
                const response = await domainAPI.delete(props.entityId);
                response.id = props.entityId;
                ctx.emit('deleted', response);
            } catch (e) {
                ctx.emit('failed', e);
            }

            busy.value = false;
        };

        const translation = useTranslation({
            group: TranslatorTranslationGroup.DEFAULT,
            key: TranslatorTranslationDefaultKey.DELETE,
        });

        const render = () => {
            let tag : Component | string = 'button';
            const data : VNodeProps = {};

            switch (props.elementType) {
                case ElementType.LINK:
                    tag = 'a';
                    break;
                case ElementType.DROP_DOWN_ITEM:
                    if (
                        instance &&
                        typeof instance.appContext.app.component('BDropdownItem') !== 'undefined'
                    ) {
                        tag = resolveDynamicComponent('BDropdownItem') as Component;
                    }
                    break;
            }

            let icon : VNodeArrayChildren = [];
            if (props.elementIcon) {
                icon = [
                    h('i', {
                        class: [props.elementIcon, {
                            'pe-1': props.withText,
                        }],
                    }),
                ];
            }

            let text : VNodeArrayChildren = [];
            if (props.withText) {
                text = [
                    translation.value,
                ];
            }

            return h(
                tag as string,
                mergeProps({
                    disabled: busy.value,
                    onClick($event: any) {
                        $event.preventDefault();

                        return submit.apply(null);
                    },
                }, data),
                [
                    icon,
                    text,
                ],
            );
        };

        return () => render();
    },
});

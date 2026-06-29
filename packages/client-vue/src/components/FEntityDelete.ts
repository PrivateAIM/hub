/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useTranslation } from '@authup/client-web-kit';
import { TranslatorTranslationActionKey, TranslatorTranslationNamespace } from '@authup/i18n';
import { VCButton } from '@vuecs/button';
import type { ButtonColor, ButtonSize, ButtonVariant } from '@vuecs/button';
import { VCIcon } from '@vuecs/icon';
import type { DomainType as CoreDomainType } from '@privateaim/core-kit';
import type { DomainType as StorageDomainType } from '@privateaim/storage-kit';
import type { DomainType as TelemetryDomainType } from '@privateaim/telemetry-kit';
import type {
    Component,
    PropType,
    VNodeArrayChildren,
} from 'vue';
import {
    defineComponent,
    getCurrentInstance,
    h,
    ref,
    resolveDynamicComponent,
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
            default: 'fa6-solid:trash',
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
            // Accept core / storage / telemetry domain types — the `service`
            // prop selects which API client resolves it.
            type: String as PropType<`${CoreDomainType}` | `${StorageDomainType}` | `${TelemetryDomainType}`>,
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

        // Button styling (BUTTON elementType). Baked into the rendered
        // <VCButton> so call sites no longer pass the retired `.btn*`
        // compat classes.
        size: {
            type: String as PropType<ButtonSize>,
            default: 'sm' satisfies ButtonSize,
        },
        color: {
            type: String as PropType<ButtonColor>,
            default: 'error' satisfies ButtonColor,
        },
        variant: {
            // Danger-outline by default — mirrors authup's <AEntityDelete>
            // and the adjacent outline "details" action buttons (the VCButton
            // default is solid, which renders a filled-red button that clashes).
            type: String as PropType<ButtonVariant>,
            default: 'outline' satisfies ButtonVariant,
        },
        disabled: {
            type: Boolean,
            default: false,
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
                    domainAPI = (coreClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
                    break;
                }
                case 'storage': {
                    domainAPI = (storageClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
                    break;
                }
                case 'telemetry': {
                    domainAPI = (telemetryClient as Record<string, any>)[props.entityType] as DomainAPISlim<any> | undefined;
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
            namespace: TranslatorTranslationNamespace.ACTION,
            key: TranslatorTranslationActionKey.DELETE,
        });

        const render = () => {
            const onClick = ($event: any) => {
                $event.preventDefault();

                return submit.apply(null);
            };

            // Default (button) path — mirrors authup's <AEntityDelete>: a
            // self-styled <VCButton> with the icon via `iconLeft` (leading
            // span) and text via `label`, so hub + authup delete buttons
            // render identically.
            if (props.elementType === ElementType.BUTTON) {
                return h(VCButton, {
                    color: props.color,
                    variant: props.variant,
                    size: props.size,
                    iconLeft: props.elementIcon || undefined,
                    label: props.withText ? translation.value : undefined,
                    disabled: busy.value || props.disabled,
                    onClick,
                });
            }

            // Link / dropdown-item paths keep the bare element — their call
            // sites style them as nav/dropdown entries, not buttons.
            let tag : Component | string = 'a';
            if (props.elementType === ElementType.DROP_DOWN_ITEM) {
                if (
                    instance &&
                    typeof instance.appContext.app.component('VCDropdownMenuItem') !== 'undefined'
                ) {
                    tag = resolveDynamicComponent('VCDropdownMenuItem') as Component;
                }
            }

            let icon : VNodeArrayChildren = [];
            if (props.elementIcon) {
                icon = [
                    h(VCIcon, {
                        name: props.elementIcon,
                        class: props.withText ? 'pe-1' : undefined,
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
                {
                    disabled: busy.value || props.disabled,
                    onClick,
                },
                [
                    icon,
                    text,
                ],
            );
        };

        return () => render();
    },
});

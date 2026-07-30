/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { isSocketManagerUsable } from '../../../src/core/socket';
import { mountClientVueComponent } from '../../utils';

// `installSocketManager` became OPT-IN behind the `realtime` install option.
// That is a production behaviour change: any consumer not passing
// `realtime: true` silently loses realtime, with no error to notice. These
// specs pin both sides of the gate so the regression cannot be silent.

function probeSocketManager(realtime?: boolean) {
    let usable: boolean | undefined;

    const component = defineComponent({
        setup() {
            usable = isSocketManagerUsable();
            return () => h('div');
        },
    });

    mountClientVueComponent(component, {}, {}, { realtime });

    return usable;
}

describe('realtime install gate', () => {
    it('should NOT provide a socket manager by default', () => {
        expect(probeSocketManager()).toBe(false);
    });

    it('should NOT provide a socket manager when realtime is false', () => {
        expect(probeSocketManager(false)).toBe(false);
    });

    it('should provide a socket manager when realtime is true', () => {
        expect(probeSocketManager(true)).toBe(true);
    });
});

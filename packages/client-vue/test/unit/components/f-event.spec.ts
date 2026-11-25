/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import { describe, expect, it } from 'vitest';
import FEvent from '../../../src/components/event/FEvent';
import { mountClientVueComponent } from '../../utils';

function createEvent(data: Record<string, any>) : Event {
    return {
        id: 'e1',
        refType: 'masterImage',
        refId: null,
        scope: 'builder',
        name: 'executionFailed',
        data,
        createdAt: new Date().toISOString(),
    } as Event;
}

describe('FEvent', () => {
    it('should show the failure reason a worker event carries', () => {
        const { wrapper } = mountClientVueComponent(FEvent, { entity: createEvent({ error: 'Step 4/7 exited with 1' }) });

        expect(wrapper.find('[data-event-error]').text()).toBe('Step 4/7 exited with 1');
    });

    it('should render no error line without a reason', () => {
        const { wrapper } = mountClientVueComponent(FEvent, { entity: createEvent({}) });

        expect(wrapper.find('[data-event-error]').exists()).toBe(false);
    });
});

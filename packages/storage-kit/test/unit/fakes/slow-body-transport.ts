/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITransport, TransportRequest } from 'hapic';

/**
 * Answers at once, but delivers the JSON body only after `delay` ms. Like
 * fetch, it errors the body with the signal's reason when the request's
 * signal aborts, which is how hapic's timeout reaches a body being read.
 */
export class SlowBodyTransport implements ITransport {
    protected delay : number;

    protected body : unknown;

    constructor(delay: number, body: unknown = { data: [], meta: { total: 0 } }) {
        this.delay = delay;
        this.body = body;
    }

    async dispatch(request: TransportRequest): Promise<Response> {
        const { signal } = request;
        const { delay } = this;
        const payload = new TextEncoder().encode(JSON.stringify(this.body));

        const stream = new ReadableStream<Uint8Array>({
            start(controller) {
                const timer = setTimeout(() => {
                    controller.enqueue(payload);
                    controller.close();
                }, delay);

                signal?.addEventListener('abort', () => {
                    clearTimeout(timer);
                    controller.error(signal.reason);
                }, { once: true });
            },
        });

        return new Response(stream, {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }
}

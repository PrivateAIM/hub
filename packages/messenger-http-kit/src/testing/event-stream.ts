/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * An open `text/event-stream` response a `FakeClient` handler returns, fed by
 * the test: `write()` raw SSE text (any chunking), `close()` to end it.
 *
 * ```typescript
 * const stream = new FakeEventStream();
 * const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });
 *
 * stream.write('event: messagePending\ndata: {"recipient":{"type":"client","id":"c1"}}\n\n');
 * ```
 *
 * A response body is read once, so serve one `FakeEventStream` per request.
 */
export class FakeEventStream {
    readonly response : Response;

    protected controller : ReadableStreamDefaultController<Uint8Array> | undefined;

    protected encoder : TextEncoder;

    protected closed : boolean;

    protected _cancelled : boolean;

    constructor() {
        this.encoder = new TextEncoder();
        this.closed = false;
        this._cancelled = false;

        const body = new ReadableStream<Uint8Array>({
            start: (controller) => {
                this.controller = controller;
            },
            cancel: () => {
                this._cancelled = true;
            },
        });

        this.response = new Response(body, {
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
        });
    }

    /**
     * Whether the consumer cancelled the body (a `break`, an abort or a
     * timeout). Writes after that are dropped.
     */
    get cancelled() : boolean {
        return this._cancelled;
    }

    write(chunk: string) : void {
        if (this.closed || this._cancelled || !this.controller) {
            return;
        }

        this.controller.enqueue(this.encoder.encode(chunk));
    }

    close() : void {
        if (this.closed || this._cancelled || !this.controller) {
            return;
        }

        this.closed = true;
        this.controller.close();
    }
}

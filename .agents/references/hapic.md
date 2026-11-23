# hapic Reference

[hapic](https://github.com/tada5hi/hapic) (`hapic`, `@hapic/oauth2`, `@hapic/victorialogs`, `@hapic/harbor`) is the HTTP client under every hub kit and outbound call. Behaviour that differs from what the API suggests:

| hapic | Hub counterpart | Trap |
|---|---|---|
| `Client({ timeout })` | `HTTPClientTimeout` (server-kit), `httpTimeout` (client-vue) | The timer also covers reading the body. Streams and uploads pass `timeout: 0` per call; a caller's `timeout` in `APIRequestOptions` wins. |
| `MemoryTransport` | every kit's `./testing` `FakeClient` | Ignores `request.signal`: an abort or timeout spec needs `SlowBodyTransport` (core-http-kit / storage-kit test fakes) or messenger's `bindResponseSignal`. |
| `Client.post(path, URLSearchParams)` | `exchangeAuthupToken` | Sets the form content-type itself and keeps a sub-path of `baseURL`; `new URL(path, base)` drops it unless `base` ends with `/`. |
| `TokenGrantParameters` (@hapic/oauth2) | `exchangeAuthupToken` | Has no RFC 8693 token-exchange grant, so the exchange posts through a plain `Client`. |
| `querier.query({ timeout })` (@hapic/victorialogs) | `VictoriaLogsLogStore` | Server-side query bound (string, `20s`), separate from the client timeout; without it VictoriaLogs keeps running an abandoned query. |

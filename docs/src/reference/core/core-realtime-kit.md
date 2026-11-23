# @privateaim/core-realtime-kit

WebSocket event types and utilities for real-time client-server communication in PrivateAIM.

## Installation

```bash
npm install @privateaim/core-realtime-kit @privateaim/core-kit @privateaim/kit
```

## Usage

```typescript
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { buildDomainNamespaceName } from '@privateaim/core-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';

const socket: Socket<STCEvents, CTSEvents> = io(`http://localhost:4000${buildDomainNamespaceName(realmId)}`, {
    auth: { token: accessToken },
});

socket.emit('projectSubscribe', projectId, (error) => {
    if (error) {
        console.error(error.message);
    }
});

socket.on('projectUpdated', ({ data, meta }) => {
    console.log(meta.event, meta.refId, data.name);
});
```

Room and namespace names come from `@privateaim/core-kit` (`buildDomainChannelName`, `buildDomainNamespaceName`); this package holds only the event maps and guards.

## API

### Exports

| Module | Description |
|--------|-------------|
| `constants` | `STCEventName` / `CTSEventName`: user and robot connection event names |
| `types` | Event maps `STCEvents` (server to client), `CTSEvents` (client to server), `STSEvents` (server to server), plus `STCEventRecord`, `CTSEventHandler`, `EventTarget`, `EventCallback` |
| `utils` | Type guards `isEventCallback(input, fnArgs?)` and `isEventTarget(input)` |

## Dependencies

- `@privateaim/kit`: Core utilities (peer)
- `@privateaim/core-kit`: Domain types (peer)

# Node Management

Nodes represent compute resources (typically at hospitals or research institutions) that participate in federated analyses. Administrators register and manage nodes through the Hub.

## Registration

Nodes are registered in the Hub with:
- A unique name and identifier
- A public key for secure communication
- Realm assignment (organizational scope)
- Registry project association (for receiving analysis containers)

## Node Lifecycle

1. **Register** — administrator creates the node entry in Hub
2. **Configure** — node operator sets up credentials and connectivity
3. **Assign to projects** — nodes are added to projects via `ProjectNode` associations
4. **Execute analyses** — the worker distributes analysis containers to assigned nodes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/nodes` | List all nodes |
| `GET` | `/nodes/:id` | Get node details |
| `POST` | `/nodes` | Register a new node |
| `PUT` | `/nodes/:id` | Update node |
| `DELETE` | `/nodes/:id` | Remove node |

## Credential Management

Each node has an `account_secret` field that is not returned by default in API responses. To retrieve it, the requesting user must have the appropriate permission and explicitly request the field:

```
GET /nodes/:id?fields=+account_secret
```

This field-level access control is enforced by the Node service's permission checker.

## Related

- [Realms](/guide/user/realms) — nodes are scoped to realms
- [Approval Workflows](/guide/user/approval) — how nodes participate in approved projects

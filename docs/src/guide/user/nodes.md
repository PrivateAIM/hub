# Node Management

Nodes represent compute resources (typically at hospitals or research institutions) that participate in federated analyses. Administrators register and manage nodes through the Hub.

## Registration

Nodes are registered in the Hub with:
- A unique name and identifier
- A public key for secure communication
- Realm assignment (organizational scope)
- Registry project association (for receiving analysis containers)

Creating a node connects it to a registry automatically — the oldest configured
one — and provisions its registry project and robot account. A node is therefore
never left unable to push or pull images. The assignment is changed afterwards on
the node's Registry tab; the create form carries no registry field.

## Node Lifecycle

1. **Register** — administrator creates the node entry in Hub
2. **Configure** — node operator sets up credentials and connectivity
3. **Assign to projects** — nodes are added to projects via `ProjectNode` associations
4. **Execute analyses** — the worker distributes analysis containers to assigned nodes

## Registry Connection

A node pushes and pulls analysis images through its own **registry project** — a
dedicated project in the docker registry with its own robot account. This is
assigned on creation and managed afterwards on the node's **Registry** tab
(`/admin/nodes/:id/registry`):

- **Connect** — pick a registry and connect. Hub provisions a registry project
  and robot account for the node and links them in the registry.
- **Switch** — pick a different registry while connected. Hub provisions a new
  registry project there and removes the old one together with its robot
  account, in a single update — going through Disconnect first is neither
  needed nor desirable.
- **Disconnect** — clears the node's registry assignment and removes its
  registry project together with the robot account. The node itself is kept;
  reconnecting provisions a **new** project, so the node has to pull fresh
  credentials.

The tab also shows the node's current registry credentials (host, project,
account name and secret) and a secondary link/unlink action that repairs the
registry-side state of an already-provisioned project without changing the
node's assignment.

Deleting a registry or a registry project never deletes the nodes referencing
it — those nodes are simply left unassigned and can be reconnected.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/nodes` | List all nodes |
| `GET` | `/nodes/:id` | Get node details |
| `POST` | `/nodes` | Register a new node |
| `PUT` | `/nodes/:id` | Update node |
| `DELETE` | `/nodes/:id` | Remove node |

## Credential Management

Each node has an `accountSecret` field that is not returned by default in API responses. To retrieve it, the requesting user must have the appropriate permission and explicitly request the field:

```
GET /nodes/:id?fields=+accountSecret
```

This field-level access control is enforced by the Node service's permission checker.

The node's **registry** credentials (host, project, robot account name and
secret) are read from the Registry tab. Three callers may read them:

- the node's own client, for its own credentials;
- a **node administrator of the node's realm** (`node_update`) — that permission
  already governs the whole lifecycle of the registry project, since connecting
  provisions it and reconnecting rotates the robot account;
- a registry administrator (`registry_manage`).

Master-realm membership alone grants nothing — it is not a permission.

## Related

- [Realms](/guide/user/realms) — nodes are scoped to realms
- [Approval Workflows](/guide/user/approval) — how nodes participate in approved projects

# Realms

Realms are organizational containers in PrivateAIM Hub that group identity providers, robots, users, roles, and nodes. They are managed through Authup and enforced across all Hub services.

## Overview

![Realms overview](/images/hub_realms.png)

Each realm is an isolated organizational unit. Resources created within a realm (projects, analyses, nodes) are scoped to that realm unless accessed by a **master realm** administrator.

- The **master realm** has global access — its members can manage all resources across realms
- Non-master realm users can only access resources within their own realm

## Managing Realms

### Creating a Realm

![Add realm](/images/hub_realms_add.png)

### Realm Details

![Realm details](/images/hub_realms_details.png)

## Realm Scoping

All realm-scoped entities carry a `realm_id` column. Access is enforced by the `isRealmResourceWritable()` helper in every entity service:

```
Master realm member  →  can read/write all resources
Other realm member   →  can only read/write own realm's resources
```

This applies to all CRUD operations — creating, reading, updating, and deleting entities.

## Users

![Users overview](/images/hub_user.png)

Users are human accounts within a realm. Administrators can manage users, assign roles, and view details.

![User details](/images/hub_user_details.png)

![User roles](/images/hub_user_roles.png)

![Add user](/images/hub_user_add.png)

## Robots

Robots are API pseudo-users for automation. They belong to a realm and are assigned roles and permissions just like human users.

![Robots overview](/images/hub_robots.png)

Use robots for:
- Automated pipelines that interact with the Hub API
- Service-to-service communication
- CI/CD integrations

![Robot details](/images/hub_robots_details.png)

![Robot roles](/images/hub_robots_roles.png)

![Robot permissions](/images/hub_robots_permissions.png)

![Add robot](/images/hub_robots_add.png)

## Roles & Permissions

Hub uses role-based access control (RBAC) via Authup:
- **Roles** group related permissions and are assigned to users or robots within a realm
- **Permissions** are pre-defined actions (e.g., `node_create`, `analysis_update`) checked at the service layer
- Two-phase permission model: `preCheck` (fast fail) then `check` (with policy attributes)

![Permissions](/images/permissions.png)

## Identity Providers

Each realm can configure OIDC identity providers for federated authentication. Users authenticate through their realm's identity provider, and Authup maps the external identity to a Hub user.

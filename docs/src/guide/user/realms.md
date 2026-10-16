# Realms

Realms are organizational containers in FLAME Hub that group identity providers, robots, users, roles, and nodes. They are managed through Authup and enforced across all Hub services.

## Overview

![Realms overview](/images/hub_realms.png)

Each realm is an isolated organizational unit. Resources created within a realm (projects, analyses, nodes) are scoped to that realm. Which realms a user or client reaches is decided per permission by the grant's **realm scope**, not by the realm they belong to — the master realm is not special.

## Managing Realms

### Creating a Realm

![Add realm](/images/hub_realms_add.png)

### Realm Details

![Realm details](/images/hub_realms_details.png)

## Realm Scoping

All realm-scoped entities carry a `realmId` property (the `realm_id` column). Every permission a role or client holds is granted with a `realm_scope`, and that scope decides which records the permission reaches:

```
any        →  every realm, and records without a realm
ownOrNull  →  the holder's own realm, and records without a realm
own        →  the holder's own realm
none       →  no realm
```

The built-in `admin` role and the `system` client hold their permissions at `any`. A record out of reach answers 403 on a write; reads only return what is in reach. Analyses add participation on top: the realms of an analysis' nodes reach it too (see [Analyses](analyses.md)).

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
- Two-phase permission model: `preEvaluate` (fast fail) then `evaluate` (with policy attributes)

![Permissions](/images/permissions.png)

## Identity Providers

Each realm can configure OIDC identity providers for federated authentication. Users authenticate through their realm's identity provider, and Authup maps the external identity to a Hub user.

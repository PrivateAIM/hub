# Project & Analysis Approval

Hub supports administrator approval workflows for projects and analyses. These ensure that federated computations are reviewed before execution.

## Project Approval

Projects represent collaborative research efforts. When a user creates a project:

1. The project enters a **pending** state
2. An administrator reviews the project details (description, risk assessment, data requirements, selected nodes)
3. The administrator **approves** or **rejects** the project
4. Only approved projects can have analyses created

![Project approval](/images/hub_proposal_approve.png)

## Analysis Approval

Analyses are distributed computations within a project. Every node an analysis runs on decides for itself whether the analysis may run there. A node approves the **built image**, not just the code:

1. The analysis owner locks the configuration and builds the image. The build does **not** wait for approvals.
2. Once the build has finished, each node's operators review the image (hash, size, OS) together with the code and **approve** or **reject** it. Approving before the build has finished is refused.
3. Distribution starts only after **every** node has approved. Aggregator nodes are approved automatically.

Starting a new build resets every node's approval (and rejection), because the new image needs a fresh decision. Unlocking the configuration resets them as well.

![Analysis review](/images/hub_analysis_review.png)

## Analysis Execution Flow

An analysis goes through:

1. **Configure** — storage buckets are provisioned, configuration is locked
2. **Build** — the worker builds a Docker image from the analysis code and master image
3. **Approve** — every node approves the built image
4. **Distribute** — the container image is pushed to target node registries
5. **Execute** — nodes pull and run the container against their local data
6. **Complete** — results are collected and stored

## Skipping Approval (Development)

For development and testing, approval workflows can be disabled via environment variables on the [Core API](/reference/core/):

```bash
SKIP_PROJECT_APPROVAL=true
SKIP_ANALYSIS_APPROVAL=true
```

::: warning
Never disable approval workflows in production environments.
:::

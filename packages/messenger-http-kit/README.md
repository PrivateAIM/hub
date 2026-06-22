# @privateaim/messenger-http-kit 📨

HTTP client (Hapic) for the PrivateAIM messenger broker — durable analysis-to-analysis messaging.

It wraps the broker REST API (send / pull / ack + participant discovery) using the contract types from
[`@privateaim/messenger-kit`](../messenger-kit). The FLAME node broker consumes this client to talk to the Hub.

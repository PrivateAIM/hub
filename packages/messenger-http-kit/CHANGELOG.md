# Changelog

## [0.12.1](https://github.com/PrivateAIM/hub/compare/v0.12.0...v0.12.1) (2026-07-02)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.6 to ^0.12.0
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.6 to ^0.12.0

## [0.12.0](https://github.com/PrivateAIM/hub/compare/v0.11.5...v0.12.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* **client-ui:** the Bootstrap-compat CSS classes (.btn*, .alert*, .row/.col, .navbar*, .badge, .is-valid, .form-group, .form-switch, .text-*/.bg-* aliases, .dropdown*) are removed; use the @vuecs components / Tailwind utilities instead.

### Features

* **client-ui:** modernize @vuecs/@authup/hapic stack & retire Bootstrap-compat layer ([#1726](https://github.com/PrivateAIM/hub/issues/1726)) ([dc47bf7](https://github.com/PrivateAIM/hub/commit/dc47bf79ad0abac55191c33297f1539d52527188))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.5 to ^0.11.6
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.5 to ^0.11.6

## [0.11.5](https://github.com/PrivateAIM/hub/compare/v0.11.4...v0.11.5) (2026-06-24)


### Features

* message broker rewrite — Phase 0 (contracts, client, crypto) ([#1711](https://github.com/PrivateAIM/hub/issues/1711)) ([adce056](https://github.com/PrivateAIM/hub/commit/adce0564b3cf2fc236be0649920ab3779c11396c))
* message broker rewrite — Phase 1 (durable mailbox + REST API) ([#1715](https://github.com/PrivateAIM/hub/issues/1715)) ([dda1103](https://github.com/PrivateAIM/hub/commit/dda1103e52734cd0a03b4b32940e4c8ae2484565))
* message broker rewrite (push wakeup + long-poll) ([#1717](https://github.com/PrivateAIM/hub/issues/1717)) ([ca809d9](https://github.com/PrivateAIM/hub/commit/ca809d91ba77851271dcff640ca2abf34a49bee0))


### Bug Fixes

* ship dist directory in published kit packages ([#1719](https://github.com/PrivateAIM/hub/issues/1719)) ([576dcc4](https://github.com/PrivateAIM/hub/commit/576dcc481e9677c0b33fbbf148ce2b1d1c3300c1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @privateaim/messenger-kit bumped from ^0.11.4 to ^0.11.5
  * peerDependencies
    * @privateaim/messenger-kit bumped from ^0.11.4 to ^0.11.5

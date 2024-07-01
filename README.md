# Flame HUB 🔥

[![main](https://github.com/PrivateAim/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAim/hub/actions/workflows/main.yml)
[![CodeQL](https://github.com/PrivateAim/hub/actions/workflows/codeql.yml/badge.svg)](https://github.com/PrivateAim/hub/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/PrivateAim/hub/badge.svg)](https://snyk.io/test/github/PrivateAim/hub)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This repository contains the HUB ecosystem of FLAME.

> 🚧 **Work in Progress**
>
> The HUB ecosystem is currently under active development and is not yet ready for production.


**Table of Contents**

- [Packages](#packages)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Packages

The repository contains the following packages:

| Name                                                                | Type            | Description                                                                                           |
|---------------------------------------------------------------------|-----------------|-------------------------------------------------------------------------------------------------------|
| [client-ui](packages/client-ui)                                     | App             | This package contains the web app.                                                                    |
| [client-vue](packages/client-vue)                                   | Library         | This package contains components, helpers, ... for the web app.                                       |
| [core-http-kit](packages/core-http-kit)                             | Library         | This package contains the http API Client for the core service.                                       |
| [core-kit](packages/core-kit)                                       | Library         | This package contains interfaces/types, ... for the core service.                                     |
| [core-realtime-kit](packages/core-realtime-kit)                     | Library         | This package contains interfaces/types, ... for the core realtime service.                            |
| [kit](packages/kit)                                                 | Library         | This package contains helpers/utilities for the whole ecosystem.                                      |
| [messenger-kit](packages/messenger-kit)                             | Library         | This package contains helpers/utilities for the messenger service.                                    |
| [server-analysis-manager](packages/server-analysis-manager)         | Service         | This package contains the analysis manager, which is responsible to build and distribute an analysis. |
| [server-analysis-manager-kit](packages/server-analysis-manager-kit) | Library         | This package contains helpers/utilities for the analysis-manager service.                             |
| [server-core](packages/server-core)                                 | Service         | This package contains the core service.                                                               |
| [server-core-realtime](packages/server-core-realtime)               | Library/Service | This package contains the core realtime service.                                                      |
| [server-http-kit](packages/server-http-kit)                         | Library         | This package contains helpers/utilities for all http services.                                        |
| [server-kit](packages/server-kit)                                   | Library         | This package contains helpers/utilities for all services.                                             |
| [server-messenger](packages/server-realtime-kit)                    | Service         | This package contains the messenger service.                                                          |
| [server-realtime-kit](packages/server-realtime-kit)                 | Library         | This package contains helpers/utilities for all socket services.                                      |
| [server-storage](packages/server-storage)                           | Service         | This package contains the storage service.                                                            |
| [storage-kit](packages/storage-kit)                                 | Library         | This package contains interfaces/types, helpers/utilities, ... for the storage service.               |

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](./CONTRIBUTING.md) and the [code of conduct](./CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## Credits
If you have any questions, feel free to contact the author & creator [Peter Placzek](https://github.com/tada5hi)  of the project.
The project was initial developed during this bachelor thesis.

## License

Made with 💚

Published under [Apache 2.0](./LICENSE).

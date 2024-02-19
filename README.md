# Flame HUB 🔥
This repository contains the HUB Ecosystem of FLAME.

> [!WARNING]  
> The repository is in an early stage and is not yet functional.

[![main](https://github.com/PrivateAim/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAim/hub/actions/workflows/main.yml)
[![CodeQL](https://github.com/PrivateAim/hub/actions/workflows/codeql.yml/badge.svg)](https://github.com/PrivateAim/hub/actions/workflows/codeql.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/PrivateAim/hub/badge.svg)](https://snyk.io/test/github/PrivateAim/hub)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

**Table of Contents**

- [Packages](#packages)
- [Usage](#usage)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)

## Packages

The repository contains the following packages:

**`General`**
- **@privateaim/core** 🧱: This package contains common constants, functions, types, ...

**`Client`**
- **@privateaim/client-ui** 🧸: This package contains the User Interface.
- **@privateaim/client-vue** 🧩: This package contains vue components for frontend applications.

**`Server`**
- **@privateaim/server-kit** 🧱: This package contains common constants, functions, types, ... for the server side.
- **@privateaim/server-core** 🌴: This package contains aggregators, components and many more.
- **@privateaim/server-realtime** 🚄: This package contains the realtime application which connects the API with socket based clients.
- **@privateaim/server-analysis-manager** 🏭: This package contains the analysis manager, which is responsible to build and distribute an analysis.

## Usage

### Development

**1. Installation & Build**

Download the source code.

```shell
$ git clone https://github.com/PrivateAim/hub
$ cd hub
```

In addition, `Node.js` must be installed on the host machine, to start packages and to install required dependencies.
To install the dependencies, run:

```shell
$ npm i
```

To build all packages, run:

```shell
$ npm run build
```

**2. Configuration**

Read the `README.md` in each package directory. Each package must be configured individually.

**3. Execution**

Start the applications/services in a single terminal window (or as background process) with the following command:
```shell
$ npm run server-core
```

```shell
$ npm run client-ui
```

```shell
$ npm run server-realtime
```

```shell
$ npm run server-analysis-manager
```

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

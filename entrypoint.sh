#!/bin/bash

#
# Copyright (c) 2021-2021.
# Author Peter Placzek (tada5hi)
# For the full copyright and license information,
# view the LICENSE file that was distributed with this source code.
#

set -e

BASE_DIR=/usr/src/project

cd "${BASE_DIR}"

case "${1}" in
    core) PACKAGE=core;;
    ui) PACKAGE=ui;;
    realtime) PACKAGE=realtime;;
    analysis-manager) PACKAGE=analysis-manager;;
    storage) PACKAGE=storage;;
    cli) PACKAGE=cli;;
    *) echo "Unknown package: ${1}";;
esac

shift

if [[ -z "${PACKAGE}" ]]; then
    printf 'Usage:\n'
    printf '  core <command>\n    Start or run the core service in dev mode.\n'
    printf '  ui <command>\n    Start or run the ui in dev mode.\n'
    printf '  realtime <command>\n    Start or run the realtime service in dev mode.\n'
    printf '  analysis-manager <command>\n    Start or run the analysis-manager service in dev mode.\n'
    printf '  cli <command>\n    Run a CLI command.\n'
    exit 0
fi

case "${PACKAGE}" in
    core)
        exec npm run "$1" --workspace=packages/server-core
        ;;
    ui)
        export NUXT_HOST=0.0.0.0
        export NUXT_PORT=3000
        exec npm run "$1" --workspace=packages/client-ui
        ;;
    realtime)
        exec npm run "$1" --workspace=packages/server-realtime
        ;;
    analysis-manager)
        exec npm run "$1" --workspace=packages/server-analysis-manager
        ;;
    storage)
        exec npm run "$1" --workspace=packages/server-storage
        ;;
    cli)
        exec npm run cli --workspace=packages/server-core -- "$@"
        ;;
esac



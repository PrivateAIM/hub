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
    messenger) PACKAGE=messenger;;
    analysis-manager) PACKAGE=analysis-manager;;
    storage) PACKAGE=storage;;
    telemetry) PACKAGE=telemetry;;
    *) echo "Unknown package: ${1}";;
esac

shift

if [[ -z "${PACKAGE}" ]]; then
    printf 'Usage:\n'
    printf '  core <command>\n    Execute a core service command.\n'
    printf '  ui <command>\n    Execute a ui app command.\n'
    printf '  messenger <command>\n    Execute a messenger service command.\n'
    printf '  storage <command>\n    Execute a storage service command.\n'
    printf '  analysis-manager <command>\n    Execute a core worker service command.\n'
    printf '  telemetry <command>\n    Execute a telemetry service command.\n'
    exit 1
fi

COMMAND=${1}
shift

if [[ -z "${COMMAND}" ]]; then
    printf "A ${PACKAGE} command must be specified.\n"
    exit 1
fi

case "${PACKAGE}" in
    core)
        exec npm run "${COMMAND}" --workspace=packages/server-core -- "${@}"
        ;;
    ui)
        export NUXT_HOST=0.0.0.0
        export NUXT_PORT=3000
        exec npm run "${COMMAND}" --workspace=packages/client-ui -- "${@}"
        ;;
    messenger)
        exec npm run "${COMMAND}" --workspace=packages/server-messenger -- "${@}"
        ;;
    analysis-manager)
        exec npm run "${COMMAND}" --workspace=packages/server-analysis-manager -- "${@}"
        ;;
    storage)
        exec npm run "${COMMAND}" --workspace=packages/server-storage -- "${@}"
        ;;
    telemetry)
        exec npm run "${COMMAND}" --workspace=packages/server-telemetry -- "${@}"
        ;;
esac



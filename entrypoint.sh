#!/bin/bash

#
# Copyright (c) 2021-today.
# Author Peter Placzek (tada5hi)
# For the full copyright and license information,
# view the LICENSE file that was distributed with this source code.
#

set -e

BASE_DIR=/usr/src/project

cd "${BASE_DIR}"

# The image HEALTHCHECK runs `entrypoint.sh healthcheck`. A service answers
# `HEALTHCHECK_PATH` (default `/livez`: a database outage must not make
# Swarm or autoheal restart the container); the ui has no probe routes and
# keeps `/`. The started service is recorded below, since the check runs
# as its own process.
SERVICE_FILE=/tmp/.hub-service

if [ "${1}" = "healthcheck" ]; then
    HEALTH_PATH="${HEALTHCHECK_PATH:-/livez}"
    HEALTH_PATH="/${HEALTH_PATH#/}"
    HEALTH_PORT="${PORT:-3000}"

    if [ "$(cat "${SERVICE_FILE}" 2>/dev/null)" = "ui" ]; then
        HEALTH_PATH=/
        HEALTH_PORT=3000
    fi

    exec wget --proxy off --no-verbose --tries=1 --spider "http://127.0.0.1:${HEALTH_PORT}${HEALTH_PATH}"
fi

case "${1}" in
    core) PACKAGE=core;;
    core-worker) PACKAGE=core-worker;;
    ui) PACKAGE=ui;;
    messenger) PACKAGE=messenger;;
    storage) PACKAGE=storage;;
    telemetry) PACKAGE=telemetry;;
    *) echo "Unknown package: ${1}";;
esac

shift

if [[ -z "${PACKAGE}" ]]; then
    printf 'Usage:\n'
    printf '  core <command>\n    Execute a core service command.\n'
    printf '  core-worker <command>\n    Execute a core worker service command.\n'
    printf '  ui <command>\n    Execute a ui app command.\n'
    printf '  messenger <command>\n    Execute a messenger service command.\n'
    printf '  storage <command>\n    Execute a storage service command.\n'
    printf '  telemetry <command>\n    Execute a telemetry service command.\n'
    exit 1
fi

COMMAND=${1}
shift

if [[ -z "${COMMAND}" ]]; then
    printf "A ${PACKAGE} command must be specified.\n"
    exit 1
fi

# Best effort: a read-only root filesystem must not stop the start.
{ echo "${PACKAGE}" > "${SERVICE_FILE}"; } 2>/dev/null || true

case "${PACKAGE}" in
    core)
        exec npm run "${COMMAND}" --workspace=apps/server-core -- "${@}"
        ;;
    core-worker)
        exec npm run "${COMMAND}" --workspace=apps/server-core-worker -- "${@}"
        ;;
    ui)
        export NUXT_HOST=0.0.0.0
        export NUXT_PORT=3000
        exec npm run "${COMMAND}" --workspace=apps/client-ui -- "${@}"
        ;;
    messenger)
        exec npm run "${COMMAND}" --workspace=apps/server-messenger -- "${@}"
        ;;
    storage)
        exec npm run "${COMMAND}" --workspace=apps/server-storage -- "${@}"
        ;;
    telemetry)
        exec npm run "${COMMAND}" --workspace=apps/server-telemetry -- "${@}"
        ;;
esac



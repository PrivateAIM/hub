FROM node:24-alpine

RUN mkdir -p /usr/src/project

WORKDIR /usr/src/project/

COPY . .

# `better-sqlite3` (a devDependency of the four database services, needed for the
# sqlite test leg) ships no prebuilt binary for musl, so `npm ci` falls back to
# `node-gyp rebuild` — which needs a Python + C++ toolchain that the alpine image
# does not carry. Installed as a virtual package and removed inside the same
# layer, so the toolchain never reaches the published image.
RUN rm -rf ./node-modules && \
    apk add --no-cache --virtual .build-deps python3 make g++ && \
    npm ci && \
    npm run build && \
    apk del .build-deps && \
    touch apps/server-core/.env && \
    touch apps/server-core-worker/.env && \
    touch apps/server-messenger/.env && \
    touch apps/server-storage/.env && \
    touch apps/server-telemetry/.env && \
    touch apps/client-ui/.env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD wget --proxy off --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["core", "cli", "start"]

FROM node:22-alpine

RUN mkdir -p /usr/src/project

WORKDIR /usr/src/project/

COPY . .

RUN rm -rf ./node-modules && \
    npm ci && \
    npm run build && \
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

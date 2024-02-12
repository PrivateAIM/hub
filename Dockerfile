FROM node:18-alpine

RUN mkdir -p /usr/src/project

WORKDIR /usr/src/project/

COPY . .

RUN rm -rf ./node-modules && \
    npm ci && \
    npm run build && \
    touch packages/server-core/.env && \
    touch packages/server-realtime/.env && \
    touch packages/server-analysis-manager/.env && \
    touch packages/client-ui/.env

COPY ./entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["cli", "start"]

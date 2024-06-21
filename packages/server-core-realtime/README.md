# HUB - Realtime 🚄

This repository contains the Realtime Application of the HUB Ecosystem of FLAME.
It communicates with some services of FLAME and need therefore to be configured properly, like described
in the following sections.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=<development|production>

API_URL=http://localhost:<port>/
AUTHUP_URL=http://localhost:<port>/

REDIS_CONNECTION_STRING=redis://<username>:<password>@<host>
RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
VAULT_CONNECTION_STRING=<token>@<url>/v1/
```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.

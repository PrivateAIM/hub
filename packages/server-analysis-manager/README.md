# Hub - Analysis Manager 🏭

[![npm version](https://badge.fury.io/js/@privateaim%2Fanalysis.svg)](https://badge.fury.io/js/@privateaim%2Fserver-analysis)

This repository contains the analysis manager of FLAME.
It communicates with some services of FLAME and need therefore to be configured properly, like described 
in the following sections.

## Configuration
The following settings need to be added to the environment file `.env` in the root directory.
```
PORT=<port>
NODE_ENV=development

RABBITMQ_CONNECTION_STRING=amqp://<username>:<password>@<host>
REDIS_CONNECTION_STRING=redis://<username>:<password>@<host>
VAULT_CONNECTION_STRING=<token>@<url>/v1/
```

## Credits
If you have any questions, feel free to contact the author [Peter Placzek](https://github.com/Tada5hi) of the project.
The project was initially developed during his bachelor thesis, and he worked after that as employee
on the project.

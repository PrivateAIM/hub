import {getRepository} from "typeorm";
import {isRealmPermittedForResource} from "../../../../../modules/auth/utils";
import {onlyRealmPermittedQueryResources} from "../../../../../db/utils";
import {TrainFile} from "../../../../../domains/train/file";
import fs from "fs";
import {TrainConfiguratorStateOpen} from "../../../../../domains/train/states";
import {getTrainFileFilePath} from "../../../../../domains/train/file/path";
import {Train} from "../../../../../domains/train";
import {applyRequestFilterOnQuery} from "../../../../../db/utils/filter";

import {Controller, Delete, Get, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from 'typescript-swagger';

import {ForceLoggedInMiddleware} from "../../../../../modules/http/request/middleware/auth";
import {getTrainFileStreamRouteHandler} from "./TrainFileStreamController";
import {uploadTrainFilesRouteHandler} from "./TrainFileUploadController";

type PartialTrainFile = Partial<TrainFile>;
const simpleExample : PartialTrainFile = {
    name: 'model.py',
    directory: '/',
    train_id: 'xxx'
}

@SwaggerTags('pht')
@Controller("/trains")
export class TrainFileController {
    @Get("/:id/files",[ForceLoggedInMiddleware])
    @ResponseExample<Array<PartialTrainFile>>([simpleExample])
    async getMany(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Array<PartialTrainFile>> {
        return await getTrainFilesRouteHandler(req, res) as Array<PartialTrainFile>;
    }

    @Get("/:id/files/download",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async download(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<Buffer> {
        return await getTrainFileStreamRouteHandler(req, res) as Buffer;
    }

    @Get("/:id/files/:fileId",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async getOne(
        @Params('id') id: string,
        @Params('fileId') fileId: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainFile|undefined> {
        return await getTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Delete("/:id/files/:fileId",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainFile>(simpleExample)
    async drop(
        @Params('id') id: string,
        @Params('fileId') fileId: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainFile|undefined> {
        return await dropTrainFileRouteHandler(req, res) as PartialTrainFile | undefined;
    }

    @Post("/:id/files",[ForceLoggedInMiddleware])
    @ResponseExample<Array<PartialTrainFile>>([
        simpleExample
    ])
    async add(
        @Params('id') id: string,
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainFile|undefined> {
        return await uploadTrainFilesRouteHandler(req, res) as PartialTrainFile | undefined;
    }
}

export async function getTrainFileRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','train') && !req.ability.can('edit','train')) {
        return res._failForbidden();
    }

    const { fileId } = req.params;

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne({
        id: fileId
    });

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getTrainFilesRouteHandler(req: any, res: any) {
    const { id } = req.params;
    let { filter } = req.query;

    const repository = getRepository(TrainFile);
    const query = repository.createQueryBuilder('trainFile')
        .where("trainFile.train_id = :trainId", {trainId: id});

    onlyRealmPermittedQueryResources(query, req.user.realm_id);

    applyRequestFilterOnQuery(query, filter, {
        id: 'trainFile.id',
        name: 'trainFile.name',
        realmId: 'train.realm_id'
    });

    const entity = await query.getMany();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    return res._respond({data: entity})
}

export async function dropTrainFileRouteHandler(req: any, res: any) {
    let { fileId } = req.params;

    if(typeof fileId !== 'string' || !fileId.length) {
        return res._failNotFound();
    }

    if(!req.ability.can('add', 'train') && !req.ability.can('edit','train')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(TrainFile);

    const entity = await repository.findOne(fileId);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        fs.unlinkSync(getTrainFileFilePath(entity));

        const trainRepository = getRepository(Train);
        await trainRepository.update({id: entity.train_id}, {
            configurator_status: TrainConfiguratorStateOpen,
            hash: null,
            hash_signed: null
        });

        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Die Zug Dateien konnte nicht gelöscht werden...'})
    }
}

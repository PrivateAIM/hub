import {getRepository, In} from "typeorm";
import {Station} from "../../../../domains/pht/station";
import {onlyRealmPermittedQueryResources} from "../../../../db/utils";
import {check, matchedData, validationResult} from "express-validator";
import {isRealmPermittedForResource} from "../../../../modules/auth/utils";
import {Train} from "../../../../domains/pht/train";
import {MasterImage} from "../../../../domains/pht/master-image";
import {Proposal} from "../../../../domains/pht/proposal";
import {isTrainType} from "../../../../domains/pht/train/types";
import {
    TrainConfiguratorStateFinished,
    TrainConfiguratorStateHashGenerated,
    TrainConfiguratorStateHashSigned, TrainStateConfigured
} from "../../../../domains/pht/train/states";
import {TrainFile} from "../../../../domains/pht/train/file";
import {applyRequestPagination} from "../../../../db/utils/pagination";
import {applyRequestFilterOnQuery} from "../../../../db/utils/filter";
import {applyRequestIncludes} from "../../../../db/utils/include";
import {TrainStation} from "../../../../domains/pht/train/station";

export async function getTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train')
        .leftJoinAndSelect('train.train_stations','trainStations')
        .where({
            id
        });

    onlyRealmPermittedQueryResources(query, req.user.realm_id);

    const entity = await query.getOne();

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    return res._respond({data: entity})
}

export async function getTrainsRouteHandler(req: any, res: any) {
    let { filter, page, include } = req.query;

    const repository = getRepository(Train);
    const query = repository.createQueryBuilder('train');

    onlyRealmPermittedQueryResources(query, req.user.realm_id);

    applyRequestIncludes(query, 'train', include, {
        trainStations: 'train_stations',
        result: 'result',
        user: 'user'
    });

    applyRequestFilterOnQuery(query, filter, {
        id: 'train.id',
        name: 'train.name',
        proposalId: 'train.proposal_id',
        realmId: 'train.realm_id'
    });

    const pagination = applyRequestPagination(query, page, 50);

    query.orderBy({
        'train.updated_at': "DESC"
    });

    const [entities, total] = await query.getManyAndCount();

    return res._respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination
            }
        }
    });
}

async function runTrainValidations(req: any) {
    await check('entrypoint_executable')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 1, max: 100})
        .run(req);

    await check('query')
        .exists()
        .notEmpty()
        .optional({nullable: true})
        .isLength({min: 1, max: 4096})
        .run(req);

    await check('entrypoint_file_id')
        .exists()
        .optional()
        .custom(value => {
            return getRepository(TrainFile).findOne(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('The entrypoint file is not valid.');
            }).catch(e => console.log(e));
        })
        .run(req);

    const masterImagePromise = check('master_image_id')
        .exists()
        .isInt()
        .optional()
        .custom(value => {
            return getRepository(MasterImage).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('The master image is not valid.');
            })
        });

    await masterImagePromise.run(req);

    const stationPromise = check('station_ids')
        .isArray()
        .custom((value: any[]) => {
            return getRepository(Station).find({id: In(value)}).then((res) => {
                if(!res || res.length !== value.length) throw new Error('Die angegebenen Krankenhäuser sind nicht gültig');
            })
        })
        .optional();

    await stationPromise.run(req);
}

export async function addTrainRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','train')) {
        return res._failForbidden();
    }

    await check('proposal_id')
        .exists()
        .isInt()
        .custom(value => {
            return getRepository(Proposal).find(value).then((res) => {
                if(typeof res === 'undefined') throw new Error('Der Antrag existiert nicht.');
            })
        })
        .run(req);

    await check('type')
        .exists()
        .notEmpty()
        .isString()
        .custom(value => {
            if(!isTrainType(value)) {
                throw new Error('Der Train Type ist nicht gültig.');
            }

            return true;
        })
        .run(req);

    await runTrainValidations(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    let {station_ids, ...data} = validationData;

    station_ids = station_ids ?? [];

    try {
        const repository = getRepository(Train);

        let entity = repository.create({
            realm_id: req.user.realm_id,
            user_id: req.user.id,
            ...data
        });

        await repository.save(entity);

        const trainStationRepository = getRepository(TrainStation);
        const trainStations : Array<TrainStation> = [];
        station_ids.map((stationID: any) => {
             const trainStation : TrainStation = trainStationRepository.create({
                 train_id: entity.id,
                 station_id: stationID
             });

             trainStations.push(trainStation);
        });

        await trainStationRepository.insert(trainStations);

        return res._respond({data: entity});
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Der Zug konnte nicht erstellt werden...'})
    }
}

export async function editTrainRouteHandler(req: any, res: any) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await runTrainValidations(req);

    await check('hash_signed')
        .exists()
        .notEmpty()
        .isLength({min: 10, max: 8096})
        .optional({nullable: true})
        .run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req);
    if(!data) {
        return res._respondAccepted();
    }

    const repository = getRepository(Train);
    let train = await repository.findOne(id);

    if(typeof train === 'undefined') {
        return res._failValidationError({message: 'Der Zug konnte nicht gefunden werden.'});
    }

    if(!isRealmPermittedForResource(req.user, train)) {
        return res._failForbidden();
    }

    if(typeof data.station_ids !== "undefined") {
        const trainStationRepository = getRepository(TrainStation);

        data.train_stations = data.station_ids.map((stationId: number) => {
            return trainStationRepository.create({
                station_id: stationId,
                train_id: train.id
            });
        })
    }

    train = repository.merge(train, data);

    if(train.hash) {
        train.configurator_status = TrainConfiguratorStateHashGenerated;

        if(train.hash_signed) {
            train.configurator_status = TrainConfiguratorStateHashSigned;
        }
    }

    // check if all conditions are met
    if(train.hash_signed && train.hash) {
        train.configurator_status = TrainConfiguratorStateFinished;
        train.status = TrainStateConfigured;
    }

    try {
        const result = await repository.save(train);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        console.log(e);
        return res._failValidationError({message: 'Der Zug konnte nicht aktualisiert werden.'});
    }
}

export async function dropTrainRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    if(!req.ability.can('drop', 'train')) {
        return res._failUnauthorized();
    }

    const repository = getRepository(Train);

    const entity = await repository.findOne(id);

    if(typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if(!isRealmPermittedForResource(req.user, entity)) {
        return res._failForbidden();
    }

    try {
        await repository.delete(entity.id);

        return res._respondDeleted({data: entity});
    } catch (e) {
        return res._failValidationError({message: 'Der Zug konnte nicht gelöscht werden...'})
    }
}


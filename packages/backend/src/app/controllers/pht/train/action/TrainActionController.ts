import {getRepository, Not} from "typeorm";
import {Train} from "../../../../../domains/pht/train";
import {createTrainBuilderQueueMessage, publishTrainBuilderQueueMessage} from "../../../../../domains/service/train-builder/queue";
import {
    TrainBuildStatus,
    TrainConfigurationStatus,
    TrainRunStatus
} from "../../../../../domains/pht/train/status";
import * as crypto from "crypto";
import {getTrainFileFilePath} from "../../../../../domains/pht/train/file/path";
import * as fs from "fs";
import {check, matchedData, validationResult} from "express-validator";
import {
    createTrainRouterQueueMessageCommand,
    publishTrainRouterQueueMessage
} from "../../../../../domains/service/train-router/queue";
import {TrainResult} from "../../../../../domains/pht/train/result";
import {createResultServiceResultCommand} from "../../../../../domains/service/result-service/queue";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../../config/services/harbor";
import {TrainResultStateFinished, TrainResultStateOpen} from "../../../../../domains/pht/train/result/states";
import {findHarborProjectRepository, HarborRepository} from "../../../../../domains/service/harbor/project/repository/api";
import env from "../../../../../env";
import {TrainStation} from "../../../../../domains/pht/train/station";
import {TrainStationApprovalStatus} from "../../../../../domains/pht/train/station/status";
import {isPermittedForResourceRealm} from "../../../../../domains/auth/realm/db/utils";
import {detectTrainRunStatus} from "./detect-run-status";

/**
 * Execute a train command (start, stop, build).
 *
 * @param req
 * @param res
 */
export async function doTrainTaskRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['start', 'stop', 'build', 'scanHarbor', 'generateHash', 'detectRunStatus'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(Train);

    let entity = await repository.findOne(id, {
        relations: [
            'master_image',
            'entrypoint_file',
            'files'
        ]
    });

    if (typeof entity === 'undefined') {
        return res._failNotFound();
    }

    if (!isPermittedForResourceRealm(req.realmId, entity.realm_id)) {
        return res._failForbidden();
    }

    try {
        switch (validationData.task) {
            case 'detectRunStatus':
                entity = await detectTrainRunStatus(entity);

                return res._respond(entity);
            case "build":
                if (!!entity.run_status) {
                    return res._failBadRequest({message: 'The train can no longer be build...'});
                } else {
                    if(!env.demo) {
                        const trainStationRepository = getRepository(TrainStation);
                        const trainStations = await trainStationRepository.find({
                            train_id: entity.id,
                            approval_status: Not(TrainStationApprovalStatus.APPROVED)
                        });

                        if (trainStations.length > 0) {
                            return res._failBadRequest({message: 'Not all stations have approved your train yet.'})
                        }

                        const queueMessage = await createTrainBuilderQueueMessage('trainBuild', entity);

                        await publishTrainBuilderQueueMessage(queueMessage);
                    }

                    entity = repository.merge(entity, {
                        configurator_status: TrainConfigurationStatus.FINISHED,
                        run_status: env.demo ? TrainRunStatus.FINISHED : null,
                        build_status: env.demo ? null : TrainBuildStatus.STARTING
                    });

                    await repository.save(entity);

                    if(env.demo) {
                        const trainResultRepository = getRepository(TrainResult);
                        // tslint:disable-next-line:no-shadowed-variable
                        const trainResult = trainResultRepository.create({
                            download_id: 'DEMO',
                            train_id: entity.id,
                            status: TrainResultStateFinished
                        });

                        await trainResultRepository.save(trainResult);
                        entity.result = trainResult;
                    }

                    return res._respond({data: entity});
                }
            case "start":
                if (!!entity.run_status) {
                    return res._failBadRequest({message: 'The train has already started...'});
                } else {
                    const queueMessage = await createTrainRouterQueueMessageCommand('startTrain', {trainId: entity.id});

                    await publishTrainRouterQueueMessage(queueMessage);

                    entity = repository.merge(entity, {
                        run_status: TrainRunStatus.STARTING
                    });

                    await repository.save(entity);

                    return res._respond({data: entity});
                }
            case "stop":
                if (entity.run_status === TrainRunStatus.FINISHED) {
                    return res._failBadRequest({message: 'The train has already been terminated...'});
                } else {
                    const queueMessage = await createTrainRouterQueueMessageCommand('stopTrain', {trainId: entity.id});

                    await publishTrainRouterQueueMessage(queueMessage);

                    entity = repository.merge(entity, {
                        run_status: TrainRunStatus.STOPPING
                    });

                    await repository.save(entity);

                    return res._respond({data: entity});
                }
            case "scanHarbor":
                const resultRepository = getRepository(TrainResult);

                const harborRepository: HarborRepository | undefined = await findHarborProjectRepository(HARBOR_OUTGOING_PROJECT_NAME, entity.id);

                if (typeof harborRepository === 'undefined') {
                    return res._failBadRequest({message: 'No Train exists in the terminated train repository.'})
                }

                let result = await resultRepository.findOne({train_id: harborRepository.name});

                let trainResult: undefined | TrainResult;

                if (typeof result === 'undefined') {
                    // create result
                    const dbData = resultRepository.create({
                        image: harborRepository.fullName,
                        train_id: harborRepository.name,
                        status: TrainResultStateOpen
                    });

                    await resultRepository.save(dbData);

                    trainResult = dbData;

                    entity.result = trainResult;
                } else {
                    result = resultRepository.merge(result, {status: TrainResultStateOpen});

                    await resultRepository.save(result);

                    trainResult = result;
                }

                // send queue message
                await createResultServiceResultCommand('download', {
                    projectName: harborRepository.projectName,
                    repositoryName: harborRepository.name,
                    repositoryFullName: harborRepository.fullName,

                    trainId: harborRepository.name,
                    resultId: trainResult.id
                });

                return res._respond({data: trainResult});
            case 'generateHash':
                const hash = crypto.createHash('sha512');
                // User Hash
                hash.update(Buffer.from(entity.user_id.toString(), 'utf-8'));

                for (let i = 0; i < entity.files.length; i++) {
                    const filePath = getTrainFileFilePath(entity.files[i]);

                    const fileContent = fs.readFileSync(filePath);

                    // File Hash
                    hash.update(fileContent);
                }

                // Session Id hash
                const sessionId: Buffer = crypto.randomBytes(64);
                hash.update(sessionId);

                const query: Buffer | undefined = !!entity.query && entity.query !== '' ?
                    Buffer.from(entity.query, 'utf-8') :
                    undefined;

                if (typeof query !== 'undefined') {
                    hash.update(query);
                }

                entity.session_id = sessionId.toString('hex');

                entity.hash = hash.digest('hex');
                entity.configurator_status = TrainConfigurationStatus.HASH_GENERATED;

                try {
                    entity = await repository.save(entity);

                    return res._respond({data: entity});
                } catch (e) {
                    return res._failBadRequest({message: 'The hash could not be generated...'})
                }
        }
    } catch (e) {
        return res._failServerError({message: 'An unknown error occurred. The Task could not be executed...'})
    }
}


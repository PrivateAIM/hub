import {publishMessage} from "amqp-extension";
import {getRepository} from "typeorm";
import {buildTrainRouterQueueMessage, TrainRouterCommand} from "../../../service/train-router";
import {findTrain} from "./utils";
import {Train, TrainRunStatus} from "@personalhealthtrain/ui-common";

export async function startTrain(train: Train | number | string) : Promise<Train> {
    const repository = getRepository(Train);

    train = await findTrain(train, repository);

    if (typeof train === 'undefined') {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train could not be found.');
    }

    if (!!train.run_status) {
        // todo: make it a ClientError.BadRequest
        throw new Error('The train has already been started...');
    } else {
        const queueMessage = await buildTrainRouterQueueMessage(TrainRouterCommand.START, {trainId: train.id});

        await publishMessage(queueMessage);

        train = repository.merge(train, {
            run_status: TrainRunStatus.STARTING
        });

        await repository.save(train);
    }

    return train;
}

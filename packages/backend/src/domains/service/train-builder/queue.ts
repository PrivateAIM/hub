import {Train} from "../../pht/train";
import {createQueueMessageTemplate, publishQueueMessage, QueueMessage} from "../../../modules/message-queue";
import {getRepository} from "typeorm";
import {UserKeyRing} from "../../auth/user/key-ring";
import {TrainFile} from "../../pht/train/file";
import {MQ_TB_ROUTING_KEY} from "../../../config/services/rabbitmq";
import {TrainStation} from "../../pht/train-station";
import {TrainStationApprovalStatus} from "../../pht/train-station/status";

export type TrainBuilderCommand = 'trainBuild';
export async function createTrainBuilderQueueMessage(
    type: TrainBuilderCommand,
    train: Train,
    metaData: Record<string, any> = {}
) : Promise<QueueMessage> {
    const keyRingRepository = getRepository(UserKeyRing);
    const keyRing = await keyRingRepository.findOne({
        user_id: train.user_id
    });

    const filesRepository = getRepository(TrainFile);
    const files : TrainFile[] = await filesRepository
        .createQueryBuilder('file')
        .where('file.train_id = :id', {id: train.id})
        .getMany();

    const trainStationRepository = getRepository(TrainStation);
    const trainStations = await trainStationRepository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .addSelect('station.secure_id')
        .where("trainStation.train_id = :trainId", {trainId: train.id})
        .andWhere("trainStation.status = :status", {status: TrainStationApprovalStatus.APPROVED})
        .getMany();

    return createQueueMessageTemplate(type, {
        userId: train.user_id,
        trainId: train.id,
        proposalId: train.proposal_id,
        stations: trainStations.map(trainStation => trainStation.station.secure_id),
        files: files.map((file: TrainFile) => file.directory + '/' + file.name),
        masterImage: train.master_image.path,
        entrypointExecutable: train.entrypoint_executable,
        entrypointPath: train.entrypoint_file.directory + '/' + train.entrypoint_file.name,
        sessionId: train.session_id,
        hash: train.hash,
        hashSigned: train.hash_signed,
        query: train.query,
        user_he_key: !!keyRing ? keyRing.he_key : null
    }, metaData)
}

export async function publishTrainBuilderQueueMessage(queueMessage: QueueMessage) {
    await publishQueueMessage(MQ_TB_ROUTING_KEY, queueMessage);
}

import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../user";
import {TrainFile} from "../file";

@Entity()
export class TrainModel {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "varchar"})
    type: string;

    @Column({type: "varchar"})
    name: string;

    @OneToOne(() => TrainFile)
    src: TrainFile

    @Column({type: "int", unsigned: true})
    user_id: number;

    @ManyToOne(() => User,{onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;
}

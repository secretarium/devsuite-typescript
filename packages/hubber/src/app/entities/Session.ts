import { Entity, PrimaryKey, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

@Entity({
    collection: 'sessions'
})
export class Session {
    @PrimaryKey() _id!: ObjectId;
    @SerializedPrimaryKey() id!: string;
}

export default Session;
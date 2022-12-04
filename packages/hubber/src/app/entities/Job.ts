import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

type JobType = 'deployment' | '';
type JobStatus = 'idle' | 'running' | 'done'

@Entity({
    collection: 'jobs'
})
export class Job extends BaseEntity {

    constructor(data: Job) {
        super();
        Object.assign(this, data);
    }

    @Property() type!: JobType;
    @Property() status: JobStatus = 'idle';
    @Property() payload!: object;
    @Property() result!: object;
}

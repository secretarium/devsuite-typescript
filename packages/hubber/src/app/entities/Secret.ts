import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({
    collection: 'secrets'
})
export class Secret extends BaseEntity {
    @Property() name!: string;
    @Property() slug!: string;
}

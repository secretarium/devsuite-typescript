import { Entity, Property, Collection, ManyToMany } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity({
    collection: 'organisations'
})
export class Organisation extends BaseEntity {

    @Property() name!: string;
    @Property() slug!: string;
    @ManyToMany(() => User) members = new Collection<User>(this);

}

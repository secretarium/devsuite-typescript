import { Entity, Unique, Property, Collection, ManyToMany } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Organisation } from './Organisation';

@Entity({
    collection: 'users'
})
export class User extends BaseEntity {

    constructor(data: Partial<User>) {
        super();
        Object.assign(this, data);
    }

    @Property() @Unique() name!: string;
    @Property() username!: string;
    @Property() emails!: string[];
    @Property() handle!: string;
    @ManyToMany(() => Organisation) organisations = new Collection<Organisation>(this);
}

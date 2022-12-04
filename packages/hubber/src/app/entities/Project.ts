import { Entity, Property, Collection, ManyToMany } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity({
    collection: 'projects'
})
export class Project extends BaseEntity {

    constructor(data: Project) {
        super();
        Object.assign(this, data);
    }

    @Property() name!: string;
    @Property() slug!: string;
    // @OneToMany(Organisation) organisation!: Organisation;
    @ManyToMany(() => User) members = new Collection<User>(this);
}

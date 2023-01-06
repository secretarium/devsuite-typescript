import { Entity, Unique, Property, Collection, ManyToMany } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';
import { Organisation } from './Organisation';

@Entity({
    collection: 'users'
})
export class User extends BaseEntity {

    constructor(data: User) {
        super();
        Object.assign(this, data);
    }

    @Property() @Unique() login!: string;
    @Property() emails!: string[];
    @Property() devices!: string[];
    @Property() github_tokens!: GitHubToken[];
    @ManyToMany(() => Organisation) organisations = new Collection<Organisation>(this);
}

type GitHubToken = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    token_type: 'bearer';
    scope: string;
}
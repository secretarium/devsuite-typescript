import { Entity, Property } from '@mikro-orm/core';
import { Context } from 'probot';
import { BaseEntity } from './BaseEntity';

type WebhookEvents = Context['name'];
type HookProcessingStatus = 'idle' | 'running' | 'done'
type HookSource = 'github'

@Entity({
    collection: 'hooks'
})
export class Hook extends BaseEntity {

    constructor(data: Omit<Hook, keyof BaseEntity>) {
        super();
        Object.assign(this, data);
    }

    @Property() source!: HookSource;
    @Property() event!: Context<WebhookEvents>['name'];
    @Property() remoteId!: Context<WebhookEvents>['id'];
    @Property() status: HookProcessingStatus = 'idle';
    @Property() payload?: Context<WebhookEvents>['payload'];
}

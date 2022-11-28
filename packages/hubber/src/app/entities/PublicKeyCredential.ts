import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({
    collection: 'public_key_credentials'
})
export class PublicKeyCredential extends BaseEntity {
    @Property() externalId!: string;
    @Property() publicKey!: string;
    @Property() userId!: string;
}

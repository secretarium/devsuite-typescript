import type { User, Organisation } from './client';

import { prisma } from '~/db.server';

export type { Organisation } from './client';

export function getOrganisation({
    id,
    userId
}: Pick<Organisation, 'id'> & {
    userId: User['id'];
}) {
    return prisma.organisation.findFirst({
        where: { id, userId }
    });
}

export function getOrganisationListItems({ userId }: { userId: User['id'] }) {
    return prisma.organisation.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: { updatedAt: 'desc' }
    });
}

export function createOrganisation({
    name
}: Pick<Organisation, 'name'> & {
    userId: User['id'];
}) {
    return prisma.organisation.create({
        data: {
            name,
            slug: name
        }
    });
}

export function deleteOrganisation({
    id,
    userId
}: Pick<Organisation, 'id'> & { userId: User['id'] }) {
    return prisma.organisation.deleteMany({
        where: { id, userId }
    });
}

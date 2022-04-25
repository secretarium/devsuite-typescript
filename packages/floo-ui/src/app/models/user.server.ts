import type { Credential, User } from '~/models/client';
import * as argon2 from 'argon2';

import { prisma } from '~/db.server';

export type { User } from '~/models/client';

export async function getUserById(id: User['id']) {
    return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
    return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User['email'], password: string) {

    const hashedCredential = await argon2.hash(password, {
        type: argon2.argon2id,
        timeCost: 5,
        parallelism: 2,
        saltLength: 32,
        associatedData: Buffer.from('z=0')
    });

    return prisma.user.create({
        data: {
            slug: '',
            email,
            password: {
                create: {
                    hash: hashedCredential
                }
            }
        }
    });
}

export async function deleteUserByEmail(email: User['email']) {
    return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
    email: User['email'],
    password: Credential['hash']
) {
    const userWithCredential = await prisma.user.findUnique({
        where: { email },
        include: {
            password: true
        }
    });

    if (!userWithCredential || !userWithCredential.password) {
        return null;
    }

    const isValid = await argon2.verify(
        userWithCredential.password.hash,
        password
    );

    if (!isValid) {
        return null;
    }

    const { password: __unused__password, ...userWithoutCredential } = userWithCredential;

    return userWithoutCredential;
}

import db, { Prisma } from '../../utils/db';

export const storeHook = async (hook: Prisma.HookCreateInput) => {
    const instance = await db.hook.create({
        data: hook
    });
    return instance;
};

import { Hook, BaseEntityKeys } from '../entities';
import db from '../../utils/db';

export const storeHook = async (hook: Omit<Hook, BaseEntityKeys | 'status'>) => {
    const instance = new Hook(hook as Hook);
    await db.HookCollection.persist(instance).flush();
    return instance;
};

import { User } from '../entities';
import db, { FilterQuery } from '../../utils/db';

export const createUser = async (user: User) => {
    return db.UserCollection.persist(new User(user)).flush();
};

export const getUsers = async (userFilter?: FilterQuery<User>) => {
    if (userFilter)
        return await db.UserCollection.find(userFilter);
    return await db.UserCollection.findAll();
};

import { Project } from '../entities';
import db, { FilterQuery } from '../../utils/db';

export const createProject = async (project: Project) => {
    return db.ProjectCollection.persist(new Project(project)).flush();
};

export const getProjects = async (projectFilter?: FilterQuery<Project>) => {
    if (projectFilter)
        return await db.ProjectCollection.find(projectFilter);
    return await db.ProjectCollection.findAll();
};

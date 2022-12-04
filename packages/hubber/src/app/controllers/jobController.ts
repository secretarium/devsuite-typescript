import { Job } from '../entities';
import db from '../../utils/db';

export const createJob = async (job: Job) => {
    return db.JobCollection.persist(new Job(job)).flush();
};

export const runJob = async (id: Job['id']) => {
    const job = await db.OrganisationCollection.findOne({ id });
    if (!job)
        return null;
    return job;
};

import { Organisation } from '../entities';
import db, { FilterQuery } from '../../utils/db';

export const createOrganisation = async (organisation: Organisation) => {
    return db.OrganisationCollection.persist(new Organisation(organisation)).flush();
};

export const getOrganisations = async (organisationFilter?: FilterQuery<Organisation>) => {
    if (organisationFilter)
        return await db.OrganisationCollection.find(organisationFilter);
    return await db.OrganisationCollection.findAll();
};

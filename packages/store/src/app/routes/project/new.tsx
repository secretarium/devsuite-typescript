
import { FC } from 'react';
import { redirect, ActionFunction } from 'react-router-dom';
import { createProject } from '../../data/projects';

export const action: ActionFunction = async () => {
    const project = await createProject();
    return redirect(`/projects/${project.id}/edit`);
};

export const NewProject: FC = () => {
    return (
        <p id="zero-state">
            This is a demo for Secretarium CC.
            <br />
            Not for use in sales material.
        </p>
    );
};

export default NewProject;
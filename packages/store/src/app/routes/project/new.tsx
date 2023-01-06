
import { FC } from 'react';
import { redirect, ActionFunction } from 'react-router-dom';
import { createProject } from '../../data/projects';

export const action: ActionFunction = async () => {
    const project = await createProject();
    return redirect(`/projects/${project.id}/edit`);
};

export const NewProject: FC = () => {
    return <a href="https://github.com/login/oauth/authorize?state=github%3Ad42&client_id=Iv1.6ff39dee83590f91&redirect_uri=http%3A%2F%2Flocalhost:4220%2Fauth">Connect to GitHub</a>;
};

export default NewProject;
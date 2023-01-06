import { FC } from 'react';
import { Form, LoaderFunction, useLoaderData, useFetcher, ActionFunction } from 'react-router-dom';
import { Project, getProject, updateProject } from '../../data/projects';

export const loader: LoaderFunction = async ({ params }) => {
    const project = await getProject(params['projectId']);
    if (!project) {
        throw new Response('', {
            status: 404,
            statusText: 'Not Found'
        });
    }
    return project;
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();
    return updateProject(params['projectId'], {
        favorite: formData.get('favorite') === 'true'
    });
};

export const ProjectItem: FC = () => {
    const project = useLoaderData() as Project;

    return <div id="project">

        <div>
            <h1>
                {project.name ?? <i>No Name</i>}
                <Favorite project={project} />
            </h1>

            <div>
                <Form action="edit">
                    <button type="submit">Edit</button>
                </Form>
                <Form
                    method="post"
                    action="destroy"
                    onSubmit={(event) => {
                        if (
                            // eslint-disable-next-line no-restricted-globals
                            !confirm(
                                'Please confirm you want to delete this record.'
                            )
                        ) {
                            event.preventDefault();
                        }
                    }}
                >
                    <button type="submit">Delete</button>
                </Form>
            </div>
        </div>
    </div>;
};

const Favorite: FC<{ project: Project }> = ({ project }) => {
    const fetcher = useFetcher();
    let favorite = project.favorite;
    if (fetcher.formData) {
        favorite = fetcher.formData.get('favorite') === 'true';
    }
    return (
        <fetcher.Form method="post">
            <button
                name="favorite"
                value={favorite ? 'false' : 'true'}
                aria-label={
                    favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                }
            >
                {favorite ? '★' : '☆'}
            </button>
        </fetcher.Form>
    );
};

export default ProjectItem;
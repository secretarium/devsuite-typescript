import { FC, useEffect } from 'react';
import { Outlet, NavLink, useLoaderData, useNavigation, useSubmit, LoaderFunction, Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { Project, getProjects } from '../data/projects';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? undefined;
    const projects = await getProjects(q);
    return { projects, q };
};

export const Root: FC = () => {

    const { logout } = useAuth();
    const { projects, q }: { projects: Project[], q?: string } = useLoaderData() as any;
    const navigation = useNavigation();
    const submit = useSubmit();

    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has(
            'q'
        );

    useEffect(() => {
        const qInput = document.getElementById('q') as HTMLInputElement;
        if (qInput && q)
            qInput.value = q;
    }, [q]);

    return (
        <>
            <div id="sidebar">
                <h1>Secretarium CC</h1>
                <div id="search-box">
                    <form id="search-form" role="search">
                        <input
                            id="q"
                            className={searching ? 'loading' : ''}
                            aria-label="Search contacts"
                            placeholder="Search"
                            type="search"
                            name="q"
                            defaultValue={q}
                            onChange={(event) => {
                                const isFirstSearch = q == null;
                                submit(event.currentTarget.form, {
                                    replace: !isFirstSearch
                                });
                            }}
                        />
                        <div
                            id="search-spinner"
                            aria-hidden
                            hidden={!searching}
                        />
                        <div
                            className="sr-only"
                            aria-live="polite"
                        ></div>
                    </form>
                </div>
                <Link to='/activity' id='activity'>Activity</Link>
                <nav>
                    {projects.length ? (
                        <ul>
                            {projects.map((project) => (
                                <li key={project.id}>
                                    <NavLink
                                        to={`contacts/${project.id}`}
                                        className={({ isActive, isPending }) =>
                                            isActive
                                                ? 'active'
                                                : isPending
                                                    ? 'pending'
                                                    : ''
                                        }
                                    >
                                        {project.name}<br />
                                        {project.organisation} / {project.repo}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>
                            <i onClick={() => { throw 'No projects'; }}>No projects</i>
                        </p>
                    )}
                </nav>
                <Link to='/project/new' id='add'>Add repository</Link>
                <button onClick={logout}>Log out</button>
            </div>
            <div id="detail" className={
                navigation.state === 'loading' ? 'loading' : ''
            }>
                <Outlet />
            </div>
        </>
    );
};

export default Root;
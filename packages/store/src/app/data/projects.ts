import localforage from 'localforage';
import { matchSorter } from 'match-sorter';
import sortBy from 'sort-by';

export type Project = {
    id: string;
    name: string;
    repo: string;
    organisation?: string;
    createdAt: number;
}

export async function getProjects(query?: string): Promise<Array<Project>> {
    let projects = await localforage.getItem<Array<Project>>('projects');
    if (!projects)
        projects = [];
    if (query) {
        projects = matchSorter(projects, query, { keys: ['first', 'last'] });
    }
    return projects.sort(sortBy('last', 'createdAt'));
}

export async function createProject() {
    const id = Math.random().toString(36).substring(2, 9);
    const project: Partial<Project> = { id, createdAt: Date.now() };
    const projects = await getProjects();
    projects.unshift(project as Project);
    await set(projects);
    return project;
}

export async function getProject(id?: string) {
    const projects = await localforage.getItem<Array<Project>>('projects');
    const project = projects?.find(project => project.id === id);
    return project ?? null;
}

export async function updateProject(id?: string, updates?: Partial<Project>) {
    const projects = await localforage.getItem<Array<Project>>('projects');
    const project = projects?.find(project => project.id === id);
    if (!projects || !project)
        throw new Error('No project found for');
    Object.assign(project, updates);
    await set(projects);
    return project;
}

export async function deleteProject(id?: string) {
    const projects = await localforage.getItem<Array<Project>>('projects');
    const index = projects?.findIndex(project => project.id === id) ?? null;
    if (projects && index !== null && index > -1) {
        projects.splice(index, 1);
        await set(projects);
        return true;
    }
    return false;
}

function set(projects: Array<Project>) {
    return localforage.setItem('projects', projects);
}

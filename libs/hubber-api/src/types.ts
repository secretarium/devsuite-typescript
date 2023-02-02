export type DeployementPayload = {
    class: string;
    type: string;
    repo: {
        url: string;
        owner: string;
        name: string;
    };
    commit: {
        url: string;
        ref: string;
        sha: string;
    },
    pullRequest?: {
        url: string;
        number: number;
    },
    pusher: {
        login: string;
        htmlUrl: string;
        avatarUrl: string;
    }
}
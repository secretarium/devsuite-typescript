export default async function () {
    // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
    // Hint: `globalThis` is shared between setup and teardown.
    globalThis.__RUNNING_BACKEND__?.kill();
}

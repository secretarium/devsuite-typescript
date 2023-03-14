import { FastifyInstance } from 'fastify';

const definitions = process.env.NX_DISPATCH_ENDPOINTS?.split(',') ?? [];
const endpoints = definitions.map(def => def.split('#')).filter(def => def.length === 2);

/* eslint-disable-next-line */
export interface AppOptions { }

export async function app(fastify: FastifyInstance) {

    fastify.log.info(endpoints, 'Preparing for enpoints');
    fastify.all('/hook', async (req, res) => {

        const responseRegister: Promise<[string, number]>[] = [];
        endpoints.forEach(([name, base]) => {
            responseRegister.push(new Promise(resolve => {
                setTimeout(() => {
                    resolve([name, 408]);
                }, 3000);
                fastify.log.debug(undefined, `Dispatching to ${name}`);
                const newHeaders = { ...req.headers };
                delete newHeaders.connection;
                delete newHeaders.host;
                fetch(base, {
                    method: req.method,
                    headers: newHeaders as Record<string, string>,
                    body: JSON.stringify(req.body)
                }).then((response: any) => {
                    fastify.log.debug(undefined, `Receiving response from ${name}`);
                    resolve([name, response.status]);
                }).catch(() => {
                    fastify.log.warn(undefined, `Failed to reach ${name}`);
                    resolve([name, 503]);
                });
            }));
        });

        const statuses = ((await Promise.allSettled(responseRegister)).filter(status => status.status === 'fulfilled') as PromiseFulfilledResult<[string, number]>[])
            .map(({ value }) => value)
            .reduce((prev, [base, outcome]) => {
                prev[base] = outcome;
                return prev;
            }, {} as Record<string, number>);

        res.status(Object.values(statuses).find(status => status === 200) ? 207 : 500).send({ ok: true, statuses });

    });
}
